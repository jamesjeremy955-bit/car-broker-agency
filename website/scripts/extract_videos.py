#!/usr/bin/env python3
"""Inspect every auction URL in portfolio/cars.json and extract embedded YouTube / Vimeo
walkaround & cold-start videos.

Strategy per listing (Bring a Trailer + Cars & Bids):
  1. plain HTTP fetch with a desktop UA (fast, works for server-rendered BaT markup)
  2. if that is blocked / yields nothing, render the page in headless Chrome (Playwright) so
     JS-injected embeds (Cars & Bids) are visible, and also scan <iframe>, <a>, <video>, <source>
     and JSON-LD / inline-script blobs.

Outputs (consumed by the site):
  website/data/videos.json     extraction report (id, provider, title, embed url, where it was found)
  website/js/videos-data.js    window.SM_VIDEOS = { <car id>: [ {id, provider, embed, watch, label, ...} ] }
                               (a plain script so the site also works when opened from file://)

Usage (from project root):
    .venv/bin/python website/scripts/extract_videos.py
"""
from __future__ import annotations

import html as htmllib
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CARS = ROOT / "portfolio" / "cars.json"
SITE = ROOT / "website"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36")

YT_PATTERNS = [
    r"youtube(?:-nocookie)?\.com/embed/([A-Za-z0-9_-]{11})",
    r"youtube\.com/watch\?[^\"'\s<>]*?v=([A-Za-z0-9_-]{11})",
    r"youtube\.com/(?:v|shorts)/([A-Za-z0-9_-]{11})",
    r"youtu\.be/([A-Za-z0-9_-]{11})",
    r"img\.youtube\.com/vi/([A-Za-z0-9_-]{11})",
    r"i\.ytimg\.com/vi(?:_webp)?/([A-Za-z0-9_-]{11})",
]
VM_PATTERNS = [
    r"player\.vimeo\.com/video/(\d{6,})",
    r"(?<![\w.])vimeo\.com/(?:channels/[\w-]+/|groups/[\w-]+/videos/)?(\d{6,})",
]


def normalise(raw: str) -> str:
    raw = htmllib.unescape(raw)
    return raw.replace("\\/", "/").replace("\\u0026", "&").replace("\\u002F", "/")


def find_videos(text: str) -> list[dict]:
    text = normalise(text)
    found: dict[tuple[str, str], dict] = {}
    for provider, pats in (("youtube", YT_PATTERNS), ("vimeo", VM_PATTERNS)):
        for pat in pats:
            for m in re.finditer(pat, text, flags=re.I):
                vid = m.group(1)
                ctx = text[max(0, m.start() - 70):m.end() + 30].replace("\n", " ")
                found.setdefault((provider, vid), {"provider": provider, "id": vid, "context": ctx})
    return list(found.values())


def http_fetch(url: str) -> tuple[int, str]:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en-US,en;q=0.9"})
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except Exception as e:  # noqa: BLE001
        code = getattr(e, "code", 0)
        return code, ""


def browser_fetch(urls: dict[str, str]) -> dict[str, str]:
    """Render each URL in headless Chrome; return concatenated DOM + frame/link/media attrs."""
    from playwright.sync_api import sync_playwright

    out: dict[str, str] = {}
    with sync_playwright() as p:
        b = p.chromium.launch(channel="chrome", headless=True)
        ctx = b.new_context(user_agent=UA, viewport={"width": 1400, "height": 900})
        for key, url in urls.items():
            page = ctx.new_page()
            blob = ""
            net: list[str] = []
            page.on("request", lambda r, net=net: net.append(r.url))
            try:
                page.goto(url, wait_until="domcontentloaded", timeout=45000)
                page.wait_for_timeout(3500)
                # scroll to trigger lazy embeds
                for _ in range(6):
                    page.mouse.wheel(0, 1800)
                    page.wait_for_timeout(500)
                blob = page.content()
                attrs = page.evaluate(
                    """() => [...document.querySelectorAll('iframe,a,video,source,[data-video],[data-src],[data-youtube-id],[data-vimeo-id]')]
                         .map(e => [e.src, e.href, e.dataset && Object.values(e.dataset).join(' ')].filter(Boolean).join(' ')).join('\\n')"""
                )
                blob += "\n" + attrs + "\n" + "\n".join(net)
            except Exception as e:  # noqa: BLE001
                print(f"    ! browser fetch failed for {key}: {e}", file=sys.stderr)
            finally:
                page.close()
            out[key] = blob
        b.close()
    return out


def oembed(provider: str, vid: str) -> dict:
    """Public oEmbed lookup: confirms the video is live + embeddable and gives its real title."""
    if provider == "youtube":
        target = f"https://www.youtube.com/watch?v={vid}"
        api = "https://www.youtube.com/oembed?format=json&url=" + urllib.parse.quote(target)
    else:
        api = "https://vimeo.com/api/oembed.json?url=" + urllib.parse.quote(f"https://vimeo.com/{vid}")
    try:
        req = urllib.request.Request(api, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=15) as r:
            j = json.loads(r.read())
        return {"title": j.get("title", ""), "author": j.get("author_name", ""),
                "thumb": j.get("thumbnail_url", ""), "embeddable": True}
    except Exception as e:  # noqa: BLE001
        code = getattr(e, "code", 0)
        # 401/403 => embedding disabled by owner; 404 => removed/private
        return {"title": "", "author": "", "thumb": "", "embeddable": False, "oembed_status": code}


