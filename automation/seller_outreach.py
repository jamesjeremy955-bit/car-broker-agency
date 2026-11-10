import sys
import json
import asyncio
import random
from pathlib import Path
from playwright.async_api import async_playwright
from sqlite_utils import Database

SESSION_DIR = Path(__file__).resolve().parent.parent / "data" / "playwright_profile"
DB_PATH = Path(__file__).resolve().parent.parent / "data" / "leads.sqlite"

def get_tracked_leads():
    try:
        db = Database(str(DB_PATH))
        if "leads" not in db.table_names():
            return {}
        return {row.get("listing_url"): row.get("status") for row in db["leads"].rows}
    except Exception:
        return {}

INJECTED_FB_OVERLAY_JS = """
((trackedData) => {
    // 1. Remove floating chat dock
    function purgeDock() {
        const docks = document.querySelectorAll(`
            div[data-pagelet="DockChat"],
            div[aria-label*="Chats" i],
            div[aria-label*="Messages" i],
            div[role="region"][aria-label*="chat" i],
            div[role="dialog"][aria-label*="Active now" i],
            div[class*="x10l6tqk"][class*="x1vjfegm"]
        `);
        docks.forEach(d => {
            if (!d.closest('#fb-broker-panel') && !d.closest('#broker-preview-card')) {
                d.remove();
            }
        });
    }
    purgeDock();
    const dockObs = new MutationObserver(purgeDock);
    dockObs.observe(document.body, { childList: true, subtree: true });

    // 2. Hover Quick-Peek Preview Card
    let previewBox = document.getElementById('broker-preview-card');
    if (!previewBox) {
        previewBox = document.createElement('div');
        previewBox.id = 'broker-preview-card';
        previewBox.style.cssText = `
            position: fixed; display: none; z-index: 999999999;
            width: 320px; background: #18181b; border: 2px solid #3b82f6;
            border-radius: 10px; padding: 14px; box-shadow: 0 12px 35px rgba(0,0,0,0.9);
            color: white; font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            pointer-events: none; transition: opacity 0.15s ease;
        `;
        document.body.appendChild(previewBox);
    }

    if (window.__fbBrokerOverlayActive) {
        window.__trackedLeads = trackedData;
        return;
    }
    window.__fbBrokerOverlayActive = true;
    window.__trackedLeads = trackedData;

    // 3. Stager Panel
    const panel = document.createElement('div');
    panel.id = 'fb-broker-panel';
    panel.style.cssText = `
        position: fixed; bottom: 24px; right: 24px; z-index: 99999999;
        background: #18181b; border: 2px solid #2563eb; border-radius: 12px;
        padding: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.85);
        color: white; font-family: system-ui, -apple-system, sans-serif; width: 310px;
    `;
    panel.innerHTML = `
        <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">Facebook Broker Outreach</div>
        <div style="font-size: 11px; color: #a1a1aa; margin-bottom: 8px;">
            <span style="color:#ef4444; font-weight:bold;">● Red</span>: Messaged &nbs|&nbsp; 
            <span style="color:#eab308; font-weight:bold;">● Yellow</span>: Follow Up &nbsp;|&nbsp;
            <span style="color:#60a5fa; font-weight:bold;">● Blue</span>: Selected
        </div>
        <div style="font-size: 12px; color: #d4d4d8; margin-bottom: 10px;">
            Single-click card to <strong>Select</strong>. Double-click opens listing.
        </div>
        <div style="font-size: 13px; color: #e4e4e7; margin-bottom: 12px;">
            Selected: <span id="fb-broker-count" style="color: #60a5fa; font-weight: bold; font-size: 16px;">0</span> listings
        </div>
        <button id="fb-broker-send-btn" style="
            width: 100%; background: #2563eb; border: none; color: white;
            padding: 10px; border-radius: 6px; font-weight: 600; cursor: pointer;
            font-size: 13px;
        ">Dispatch Inquiries to Selected</button>
    `;
    document.body.appendChild(panel);

    window.__fbSelected = new Set();

    function decorateCards() {
        const carddocument.querySelectorAll('a[href*="/marketplace/item/"]');
        const tracked = window.__trackedLeads || {};

        cards.forEach(card => {
            const href = card.href;
            const match = href.match(/\\/marketplace\\/item\\/([0-9]+)/);
            const itemId = match ? match[1] : null;
            const status = (itemId && tracked[itemId]) || tracked[href];

            if (status === 'sent') {
                card.style.outline = '4px solid #ef4444';
                card.style.outlineOffset = '-4px';
                if (!card.querySelector('.broker-tag-red')) {
                    const tag = document.createElement('div');
                    tag.className = 'broker-tag-red';
                    tag.innerText = 'MESSAGED';
                    tag.style.cssText = `
                        position: absolute; top: 10px; left: 10px; z-index: 99999;
                        background: #ef4444; color: white; font-size: 10px; font-weight: 800;
                        padding: 3px 7px; border-radius: 4px; pointer-events: none;
                    `;
                    card.style.position = 'relative';
                    card.prepend(tag);
                }
                return;
            }

            if (card.dataset.brokerDecorated) return;
            card.dataset.brokerDecorated = "true";
            card.style.position = 'relative';
            card.style.cursor = 'pointer';

            // Hover quick-peek tooltip
            card.addEventListener('mouseenter', () => {
                const textLines = (card.innerText || '').split('\\n').filter(t => t.trim().length > 0);
                const title = textLines[1] || textLines[0] || 'Target Vehicle';
                const price = textLines[0] && textLines[0].includes('$') ? textLines[0] : (textLines[1] || 'Price Unlisted');
                const location = textLines[2] || 'Local Listing';

                previewBox.innerHTML = `
                    <div style="font-size: 13px; font-weight: 700; color: #60a5fa; margin-bottom: 4px;">${title}</div>
                    <div style="font-size: 14px; font-weight: 800; color: #10b981; margin-bottom: 6px;">${price}</div>
                    <div style="font-size: 11px; color: #a1a1aa; margin-bottom: 6px;">📍 ${location}</div>
                    <div style="font-size: 11px; line-height: 1.4; color: #e4e4e7; border-top: 1px solid #3f3f46; padding-top: 6px;">
                        Quick Inspection Mode: Click once to stage inquiry, double-click to view raw post.
                    </div>
                `;
                previewBox.style.display = 'block';
            });

            card.addEventListener('mousemove', (e) => {
                let x = e.clientX + 18;
                let y = e.clientY + 18;
                if (x + 330 > window.innerWidth) x = e.clientX - 335;
                if (y + 160 > window.innerHeight) y = e.clientY - 160;
                previewBox.style.left = `${x}px`;
                previewBox.style.top = `${y}px`;
            });

            card.addEventLister('mouseleave', () => {
                previewBox.style.display = 'none';
            });

            card.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (window.__fbSelected.has(href)) {
                    window.__fbSelected.delete(href);
                    card.style.outline = 'none';
                } else {
                    window.__fbSelected.add(href);
                    card.style.outline = '4px solid #2563eb';
                    card.style.outlineOffset = '-4px';
                }
                document.getElementById('fb-broker-count').innerText = window.__fbSelected.size;
            });

            card.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                window.open(href, '_blank');
            });
        });
    }

    decorateCards();
    const cardObs = new MutationObserver(decorateCards);
    cardObs.observe(document.body, { childList: true, subtree: true });

    document.getElementById('fb-broker-send-btn').addEventListener('click', () => {
        const payload = Array.from(window.__fbSelected);
        if (payload.length === 0) {
            alert("No listings selected. Click any vehicle cards first.");
            return;
        }
        window.__fbPayloadReady = payload;
        window.__fbSelected.clear();
        document.getElementById('fb-broker-count').innerText = '0';
    });
})
"""

