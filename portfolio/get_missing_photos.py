import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
import urllib.request

TARGETS = [
    {
        "filename": "images/car_2001_bmw_m3_coupe.jpg",
        "url": "https://carsandbids.com/auctions/3BZmWo85/2001-bmw-m3-coupe"
    },
    {
        "filename": "images/car_2006_bmw_330i.jpg",
        "url": "https://carsandbids.com/auctions/98V24Ppv/2006-bmw-330i-sedan"
    },
    {
        "filename": "images/car_1994_dodge_viper.jpg",
        "url": "https://bringatrailer.com/listing/1994-dodge-viper-rt-10-82/"
    }
]

async def scrape_images():
    Path("images").mkdir(exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
        page = await context.new_page()

        for item in TARGETS:
            print(f"[*] Navigating to {item['url']}...")
            try:
                await page.goto(item['url'], wait_until="domcontentloaded", timeout=45000)
                await asyncio.sleep(2)
                
                # Try finding og:image tag
                og_image = await page.get_attribute('meta[property="og:image"]', 'content')
                if not og_image:
                    og_image = await page.get_attribute('meta[name="twitter:image"]', 'content')

                if og_image:
                    print(f"[✔] Found image URL: {og_image}")
                    urllib.request.urlretrieve(og_image, item['filename'])
                    print(f"[✔] Saved to {item['filename']}")
                else:
                    print(f"[!] Could not find og:image for {item['url']}")
            except Exception as e:
                print(f"[✖] Failed on {item['url']}: {e}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(scrape_images())