def clean_label(title: str) -> str:
    """Site-safe label for a clip (house style: we never call these 'driving video')."""
    t = re.sub(r"(?i)\b(19|20)\d\d\b|\bporsche\b|\bbmw\b|\b911\b|\bcarrera s?\b|\be\d\d\b|\bm941\b|\bm491\b", "", title)
    low = title.lower()
    if re.search(r"cold start.*walk|start ?up.*walk|walk ?around", low):
        return "Cold-Start & Walkaround"
    if "cold start" in low:
        return "Cold Start"
    if "undercarriage" in low:
        return "Undercarriage Running" if "running" in low else "Undercarriage Inspection"
    if "start" in low and "rev" in low:
        return "Startup & Rev"
    if "top going down" in low:
        return "Convertible Top Operation"
    if "start" in low:
        return "Startup + Walkaround" if "walk" in low else "Startup Film"
    if "driving" in low:
        return "On-Road Footage"
    if "running" in low:
        return "Running Footage"
    if "pull" in low:
        return "Acceleration Pull"
    return re.sub(r"\s+", " ", t).strip() or "Listing Video"


PRIORITY = ["Cold-Start & Walkaround", "Startup + Walkaround", "Cold Start", "Startup & Rev", "Startup Film"]


def label_rank(label: str) -> int:
    return PRIORITY.index(label) if label in PRIORITY else len(PRIORITY)


def main() -> None:
    cfg = json.loads(CARS.read_text())
    cars = cfg["cars"]
    report: dict[str, dict] = {}
    need_browser: dict[str, str] = {}
    texts: dict[str, str] = {}

    for c in cars:
        url = c["listing_url"]
        status, text = http_fetch(url)
        vids = find_videos(text) if status == 200 else []
        print(f"[http {status or 'ERR'}] {c['id']:<36} {len(text):>8} bytes  videos={len(vids)}")
        texts[c["id"]] = text if status == 200 else ""
        # Cars & Bids is JS-rendered; BaT may be bot-gated. Re-check anything without a hit in a browser.
        if not vids:
            need_browser[c["id"]] = url

    if need_browser:
        print(f"\nRendering {len(need_browser)} listing(s) in headless Chrome ...")
        rendered = browser_fetch(need_browser)
        for k, blob in rendered.items():
            texts[k] += "\n" + blob
            print(f"[browser] {k:<36} {len(blob):>8} bytes  videos={len(find_videos(blob))}")

    site_videos: dict[str, list[dict]] = {}
    for c in cars:
        clips = []
        for v in find_videos(texts[c["id"]]):
            meta = oembed(v["provider"], v["id"])
            title = meta["title"]
            clips.append({
                "provider": v["provider"],
                "id": v["id"],
                "embed": (f"https://www.youtube-nocookie.com/embed/{v['id']}"
                          if v["provider"] == "youtube" else f"https://player.vimeo.com/video/{v['id']}"),
                "watch": (f"https://www.youtube.com/watch?v={v['id']}"
                          if v["provider"] == "youtube" else f"https://vimeo.com/{v['id']}"),
                "source_title": title,
                "author": meta["author"],
                "label": clean_label(title) if title else "Listing Video",
                "embeddable": meta["embeddable"],
                "found_in": v["context"],
            })
        clips.sort(key=lambda x: (label_rank(x["label"]), x["source_title"]))
        report[c["id"]] = {"title": c["title"], "platform": c["platform"],
                           "listing_url": c["listing_url"], "videos": clips}
        # de-duplicate labels within a car ("Pull Clip 1" etc. already unique; add counters otherwise)
        totals: dict[str, int] = {}
        for x in clips:
            totals[x["label"]] = totals.get(x["label"], 0) + 1
        seen: dict[str, int] = {}
        for x in clips:
            if totals[x["label"]] > 1:
                seen[x["label"]] = seen.get(x["label"], 0) + 1
                x["label"] = f"{x['label']} {seen[x['label']]}"
        site_videos[c["id"]] = [
            {k: x[k] for k in ("provider", "id", "embed", "watch", "label", "embeddable")}
            for x in clips
        ]

    (SITE / "data").mkdir(parents=True, exist_ok=True)
    (SITE / "js").mkdir(parents=True, exist_ok=True)
    (SITE / "data" / "videos.json").write_text(json.dumps(report, indent=2, ensure_ascii=False))
    (SITE / "js" / "videos-data.js").write_text(
        "/* Generated by scripts/extract_videos.py \u2014 do not edit by hand. */\n"
        "window.SM_VIDEOS = " + json.dumps(site_videos, indent=2, ensure_ascii=False) + ";\n")

    print("\n=== extraction summary ===")
    for k, v in report.items():
        ids = ", ".join(f"{x['id']} [{x['label']}{'' if x['embeddable'] else ' - EMBED RESTRICTED'}]"
                        for x in v["videos"]) or "none (gallery fallback)"
        print(f"  {k:<36} {ids}")
    print(f"\nwrote {SITE / 'data' / 'videos.json'} and {SITE / 'js' / 'videos-data.js'}")


if __name__ == "__main__":
    main()
