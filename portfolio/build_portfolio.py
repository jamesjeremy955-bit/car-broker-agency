#!/usr/bin/env python3
"""Render portfolio.html (landscape Offering-Memorandum style) from cars.json.

Usage (from this folder):
    ../.venv/bin/python build_portfolio.py
"""
import json
import sys
from html import escape
from pathlib import Path

HERE = Path(__file__).parent
cfg = json.loads((HERE / "cars.json").read_text())
manifest_path = HERE / "images" / "manifest.json"
manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}

BRAND = "SCHER RODRIGUEZ MOTORGROUP"
TAGLINE = "Private Client Auction Advisory & Collector Vehicle Brokerage"
DOC_TITLE = f"{BRAND} \u2022 {TAGLINE.upper()}"
TOTAL_PAGES = 7

# ---- data, strictly sorted by hammer price -------------------------------------------
cars = sorted(cfg["cars"], key=lambda c: -c["price"])
for i, c in enumerate(cars, 1):
    c["rank"] = i

sold = [c for c in cars if c["result"] == "Sold"]
bids = [c for c in cars if c["result"] != "Sold"]
sold_total = sum(c["price"] for c in sold)
bid_total = sum(c["price"] for c in bids)
volume_total = sold_total + bid_total
bat = [c for c in cars if c["platform"] == "BaT"]
cb = [c for c in cars if c["platform"] != "BaT"]

# guard rails: headline figures must match what the business is asserting
assert volume_total == 284_153, volume_total
assert (len(cars), len(sold), len(bids)) == (10, 9, 1), (len(cars), len(sold), len(bids))
EXPECTED_ORDER = [91000, 51000, 35251, 22000, 20150, 19250, 13800, 12402, 9800, 9500]
assert [c["price"] for c in cars] == EXPECTED_ORDER

missing_images = []


def money(n: int) -> str:
    return f"${n:,}"


def img_for(car):
    rel = car.get("image") or manifest.get(car["id"], {}).get("file")
    if rel and (HERE / rel).exists():
        return rel
    missing_images.append(f'{car["title"]} ({rel or "no image configured"})')
    return None


def plat_name(c) -> str:
    return "Bring a Trailer" if c["platform"] == "BaT" else "Cars &amp; Bids"


def plat_cls(c) -> str:
    return "bat" if c["platform"] == "BaT" else "cb"


def photo(car) -> str:
    src = img_for(car)
    if src:
        return f'<img src="{escape(src)}" alt="{escape(car["title"])}">'
    return '<div class="ph"><span>Photograph to be supplied</span></div>'


def title_html(car) -> str:
    t = escape(car["title"])
    return f'<a href="{escape(car["listing_url"])}">{t}</a>' if car["listing_url"] else t


def card(car, variant="") -> str:
    bullets = "".join(f"<li>{escape(h)}</li>" for h in car["highlights"])
    date = escape(car["date"]) if car["date"] else "&mdash;"
    res = "Closed Sale" if car["result"] == "Sold" else "High Bid"
    res_cls = "sold" if car["result"] == "Sold" else "bid"
    return f"""
    <article class="card {variant}">
      <div class="shot">{photo(car)}<span class="idx">{car["rank"]:02d}</span></div>
      <div class="cbody">
        <div class="kicker"><span class="dot {plat_cls(car)}"></span>{plat_name(car)}</div>
        <h3>{title_html(car)}</h3>
        <div class="sub">{escape(car["subtitle"])}</div>
        <div class="facts">
          <div><div class="fl">Hammer Price</div><div class="fv price">{money(car["price"])}</div></div>
          <div><div class="fl">Outcome</div><div class="fv res {res_cls}">{res}</div></div>
          <div><div class="fl">Date</div><div class="fv">{date}</div></div>
        </div>
        <ul class="hl">{bullets}</ul>
      </div>
    </article>"""


def chrome(n: int, section: str) -> str:
    """Running header + footer for interior pages."""
    return f"""
  <div class="rh"><span>{BRAND}</span><span>{section}</span></div>
  <footer class="pf"><span>{escape(DOC_TITLE)}</span><span>{n:02d} / {TOTAL_PAGES:02d}</span></footer>"""


