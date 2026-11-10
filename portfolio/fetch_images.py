#!/usr/bin/env python3
"""Fetch hero listing images for the portfolio into ./images.

* Bring a Trailer: plain HTTP, read <meta property="og:image"> from each listing page.
* Cars & Bids: auction pages sit behind a Cloudflare bot check, so we read the card
  thumbnails from the public seller profile pages using the installed Google Chrome
  (a normal browser session; no challenge bypassing) and upscale via the site's own
  image CDN width parameter.

Cars with no publicly resolvable listing are reported in images/manifest.json as
"missing" so the portfolio can show a placeholder instead of a wrong photo.

Usage (from this folder):
    ../.venv/bin/python fetch_images.py
"""
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

HERE = Path(__file__).parent
IMG_DIR = HERE / "images"
UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)


def http_get(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=40) as r:
        return r.read()


def save(car_id: str, data: bytes, ext: str = "jpg") -> str:
    path = IMG_DIR / f"{car_id}.{ext}"
    path.write_bytes(data)
    return f"images/{path.name}"


def fetch_bat(sources: dict, manifest: dict) -> None:
    for car_id, url in sources.items():
        try:
            html = http_get(url).decode("utf-8", "replace")
            m = re.search(r'<meta property="og:image" content="([^"]+)"', html)
            if not m:
                raise RuntimeError("no og:image found")
            img_url = m.group(1).split("?")[0]
            manifest[car_id] = {"status": "ok", "file": save(car_id, http_get(img_url)), "source": img_url}
            print(f"[BaT] {car_id}: {img_url}")
        except Exception as exc:  # noqa: BLE001
            manifest[car_id] = {"status": "error", "error": str(exc)}
            print(f"[BaT] {car_id}: FAILED {exc}", file=sys.stderr)
        time.sleep(1)


def fetch_cb(sources: dict, manifest: dict) -> None:
    from playwright.sync_api import sync_playwright

    by_profile: dict[str, dict] = {}
    for car_id, info in sources.items():
        by_profile.setdefault(info["profile"], {})[info["auction_id"]] = car_id

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        ctx = browser.new_context(user_agent=UA, viewport={"width": 1400, "height": 900})
        page = ctx.new_page()
        for profile, wanted in by_profile.items():
            page.goto(profile, wait_until="domcontentloaded", timeout=60000)
            page.wait_for_timeout(5000)
            cards = page.evaluate(
                """() => [...document.querySelectorAll('a[href^="/auctions/"]')]
                    .map(a => ({href: a.getAttribute('href'),
                                img: (a.querySelector('img') || {}).src || ''}))
                    .filter(c => c.img)"""
            )
            for auction_id, car_id in wanted.items():
                hit = next((c for c in cards if f"/auctions/{auction_id}/" in c["href"]), None)
                if not hit:
                    manifest[car_id] = {"status": "missing", "error": "card not found on profile"}
                    print(f"[C&B] {car_id}: card not found", file=sys.stderr)
                    continue
                big = re.sub(r"width=\d+,quality=\d+", "width=1600,quality=85", hit["img"])
                try:
                    data = http_get(big)
                except Exception:  # noqa: BLE001  fall back to the original size
                    data = http_get(hit["img"])
                    big = hit["img"]
                manifest[car_id] = {"status": "ok", "file": save(car_id, data), "source": big.split("?")[0]}
                print(f"[C&B] {car_id}: {big.split('?')[0]}")
            time.sleep(1)
        browser.close()


def main() -> None:
    cfg = json.loads((HERE / "cars.json").read_text())
    IMG_DIR.mkdir(exist_ok=True)
    manifest: dict = {}
    fetch_bat(cfg["bat_sources"], manifest)
    fetch_cb(cfg["cb_sources"], manifest)
    for car in cfg["cars"]:
        manifest.setdefault(
            car["id"],
            {"status": "missing", "error": "no public listing URL resolved; add one to cars.json"},
        )
    (IMG_DIR / "manifest.json").write_text(json.dumps(manifest, indent=2))
    ok = sum(1 for v in manifest.values() if v["status"] == "ok")
    print(f"\n{ok}/{len(cfg['cars'])} images saved. See images/manifest.json")


if __name__ == "__main__":
    main()
