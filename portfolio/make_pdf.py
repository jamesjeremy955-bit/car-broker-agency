#!/usr/bin/env python3
"""Render portfolio.html to Private_Client_Auction_Portfolio.pdf (US Letter landscape, backgrounds on).

Usage (from this folder):
    ../.venv/bin/python make_pdf.py
Optional: --png  also writes page previews to ./preview/ for visual QA.
"""
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

HERE = Path(__file__).parent
OUT = HERE / "Private_Client_Auction_Portfolio.pdf"



CHECK_JS = """() => [...document.querySelectorAll('section.page')].map((pg, i) => {
  const foot = pg.querySelector('.pf').getBoundingClientRect().top;
  const pageBox = pg.getBoundingClientRect();
  let low = 0, who = '';
  pg.querySelectorAll('*').forEach(el => {
    if (el.closest('.pf') || el.closest('.rh') || el.closest('.band')) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if (r.bottom > low) { low = r.bottom; who = el.className || el.tagName; }
  });
  const rightmost = Math.max(...[...pg.querySelectorAll('*')].map(e => e.getBoundingClientRect().right));
  return {page: i + 1, gap: Math.round(foot - low), who: String(who).slice(0, 30),
          pageOverflowX: Math.round(rightmost - pageBox.right)};
})"""


def layout_check(page) -> bool:
    ok = True
    for r in page.evaluate(CHECK_JS):
        flag = "OK " if r["gap"] >= 6 and r["pageOverflowX"] <= 1 else "BAD"
        ok &= flag == "OK "
        print(f"  [{flag}] page {r['page']}: {r['gap']}px clear above footer (lowest: {r['who']})")
    return ok

def main() -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        page = browser.new_page(viewport={"width": 1200, "height": 900})
        page.goto((HERE / "portfolio.html").as_uri(), wait_until="networkidle")
        page.evaluate("document.fonts.ready")
        page.wait_for_timeout(800)
        page.emulate_media(media="print")
        if not layout_check(page):
            raise SystemExit("Layout check failed: content overlaps footer or overflows page")
        page.pdf(
            path=str(OUT),
            width="11in",
            height="8.5in",
            print_background=True,
            prefer_css_page_size=True,
            margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
        )
        if "--png" in sys.argv:
            prev = HERE / "preview"
            prev.mkdir(exist_ok=True)
            page.emulate_media(media="screen")
            for i, el in enumerate(page.query_selector_all("section.page"), 1):
                el.screenshot(path=str(prev / f"page-{i}.png"))
        browser.close()
    print(f"wrote {OUT} ({OUT.stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