def heading(eyebrow: str, title: str, lede: str = "") -> str:
    l = f'<p class="lede">{lede}</p>' if lede else ""
    return f'<header class="hd"><div class="eyebrow">{eyebrow}</div><h2>{title}</h2>{l}</header>'


hero = cars[0]
hero_src = img_for(hero)
top3, mid4, last3 = cars[:3], cars[3:7], cars[7:]
thesis_car = next(c for c in cars if "viper" in c["id"])
thesis_img = img_for(thesis_car) or ""
manual_n = sum(1 for c in cars if "manual" in (c["subtitle"] + " " + " ".join(c["highlights"])).lower() or "5-speed" in " ".join(c["highlights"]).lower())

# ---- ledger ---------------------------------------------------------------------------
maxp = max(c["price"] for c in cars)
ledger_rows = "".join(
    f"""<tr><td class="n">{c["rank"]:02d}</td>
    <td class="v">{escape(c["title"])}<small>{escape(c["subtitle"])}</small>{f'<span class="pnote">{escape(c["post_auction_note"])}</span>' if c.get("post_auction_note") else ""}</td>
    <td><span class="dot {plat_cls(c)}"></span>{'BaT' if c['platform'] == 'BaT' else 'C&amp;B'}</td>
    <td class="o {'sold' if c['result'] == 'Sold' else 'bid'}">{'Sold' if c['result'] == 'Sold' else 'High Bid'}</td>
    <td class="bar"><i style="width:{c['price'] / maxp * 100:.1f}%" class="{'' if c['result'] == 'Sold' else 'hb'}"></i></td>
    <td class="r">{money(c["price"])}</td></tr>"""
    for c in cars
)
avg_sale = round(sold_total / len(sold))


def split_row(label, items):
    tot = sum(c["price"] for c in items)
    return f"""<div class="srow"><div><div class="fl">{label}</div><div class="sv">{money(tot)}</div></div>
    <div class="sn">{len(items)} results</div></div>"""


PILLARS = [
    ("01", "Forensic Photo &amp; Video Suite",
     "Comprehensive high-resolution photography, engine bay and mechanical detail documentation, and documented cold "
     "starts, delivering full cosmetic transparency so condition is established before bidders have to ask."),
    ("02", "Collector Storytelling",
     "Listings written for the people who actually bid: provenance, specification, ownership history and what makes "
     "the car desirable, presented to the standard enthusiast buyers expect."),
    ("03", "24/7 Auction-Week Moderation",
     "Comments decide a seven-day auction. Questions receive fast, factual and transparent answers, skeptics receive "
     "documentation, and the seller&rsquo;s voice stays consistent through the final bid."),
    ("04", "Settlement &amp; White-Glove Hand-off",
     "Transaction settlement is tailored to client preference&mdash;whether coordinated via verified wire, certified "
     "bank instrument, or attorney escrow&mdash;followed by insured nationwide transport coordination to ensure secure completion."),
]
glance_html = "".join(
    f'<div><div class="t">{photo(c)}</div><div class="p">{money(c["price"])}</div><div class="c">{escape(c["title"])}</div></div>'
    for c in cars
)
pillar_html = "".join(
    f'<div class="pil"><div class="pn">{n}</div><h3>{t}</h3><p>{d}</p></div>' for n, t, d in PILLARS
)

contact = cfg.get("contact") or {}
contact_bits = [escape(v) for v in (contact.get("name"), contact.get("email"), contact.get("phone")) if v]
contact_html = f'<div class="contact">{" &nbsp;|&nbsp; ".join(contact_bits)}</div>' if contact_bits else ""

