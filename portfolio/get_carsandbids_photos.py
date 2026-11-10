import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
import urllib.request

TARGETS = [
    {
        "url": "https://carsandbids.com/auctions/3BZmWo85/2001-bmw-m3-coupe",
        "output": "images/car_2001_bmw_m3_coupe.jpg"
    },
    {
        "url": "https://carsandbids.com/auctions/98V24Ppv/2006-bmw-330i-sedan",
        "output": "images/car_2006_bmw_330i.jpg"
    }
]

async def run():
    Path("images").mkdir(exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        )
        page = await context.new_page()

        for item in TARGETS:
            print(f"[*] Loading: {item['url']}")
            try:
                await page.goto(item['url'], wait_until="networkidle", timeout=60000)
                await asyncio.sleep(2)
                
                # Try og:image first
                img_url = await page.get_attribute('meta[property="og:image"]', 'content')
                
                # If not found or generic, grab hero image element from DOM
                if not img_url or "default" in img_url:
                    img_elem = page.locator('.hero-image img, .auction-hero img, .gallery-item img').first
                    if await img_elem.count() > 0:
                        img_url = await img_elem.get_attribute('src')

                if img_url:
                    print(f"[✔] Found URL: {img_url}")
                    # Download using request headers
                    req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req) as resp, open(item['output'], 'wb') as f:
                        f.write(resp.read())
                    print(f"[✔] Successfully saved to {item['output']}")             else:
                    print(f"[!] Could not locate hero image on {item['url']}")
            except Exception as e:
                print(f"[✖] Error on {item['url']}: {e}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