async def process_single_listing(context, item_url: str, outreach_message: str, db: Database):
    print(f"[*] Navigating to listing: {item_url}")
    tab = await context.new_page()
    status_label = "failed"

    try:
        await tab.goto(item_url, wait_until="domcontentloaded", timeout=45000)
        await asyncio.sleep(random.uniform(2.5, 3.5))

        msg_btn = tab.locator('div[aria-label="Message" i][role="button"], div[aria-label="Message again" i][role="button"]').first
        if await msg_btn.count() > 0 and await msg_btn.is_visible():
            await msg_btn.click()
            await asyncio.sleep(random.uniform(1.5, 2.5))

        limit_banner = tab.locator('text="You\'ve reached the messaging limit"').first
        if await limit_banner.count() > 0 and await limit_banner.is_visible():
            print(f"[!] Rate limit flag hit on: {item_url}")
            ok_btn = tab.locator('div[role="button"]:has-text("OK"), button:has-text("OK")').first
            if await ok_btn.count() > 0:
                await ok_btn.click()
            status_label = "rate_limited"
            return

        dialog = tab.locator('div[role="dialog"]').last
        scope = dialog if await dialog.count() > 0 else tab
        input_field = scope.locator('textarea, div[role="textbox"]').last

        if await input_field.count() > 0:
            await input_field.click()
            await asyncio.sleep(0.3)

            await tab.keyboard.press("Meta+A")
            await tab.keyboard.press("Backspace")
            await asyncio.sleep(0.2)
            await input_field.press_sequentially(outreach_message, delay=random.randint(16, 28))
            await asyncio.sleep(0.8)

            send_btn = scope.locator('div[aria-label="Send message" i], div[aria-label="Send" i][role="button"], button:has-text("Send message")').last
            if await send_btn.count() > 0:
                await send_btn.scroll_into_view_if_needed()
                await send_btn.click()
            else:
                await tab.keyboard.press("Enter")

            await asyncio.sleep(random.uniform(3.0, 4.2))

            if await tab.locator('text="You\'ve reached the messaging limit"').count() > 0:
                print(f"[!] Rate limit blocked message on: {item_url}")
                status_label = "rate_limited"
                ok_btn = tab.locator('div[role="button"]:has-text("OK"), button:has-text("OK")').first
                if await ok_btn.count() > 0:
                    await ok_btn.click()
            else:
                status_label = "sent"
                print(f"[✔] Successfully messagedeller on: {item_url}")

    except Exception as e:
        print(f"[!] Error on {item_url}: {e}")
    finally:
        db["leads"].insert({
            "platform": "Facebook Marketplace",
            "listing_url": item_url,
            "status": status_label,
            "notes": outreach_message
        }, alter=True)
        await asyncio.sleep(1.0)
        await tab.close()