CSS = """
:root{
  --navy:#0b1d31; --navy2:#13293f; --ink:#16212c; --text:#46525e; --mute:#7b8691;
  --rule:#d7dbe0; --rule2:#b9c0c8; --paper:#ffffff; --tint:#f3f4f6; --brass:#a9843c; --brass2:#c9a55a; --green:#1f7a5c;
}
@page{ size:11in 8.5in; margin:0 }
*{ box-sizing:border-box; margin:0; padding:0 }
html{ -webkit-print-color-adjust:exact; print-color-adjust:exact }
body{ background:#cfd3d8; color:var(--text); font-family:'Inter','Helvetica Neue',Arial,sans-serif; font-size:11px; line-height:1.5;
      -webkit-font-smoothing:antialiased }
a{ color:inherit; text-decoration:none }
.page{ width:11in; height:8.5in; margin:22px auto; position:relative; overflow:hidden; background:var(--paper);
       padding:.82in .7in .78in; break-after:page; page-break-after:always }
.page:last-child{ break-after:auto; page-break-after:auto }
@media print{ body{background:none} .page{ margin:0 } }

/* running chrome */
.rh{ position:absolute; left:.7in; right:.7in; top:.34in; display:flex; justify-content:space-between;
     font-size:7.5px; letter-spacing:.22em; text-transform:uppercase; color:var(--mute); font-weight:600;
     padding-bottom:7px; border-bottom:1px solid var(--rule) }
.pf{ position:absolute; left:.7in; right:.7in; bottom:.3in; display:flex; justify-content:space-between;
     font-size:7px; letter-spacing:.14em; text-transform:uppercase; color:var(--mute);
     padding-top:7px; border-top:1px solid var(--rule) }
.pf span:last-child{ white-space:nowrap }

.eyebrow{ font-size:8px; letter-spacing:.3em; text-transform:uppercase; color:var(--brass); font-weight:700 }
.hd{ display:grid; grid-template-columns:auto 1fr; column-gap:36px; align-items:end; margin-bottom:17px;
     padding-bottom:13px; border-bottom:2px solid var(--navy) }
.hd .eyebrow{ grid-column:1 / -1; margin-bottom:7px }
.hd h2{ font-size:29px; font-weight:300; color:var(--navy); letter-spacing:-.01em; line-height:1.05 }
.hd .lede{ font-size:10.5px; color:var(--text); line-height:1.55; max-width:4.6in; justify-self:end; text-align:left }

/* ---------------- cover ---------------- */
.page.cover{ padding:0; background:var(--paper) }
.band{ position:relative; height:5.3in; background:var(--navy); overflow:hidden }
.band img{ width:100%; height:100%; object-fit:cover; display:block; object-position:50% 62% }
.band::after{ content:""; position:absolute; inset:0;
  background:linear-gradient(90deg,rgba(11,29,49,.93) 0%,rgba(11,29,49,.78) 38%,rgba(11,29,49,.05) 72%),
             linear-gradient(0deg,rgba(11,29,49,.55),transparent 35%) }
.band .top{ position:absolute; z-index:2; left:.7in; right:.7in; top:.42in; display:flex; justify-content:space-between;
            font-size:8px; letter-spacing:.3em; text-transform:uppercase; color:rgba(255,255,255,.82); font-weight:600 }
.band .ttl{ position:absolute; z-index:2; left:.7in; bottom:.55in; width:6in; color:#fff }
.band .rule{ width:54px; height:3px; background:var(--brass2); margin-bottom:20px }
.band h1{ font-size:37px; font-weight:300; letter-spacing:.035em; line-height:1.12; text-transform:uppercase }
.band h1 + .s{ margin-top:16px; font-size:13px; font-weight:500; letter-spacing:.2em; text-transform:uppercase; color:#e6d5ac; line-height:1.55 }
.band .cap{ position:absolute; z-index:2; right:.7in; bottom:.4in; text-align:right; color:#fff }
.band .cap .k{ font-size:7.5px; letter-spacing:.24em; text-transform:uppercase; color:#e6d5ac; font-weight:600 }
.band .cap .t{ font-size:12px; font-weight:500; margin-top:3px }
.band .cap .p{ font-size:22px; font-weight:300; margin-top:1px }
.cov-body{ display:grid; grid-template-columns:5.35in 1fr; column-gap:.55in; padding:.3in .7in 0 }
.spec{ border-left:3px solid var(--brass); background:var(--tint); padding:18px 22px 20px }
.spec .lab{ font-size:8px; letter-spacing:.28em; text-transform:uppercase; color:var(--brass); font-weight:700; margin-bottom:6px }
.spec .hl1{ font-size:15.5px; font-weight:600; color:var(--navy); line-height:1.3; margin-bottom:8px }
.spec p{ font-size:11px; line-height:1.65; color:var(--ink) }
.mets{ display:grid; grid-template-columns:1fr 1fr; gap:0 18px }
.met{ padding:3px 0 8px; border-top:1px solid var(--navy) }
.met .v{ font-size:25px; font-weight:300; color:var(--navy); letter-spacing:-.01em; line-height:1.15; margin-top:5px }
.met .l{ font-size:7.5px; letter-spacing:.17em; text-transform:uppercase; color:var(--ink); font-weight:700; margin-top:3px }
.met .d{ font-size:8.8px; color:var(--mute); line-height:1.4; margin-top:2px }
.met.wide{ grid-column:1 / -1 }
.met.wide .v{ font-size:31px }
.cov-fine{ position:absolute; left:.7in; right:.7in; bottom:.62in; font-size:7.2px; color:var(--mute); line-height:1.5 }
.page.cover .pf{ }

/* ---------------- cards ---------------- */
.card{ display:flex; flex-direction:column; background:#fff; min-width:0 }
.shot{ position:relative; background:var(--tint); overflow:hidden; border-radius:3px }
.shot img{ width:100%; height:100%; object-fit:cover; display:block }
.ph{ width:100%; height:100%; display:flex; align-items:center; justify-content:center;
     background:repeating-linear-gradient(135deg,#eef0f2 0 10px,#e6e9ec 10px 20px); color:var(--mute);
     font-size:8px; letter-spacing:.2em; text-transform:uppercase }
.idx{ position:absolute; left:0; top:0; background:var(--navy); color:#fff; font-size:10px; font-weight:600;
      letter-spacing:.1em; padding:5px 10px }
.cbody{ padding:11px 0 0; border-top:3px solid var(--navy); margin-top:-3px; position:relative }
.shot + .cbody{ border-top:none; margin-top:0 }
.kicker{ font-size:7.5px; letter-spacing:.22em; text-transform:uppercase; font-weight:700; color:var(--ink); margin-bottom:5px }
.dot{ display:inline-block; width:6px; height:6px; border-radius:50%; margin-right:7px; vertical-align:middle; position:relative; top:-1px }
.dot.bat{ background:var(--brass) } .dot.cb{ background:var(--green) }
.card h3{ font-size:16px; font-weight:500; color:var(--navy); line-height:1.2; letter-spacing:-.005em }
.card .sub{ font-size:9.6px; color:var(--mute); margin-top:2px }
.facts{ display:grid; grid-template-columns:1.15fr 1.1fr .9fr; gap:10px; margin-top:10px; padding:8px 0;
        border-top:1px solid var(--rule); border-bottom:1px solid var(--rule) }
.fl{ font-size:6.8px; letter-spacing:.16em; text-transform:uppercase; color:var(--mute); font-weight:600 }
.fv{ font-size:10px; color:var(--ink); font-weight:600; margin-top:2px; line-height:1.3 }
.fv.price{ font-size:19px; font-weight:300; color:var(--navy); letter-spacing:-.01em; line-height:1.05 }
.fv.res.sold{ color:var(--green) } .fv.res.bid{ color:var(--brass) }
.hl{ list-style:none; margin-top:9px }
.hl li{ position:relative; padding-left:12px; font-size:9.6px; line-height:1.5; color:var(--text); margin-bottom:3px }
.hl li::before{ content:""; position:absolute; left:0; top:.62em; width:6px; height:1px; background:var(--brass) }

.g3{ display:grid; grid-template-columns:repeat(3,1fr); gap:.3in }
.g3 .shot{ height:2.75in }
.g3 .hl li{ font-size:10.4px; margin-bottom:5px }
.g3 h3{ font-size:17.5px }
.g2{ display:grid; grid-template-columns:1fr 1fr; gap:.34in .35in }
.g2 .card{ flex-direction:row; gap:.2in }
.g2 .shot{ width:2.6in; flex:none; height:2.5in }
.g2 .hl li{ font-size:10px; margin-bottom:4px }
.g2 .cbody{ flex:1 }
.g2 .facts{ grid-template-columns:1fr 1fr; row-gap:6px }
.g2 .facts > div:nth-child(3){ display:none }
.g2 .fv.price{ font-size:17px }

/* platform strip */
.strip{ position:absolute; left:.7in; right:.7in; bottom:.72in; display:grid; grid-template-columns:repeat(3,1fr); gap:.3in;
        padding-top:11px; border-top:2px solid var(--navy) }
.srow{ display:flex; justify-content:space-between; align-items:flex-end }
.sv{ font-size:21px; font-weight:300; color:var(--navy); margin-top:1px }
.sn{ font-size:8.5px; color:var(--mute) }

/* ledger */
.lay{ display:grid; grid-template-columns:1fr 2.65in; column-gap:.45in }
table{ width:100%; border-collapse:collapse }
th{ white-space:nowrap; font-size:7px; letter-spacing:.18em; text-transform:uppercase; color:var(--mute); font-weight:700; text-align:left;
    padding:0 8px 7px; border-bottom:1px solid var(--navy) }
th.r{ text-align:right }
td{ padding:9.4px 8px; border-bottom:1px solid var(--rule); font-size:10px; color:var(--ink); vertical-align:middle }
td.n{ color:var(--mute); width:30px; font-weight:600 }
td.v{ font-weight:600; color:var(--navy); font-size:10.6px } td.v small{ display:block; font-weight:400; color:var(--mute); font-size:8.4px; margin-top:1px }
.pnote{ display:inline-block; margin-top:4px; font-size:7.6px!important; font-weight:600!important; letter-spacing:.02em; color:var(--green)!important;
         background:#e8f3ee; border:1px solid #bfdccf; border-radius:2px; padding:2px 6px }
td.o{ font-size:8px; letter-spacing:.14em; text-transform:uppercase; font-weight:700 }
td.o.sold{ color:var(--green) } td.o.bid{ color:var(--brass) }
td.bar{ width:1.45in } td.bar i{ display:block; height:5px; background:var(--navy) } td.bar i.hb{ background:var(--brass2) }
td.r{ text-align:right; font-weight:600; color:var(--navy); font-size:11.4px; width:.85in }
tr.tot td{ border-bottom:none; border-top:2px solid var(--navy); padding-top:10px; font-weight:700; color:var(--navy); font-size:11px }
.side .blk{ border-top:2px solid var(--navy); padding:10px 0 12px; margin-bottom:6px }
.side .big{ font-size:30px; font-weight:300; color:var(--navy); line-height:1.1; letter-spacing:-.01em; margin-top:3px }
.side .srow{ padding:8px 0; border-bottom:1px solid var(--rule) }
.side .srow:last-child{ border-bottom:none }
.side .note{ font-size:8.4px; color:var(--mute); line-height:1.55; margin-top:6px }

/* final page: content box is exactly the space between running header and footer */
.p6{ height:6.9in; display:flex; flex-direction:column; justify-content:space-between; overflow:hidden }
.p6 > *{ flex:none; margin-top:0!important }
.p6 .hd{ margin-bottom:0 }
.glance, .close, .pils, .pil, .card, .met, .srow{ break-inside:avoid; page-break-inside:avoid }
/* glance */
.glance{ padding-bottom:2px }
.glance h4{ font-size:7.5px; letter-spacing:.24em; text-transform:uppercase; color:var(--mute); font-weight:700; margin-bottom:8px;
            padding-bottom:6px; border-bottom:1px solid var(--rule) }
.gl{ display:grid; grid-template-columns:repeat(10,1fr); gap:8px }
.gl .t{ height:.56in; background:var(--tint); overflow:hidden; border-radius:3px }
.gl .t img{ width:100%; height:100%; object-fit:cover; display:block }
.gl .t .ph{ font-size:0 }
.gl .p{ font-size:9.5px; font-weight:600; color:var(--navy); margin-top:4px }
.gl .c{ font-size:6.8px; color:var(--mute); line-height:1.3; letter-spacing:.02em }
/* advisory */
.pils{ display:grid; grid-template-columns:repeat(4,1fr); gap:.3in }
.pil{ border-top:3px solid var(--navy); padding-top:12px }
.pn{ font-size:40px; font-weight:200; color:var(--brass); line-height:1; margin-bottom:12px; letter-spacing:-.02em }
.pil h3{ font-size:15.5px; font-weight:600; color:var(--navy); line-height:1.25; margin-bottom:8px; min-height:2.5em }
.pil p{ font-size:10.4px; line-height:1.62; color:var(--text) }
.close{ margin-top:.3in; display:grid; grid-template-columns:1fr 3.7in; column-gap:.4in; background:var(--navy); color:#fff; padding:.3in .4in }
.close h3{ font-size:22px; font-weight:300; line-height:1.25; letter-spacing:-.005em }
.close p{ font-size:10px; line-height:1.65; color:#cfd8e1; margin-top:8px }
.close .contact{ margin-top:10px; font-size:10px; font-weight:600; color:#e6d5ac; letter-spacing:.05em }
.close h4{ font-size:7.5px; letter-spacing:.24em; text-transform:uppercase; color:#e6d5ac; font-weight:700; margin-bottom:8px }
.close ul{ list-style:none; font-size:9.2px; line-height:1.9 }
.close a{ border-bottom:1px solid rgba(255,255,255,.3); color:#fff }
.close .fp{ font-size:7.4px; color:#9fb0c1; margin-top:8px; line-height:1.5 }
/* thesis page */
.thesis .hd h2{ font-size:33px }
.th-main{ display:grid; grid-template-columns:3.9in 1fr; column-gap:.5in; align-items:stretch }
.th-shot{ position:relative; height:2.55in; border-radius:3px; overflow:hidden; background:var(--tint) }
.th-shot img{ width:100%; height:100%; object-fit:cover; display:block }
.th-cap{ position:absolute; left:0; bottom:0; background:var(--navy); color:#fff; font-size:8px; letter-spacing:.16em; text-transform:uppercase; font-weight:600; padding:7px 12px }
.th-copy{ border-left:3px solid var(--brass); padding-left:.3in; display:flex; flex-direction:column; justify-content:center }
.th-lead{ font-size:17px; font-weight:300; line-height:1.4; color:var(--navy); margin-bottom:12px; letter-spacing:-.005em }
.th-copy p:not(.th-lead){ font-size:11px; line-height:1.7; color:var(--ink) }
.th-pts{ display:grid; grid-template-columns:repeat(3,1fr); gap:.3in }
.th-pt{ border-top:3px solid var(--navy); padding-top:11px }
.th-pt .pn{ font-size:30px; margin-bottom:8px }
.th-pt h3{ font-size:14.5px; font-weight:600; color:var(--navy); margin-bottom:6px; line-height:1.25 }
.th-pt p{ font-size:10.2px; line-height:1.6; color:var(--text) }
.th-stats{ display:grid; grid-template-columns:repeat(3,1fr); gap:.3in; background:var(--navy); color:#fff; padding:.2in .35in }
.th-stats .v{ font-size:25px; font-weight:300; letter-spacing:-.01em; line-height:1.1 }
.th-stats .l{ font-size:8px; letter-spacing:.14em; text-transform:uppercase; color:#e6d5ac; font-weight:600; margin-top:5px; line-height:1.45 }
"""