async def run_facebook_outreach(payload: dict):
    target_url = payload.get("url", "https://www.facebook.com/marketplace")
    outreach_message = payload.get("prompt", "What is your lowest?")

    SESSION_DIR.mkdir(parents=True, exist_ok=True)
    db = Database(str(DB_PATH))

    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(
            user_data_dir=str(SESSION_DIR),
            headless=False,
            viewport={"width": 1420, "height": 920},
            args=["--disable-blink-features=AutomationControlled"]
        )
        
        main_page = context.pages[0] if context.pages else await context.new_page()
        print(f"[*] Search page loading: {target_url}")

        try:
            await main_page.goto(target_url, wait_until="domcontentloaded", timeout=60000)
        except Exception:
            pass

        async def inject_visual_overlay():
            try:
                tracked = get_tracked_leads()
                await main_page.evaluate(f"({INJECTED_FB_OVERLAY_JS})({json.dumps(tracked)})")
            except Exception:
                pass

        await inject_visual_overlay()
        main_page.on("framenavigated", lambda frame: asyncio.create_task(inject_visual_overlay()) if frame == main_page.main_frame else None)

        print("[*] Ready: Single-click tile to select. Hover for preview. Double-click to open.")

        while not main_page.is_closed():
            try:
                is_ready = await main_page.evaluate("() => Boolean(window.__fbPayloadReady)")
            except Exception:
                await asyncio.sleep(1)
                continue

            if is_ready:
                selected_urls = await main_page.evaluate("() => window.__fbPayloadReady")
                await main_page.evaluate("() => { window.__fbPayloadReady = null; }")
                print(f"[*] Processing {len(selected_urls)} listing(s) sequentially...")

                for item_url in selected_urls:
                    await process_single_listing(context, item_url, outreach_message, db)
                    await main_page.bring_to_front()
                    await asyncio.sleep(random.uniform(2.0, 3.5))

                print("[*] Batch completed. Updating card outlines...")
                await inject_visual_overlay()

            await asyncio.sleep(1)

        await context.close()

if __name__ == "__main__":
    data = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
    asyncio.run(run_facebook_outreach(data))