p1 = f"""
<section class="page cover">
  <div class="band">{f'<img src="{escape(hero_src)}" alt="{escape(hero["title"])}">' if hero_src else ''}
    <div class="top"><span>Transaction Memorandum</span><span>November 2026</span></div>
    <div class="ttl"><div class="rule"></div>
      <h1>Scher Rodriguez<br>Motorgroup</h1>
      <div class="s">&bull; Private Client Auction Advisory &amp;<br>&nbsp;&nbsp;Collector Vehicle Brokerage</div></div>
    <div class="cap"><div class="k">Top Transaction &middot; Bring a Trailer</div><div class="t">{escape(hero["title"])}</div><div class="p">{money(hero["price"])}</div></div>
  </div>
  <div class="cov-body">
    <div class="spec"><div class="lab">Specialization</div>
      <div class="hl1">Manual-Transmission Enthusiast-Spec &amp; Desirable Collector Cars.</div>
      <p>We specialize in the curation, preparation, and international auction marketing and private placement of
      manual-transmission sports cars, rare collector specifications, and modern-classic performance icons where
      mechanical provenance and enthusiast engagement dictate premium hammer pricing.</p></div>
    <div class="mets">
      <div class="met"><div class="l">Total Volume Managed</div><div class="v">{money(volume_total)}</div>
        <div class="d">Across {len(cars)} featured auctions ({len(sold)} closed sales + {len(bids)} high bid)</div></div>
      <div class="met"><div class="l">Reserve Transparency</div><div class="v">100%</div><div class="d">Status stated plainly on every listing</div></div>
    </div>
  </div>
  <div class="cov-fine">Volume reflects auction results: {money(sold_total)} in closed sales plus one {money(bid_total)} final high bid (reserve not met). The post-auction private placement of that vehicle is noted separately and is not included in volume. Prices as reported on Bring a Trailer and Cars &amp; Bids.</div>
  <footer class="pf"><span>{escape(DOC_TITLE)}</span><span>01 / {TOTAL_PAGES:02d}</span></footer>
</section>"""

p2 = f"""
<section class="page">{chrome(2, "Flagship Transactions")}
  {heading("Section 01", "Flagship Transactions", "The three highest hammer prices in the portfolio, spanning air-cooled and modern Porsche and an American V10 icon.")}
  <div class="g3">{''.join(card(c) for c in top3)}</div>
</section>"""

p3 = f"""
<section class="page">{chrome(3, "Selected Transactions")}
  {heading("Section 02", "Selected Transactions", "Modern-classic performance cars and enthusiast wagons: buyers who know exactly what they want.")}
  <div class="g2">{''.join(card(c) for c in mid4)}</div>
</section>"""

p4 = f"""
<section class="page">{chrome(4, "Our Focus")}
  <div class="p6 thesis">
  {heading("Our Focus &bull; Why Enthusiast-Spec Assets Command a Premium", "Manual-Transmission, Collectible &amp; Timeless Driver&rsquo;s Cars.")}
  <div class="th-main">
    <div class="th-shot"><img src="{escape(thesis_img)}" alt="{escape(thesis_car["title"])}"><span class="th-cap">{escape(thesis_car["title"])} &middot; {money(thesis_car["price"])}</span></div>
    <div class="th-copy">
      <p class="th-lead">Scher Rodriguez Motorgroup specializes in manual-transmission, analog, and rare enthusiast-spec vehicles&mdash;timeless machines that hold enduring value.</p>
      <p>Every deal is unique. Rather than applying a rigid, one-size-fits-all template, we take the time to curate each vehicle&rsquo;s preparation, documentation, and narrative around what makes that specific asset special&mdash;leveraging both international auction platforms and our private client network to achieve the highest possible return.</p>
    </div>
  </div>
  <div class="th-pts">
    <div class="th-pt"><div class="pn">01</div><h3>Enduring, Enthusiast-Led Value</h3><p>Analog drivetrains, factory specifications and honest provenance are finite. Informed enthusiasts pay for them, and the best examples keep their appeal long after the hammer falls.</p></div>
    <div class="th-pt"><div class="pn">02</div><h3>Curated, Never Templated</h3><p>No two cars are prepared alike. Photography, documentation, option decoding and storytelling are built around the specific history and specification that matter most for that exact vehicle.</p></div>
    <div class="th-pt"><div class="pn">03</div><h3>Two Routes to Market</h3><p>International auction platforms create competitive price discovery; our private client network provides a direct path when the right buyer is already known&mdash;or when an auction falls just short.</p></div>
  </div>
  <div class="th-stats">
    <div><div class="v">{manual_n} of {len(cars)}</div><div class="l">Featured transactions with a manual transmission</div></div>
    <div><div class="v">{money(volume_total)}</div><div class="l">Total volume managed across {len(cars)} featured transactions</div></div>
    <div><div class="v">$24,000</div><div class="l">Private-network sale of the E39 M5 after a $22,000 auction high bid</div></div>
  </div>
  </div>
</section>"""

p5 = f"""
<section class="page">{chrome(5, "Additional Transactions")}
  {heading("Section 03", "Additional Transactions", "Consistent, transparent execution across the full price range.")}
  <div class="g3">{''.join(card(c) for c in last3)}</div>
  <div class="strip">
    {split_row("Bring a Trailer Volume", bat)}
    {split_row("Cars &amp; Bids Volume", cb)}
    {split_row("Total Volume Managed", cars)}
  </div>
</section>"""

p6 = f"""
<section class="page">{chrome(6, "Results Ledger")}
  {heading("Section 04", "Results Ledger", "All featured auctions ranked by hammer price.")}
  <div class="lay">
    <table>
      <tr><th>No.</th><th>Vehicle</th><th>Platform</th><th>Outcome</th><th></th><th class="r">Hammer Price</th></tr>
      {ledger_rows}
      <tr class="tot"><td></td><td colspan="4">Total Volume Managed &middot; {len(cars)} auctions ({len(sold)} closed + {len(bids)} high bid)</td><td class="r">{money(volume_total)}</td></tr>
    </table>
    <aside class="side">
      <div class="blk"><div class="fl">Total Volume Managed</div><div class="big">{money(volume_total)}</div></div>
      <div class="srow"><div><div class="fl">Closed Sales ({len(sold)})</div><div class="sv">{money(sold_total)}</div></div></div>
      <div class="srow"><div><div class="fl">High Bid, Reserve Not Met ({len(bids)})</div><div class="sv">{money(bid_total)}</div></div></div>
      <div class="srow"><div><div class="fl">Average Closed Sale</div><div class="sv">{money(avg_sale)}</div></div></div>
      <div class="srow"><div><div class="fl">Top Transaction</div><div class="sv">{money(cars[0]["price"])}</div></div></div>
      <div class="note">Gold bar denotes an auction high bid where reserve was not met; the later private placement is noted in the ledger and excluded from auction volume. All other results are closed sales.</div>
    </aside>
  </div>
</section>"""

p7 = f"""
<section class="page">{chrome(7, "Advisory Approach")}
  <div class="p6">
  {heading("Section 05", "Advisory Approach", "How we maximize your return at every stage of the auction.")}
  <div class="pils">{pillar_html}</div>
  <div class="glance"><h4>Portfolio at a Glance</h4><div class="gl">{glance_html}</div></div>
  <div class="close">
    <div><h3>Every transaction is prepared, managed, and closed with the same uncompromising discipline.</h3>
      <p>The next step is a brief conversation about the asset&rsquo;s history, condition and objectives, followed by a recommended selling strategy, schedule, and valuation target.</p>{contact_html}</div>
    <div><h4>Execution Channels</h4><ul><li>International Auction Platforms</li><li>Private Client Network</li><li>schermasellamotorcars.com</li></ul></div>
  </div>
  </div>
</section>"""

html = f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(DOC_TITLE)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700&display=swap" rel="stylesheet">
<style>{CSS}</style></head>
<body>{p1}{p2}{p3}{p4}{p5}{p6}{p7}</body></html>"""

(HERE / "portfolio.html").write_text(html)
print(f"portfolio.html written. Closed {money(sold_total)} + high bid {money(bid_total)} = {money(volume_total)}")
for m in sorted(set(missing_images)):
    print(f"WARNING: no image file for {m}", file=sys.stderr)
