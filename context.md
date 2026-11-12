# SCHER MASELLA MOTORCARS — Project Blueprint & Business Context

## 1. Brand Identity & Positioning
- **Official Brand Name:** SCHER MASELLA MOTORCARS
- **Official Subtitle:** *Private Client Auction Advisory & Collector Vehicle Brokerage*
- **Principals:** Jeremy Scher & Giada Masella
- **Primary Domain:** `schermasellamotorcars.com`
- **Market Positioning:** Luxury real-estate-style private client advisory (modeled after JLL, Witkoff, Sotheby’s International Realty, and The Agency) applied to enthusiast and collector motorcars. Not a traditional used car dealership lot—we sell representation, bespoke curation, market timing, and above-market results.
- **Core Specialization:** Manual-Transmission Enthusiast-Spec & Desirable Collector Cars (sports cars, analog driver's cars, and modern-classic performance icons where mechanical provenance and buyer engagement dictate premium results).
- **Execution Channels:** Global/International Auction Platforms & Direct Private Client Network (`Global Auctions & Private Network`). We do not box ourselves in as solely a Bring a Trailer or Cars & Bids middleman.

---

## 2. Core Business Logic & Copywriting Rules
### A. Bespoke Curation Philosophy ("No Cookie-Cutter Templates")
- Every vehicle and deal is unique. Rather than applying a rigid, one-size-fits-all checklist, we custom-curate each vehicle's preparation, detail documentation, and narrative story around what matters most for that specific car, pairing it with the ideal selling channel.
- **Case-by-Case Services (No Blanket Claims):** Do **NOT** advertise undercarriage lift inspections, paint-meter readings, tire date codes, or Porsche Certificate of Authenticity (CoA) verification as blanket rules applied to every single car. Those are performed case-by-case when warranted by the specific asset.

### B. Strict Copy & Terminology Restrictions
- **NO "Driving Video" Mention:** Never use the phrase `"driving video"` on the website, video clip labels, or PDF. Always refer to videos as **"4K Cold-Start & Walkaround Films"** or **"Documented Cold Starts & Walkarounds"**.
- **NO Personal Platform Handles:** Never display old personal auction usernames (`@jamesjeremy955`, `@Blinker_Nah`, `@jscher1`) or `"Dual-Platform Syndicate"` on the website or PDF. All branding must route through **SCHER MASELLA MOTORCARS** (`schermasellamotorcars.com`).
- **NO Personalized Client Names on Universal Assets:** Do not include `"Randy"`, `"Dodge Viper Advantage"`, or `"CONFIDENTIAL"` watermarks on the universal Offering Memorandum PDF or website.
- **Terminology Replacements:**
  - Avoid overusing `"institutional"` in headlines (e.g., Hero headline is *"Private Client Representation for Collector & Enthusiast Motorcars."* and Results Ledger headline is *"The proven track record."*).
  - Avoid using `"defense"` or `"defended"` in the PDF specialization and closing callouts.
  - Use `"international"` instead of `"national"` when describing auction reach.
  - On the PDF closing callout, avoid repeating the word `"strategy"` twice: *"The next step is a brief conversation about the asset's history, condition and objectives, followed by a recommended selling strategy, schedule, and valuation target."*

### C. The 4-Pillar Advisory Advantage
1. **01. Forensic Photo & Cold-Start Video Suite:** 120+ studio-grade high-resolution photos, engine bay and mechanical detail documentation, and 4K cold-start & walkaround films tailored to the specific vehicle.
2. **02. Bespoke Deal Curation & Collector Storytelling:** Custom-tailored narrative copywriting, factory option decoding, provenance research, and chronological maintenance ledger presentation specific to what drives value for that exact asset.
3. **03. 24/7 Live Auction Moderation & Q&A Management:** Round-the-clock technical Q&A management in the comment thread during auction week to eliminate buyer hesitation and ignite final-hour bidding wars.
4. **04. Settlement & White-Glove Hand-Off:** Flexible transaction settlement tailored to client preference (verified wire, certified bank instrument, or attorney escrow) followed by insured enclosed transport logistics.

---

## 3. Verified Track Record & Vehicle Data
- **Total Verified Auction Volume:** **$284,153+** (**$286,153+** including Private Network Placement on the E39 M5)
- **Featured Enthusiast Transactions:** **10**
- **Reserve & Sale Integrity:** **100%**
- **Featured Case Study ("The Private Network Backstop"):** 2000 BMW E39 M5 (Le Mans Blue / 6-Speed) reached a $22,000 high bid on Bring a Trailer (reserve not met). Scher Masella Motorcars immediately stepped in and sold the car post-auction via our private client network for **$24,000**—proving we protect client downside and beat the auction high bid when needed.

### Master 10-Vehicle Roster (Ranked by Price)
1. **1985 Porsche 911 Carrera Coupe (Factory M491 Turbo-Look)** — **$91,000** (Sold on BaT • Manual • CoA & factory widebody provenance curation)
2. **2013 Porsche 911 Carrera S Coupe (991.1)** — **$51,000** (Sold on BaT • PDK replacement documentation & Sport Chrono spec highlight)
3. **1994 Dodge Viper RT/10 (8.0L V10 / 6-Speed)** — **$35,251** (Sold on BaT • Manual • Note: No embedded YouTube video; links directly to BaT photo gallery)
4. **2000 BMW E39 M5 Sedan (S62 V8 / 6-Speed)** — **$22,000** BaT High Bid → **Sold post-auction via our private client network for $24,000** (Manual)
5. **2010 BMW 535i xDrive Sports Wagon (6-Speed Manual)** — **$20,150** (Sold on C&B • Manual • 11,900+ Views / 57 Bids purist bidding war)
6. **2001 BMW E46 M3 Coupe (6-Speed Manual)** — **$19,250** (Sold on C&B • Manual • S54 inline-6 • 14,300+ Views / 36 Bids)
7. **2003 BMW E46 M3 Convertible** — **$13,800** (Sold on C&B • S54 inline-6 • 53 Bids)
8. **2016 BMW 328d xDrive Sports Wagon** — **$12,402** (Sold on C&B • 8-Speed Automatic • 5,200+ Views / 31 Bids)
9. **2008 BMW 335i Sport Sedan (6-Speed Manual)** — **$9,800** (Sold on BaT • Manual • No Reserve)
10. **2006 BMW 330i Sport Sedan (6-Speed Manual)** — **$9,500** (Sold on C&B • Manual • Private Client Representation)

---

## 4. Workspace Architecture & Core Modules
Project Root: `~/Developer/car-broker-agency`

### Module 1: Public Brokerage Website (`website/`)
- **Core Files:** `website/index.html`, `website/css/styles.css`, `website/js/app.js`, `website/js/cars-data.js`, `website/js/videos-data.js`, `website/data/videos.json`.
- **Self-Contained Assets:** Holds `website/images/` (all 10 scraped vehicle photos) and `website/Private_Client_Auction_Portfolio.pdf` (synced copy of the 7-page OM PDF).
- **Video Extraction Engine (`website/scripts/extract_videos.py`):** Extracts verified YouTube walkaround/cold-start embeds across the 9 applicable listings (19 clips total) and powers the in-page Cinema Modal.
- **Hero Copy (platform list intentionally removed):** H1 *"Private Client Representation for Collector & Enthusiast Motorcars."* Subheadline *"We represent owners of enthusiast-spec cars—specializing in manual-transmission and desirable collector vehicles—engineering top-of-market results."* The Hero does not name Bring a Trailer / Cars & Bids; platforms appear only as per-vehicle facts in the Track Record and Ledger. Hero fact strip reads `Channels: Auction • Private`. Results Ledger heading: *"The proven track record."*
- **Track Record Filtering:** `All Transactions (10)` | `Porsche & Exotic (3)` | `BMW M & Manual Icons (7)` | `Bring a Trailer (5)` | `Cars & Bids (5)`.
- **Private Client Valuation & Consignment Intake Form (`#valuation`):**
  - **Zero Pre-Filled Placeholders:** All input fields must have NO `placeholder="..."` attributes; inputs render completely blank under uppercase labels.
  - **MANDATORY fields (the only inputs allowed to carry `required` or block validation):**
    - `FIRST NAME` (`firstName`) and `LAST NAME` (`lastName`) — side-by-side row, auto-capitalized on blur
    - `PHONE` (`phone` + country dial-code selector `dial`) and `EMAIL` (`email`) — side-by-side row
    - `YEAR` (`year`, numeric, `maxlength="4"`, valid 1886 to next year), `MAKE` (`make`), `MODEL` (`model`) — 3-column row (`1fr 1.5fr 2fr`, stacked on mobile)
  - **OPTIONAL fields (never `required`, never block submission):** `TRANSMISSION` (default `6-Speed Manual`, never `Other`), `SPECIFY TRANSMISSION` (only appears when `Other / Custom Specification` is chosen), `MILEAGE (OPTIONAL)`, `VIN (OPTIONAL)` (no Carfax / listing-link wording), `TARGET NET PAYOUT (OPTIONAL)`.
  - **Phone (smart US + worldwide):** Searchable country-code combobox (`website/js/countries.js`, all ~229 ITU-T E.164 calling codes, no "Other Intl +" option). `US/CA +1` is pinned first and is the default, then a divider and the full A–Z list (`IL +972 (Israel)`, `UK +44 (United Kingdom)`…). Typing a country name, ISO code or `+972` filters the list. US/CA mode live-formats `(XXX) XXX-XXXX`, drops a leading `1` on 11 digits, requires exactly 10 digits; 7 digits shows *"Please include your 3-digit area code."* Every other country takes 8–15 digits total (E.164). Typing `+972…` (or any `+code`) in the number box auto-selects the matching country; `+1…` returns to US/CA. Saved/sent as the full number, e.g. `+1 (786) 512-1264` or `+44 20 7946 0921`.
  - **Auto-suggest (typeahead, custom entry always allowed):** Year list 2026→1950 filtered by typed prefix; Make from a collector-marque dictionary; Model coordinated with the entered Make (full Porsche / BMW / Dodge / Ferrari / Mercedes-Benz / Lamborghini / Ford / Chevrolet / Toyota / Acura / Nissan etc. catalogs). Dictionaries live in `website/js/vehicle-data.js`. Capitalization is normalized on blur/submit (`porsche` → `Porsche`, `bmw` → `BMW`, `carrera` → `Carrera`, `gt3 rs` → `GT3 RS`).
  - **Transmission coordination (Year + Make + Model matrix in `app.js`):** The list is recalculated whenever Year, Make or Model changes and the #1 historically accurate option is auto-selected; `Other / Custom Specification` is always last (aftermarket conversions). A deliberate manual pick survives only while it is still valid for the new car. Examples: Porsche Cayenne 2011+ → 8-Speed Tiptronic S only (rare 6-speed manual only on 2011–14 non-Turbo); Macan → 7-Speed PDK (EV for Macan Electric); Panamera → PDK / Tiptronic; Taycan → 2-Speed Automatic (EV); Carrera GT / 997 GT3 & GT3 RS / Viper / E39 M5 / Z8 / 1M → manual only; 918 / 991 GT3 RS & GT2 RS → 7-Speed PDK only; 991.1 GT3 PDK only, 991.2/992 GT3 add the 6-Speed GT Sport Manual; 911 by era (G-body, 964, 993, 996/997.1, 997.2, 991, 992); BMW M3/M4/M5/M2/328d by chassis and year; Ferrari (550 manual only, 1995–2009 Open-Gate or F1, 2010+ DCT only), Lamborghini (Gallardo/Murciélago Open-Gate or E-Gear, Huracán LDF, Aventador ISR, Revuelto/Urus automatic), McLaren (SSG DCT only, F1 6-speed manual). Unknown models fall back to a make-level list, then a universal list (default `6-Speed Manual`).
  - **Why (markup decision):** High-net-worth owners browsing on a phone rarely have the 17-digit VIN on hand, and a form that blocks on it loses the lead. Target net payout reveals the seller's expectations before the first call but stays optional so unsure sellers can still submit.
  - **Confirmation card:** Sentence uses the properly capitalized vehicle (e.g. *2003 Porsche 911 Carrera*). Four guaranteed cells: `REFERENCE`, `VEHICLE`, `TRANSMISSION`, `CLIENT CONTACT` (formatted phone + email). `MILEAGE`, `VIN` and `TARGET NET PAYOUT` cells render **only if filled** — never "Not provided".
  - **Email delivery (live):** On submit the UI shows the confirmation instantly (works offline), then the lead is POSTed as a normal form (`https://formsubmit.co/{target}`) into a dynamically created hidden `<iframe>` — FormSubmit's `/ajax/` endpoint silently ignores `_autoresponse`, so never use it. Target is chosen by `location.hostname`: `0ecea8ca9bbd5a60ecb61b9e66f509ff` on `localhost` / `127.0.0.1`, `jamesjeremy955@gmail.com` on `schermasellamotorcars.com`; `window.SM_FORM_ENDPOINT` (e-mail, alias or URL) overrides both. Fields: `_subject` = `New Valuation Inquiry [Ref: …] — {year} {make} {model}`, `email` / `_replyto` = client email, `_autoresponse`, `_template: table`, `_captcha: false`, plus reference/name/phone/vehicle/transmission/optionals. Every submission is stored in `localStorage` (`sm_valuation_requests`, `sent: true/false`); unsent entries are retried when the browser comes back online or on the next page load. Honeypot `_honey` suppresses sending for bots.
  - **FormSubmit activation (one-time):** The first real submission on the live domain triggers a FormSubmit activation email to the destination inbox; click **Activate/Confirm** once, otherwise leads (and client auto-responses) are not delivered. Run one test submission after deploying.
- **Local Preview & Deployment:** Must be previewed via local HTTP server (`http://127.0.0.1:8765/index.html`), never `file://`, so YouTube embeds play inside the cinema modal. Deployed on Vercel/Netlify with Root Directory set to `website/`.

### Module 2: 7-Page PDF Offering Memorandum (`portfolio/`)
- **Core Files:** `portfolio/build_portfolio.py` (master generator), `portfolio/portfolio.html`, `portfolio/Private_Client_Auction_Portfolio.pdf`, `portfolio/cars.json`, `portfolio/images/`.
- **7-Page Structure:**
  - **Page 01/07 (Cover):** Masthead (`SCHER MASELLA MOTORCARS`), Specialization (`Manual-Transmission Enthusiast-Spec & Desirable Collector Cars.`), and 3 metric boxes (`TOTAL VOLUME MANAGED: $284,153`, `RESERVE TRANSPARENCY: 100%`, `EXECUTION CHANNELS: Global & Private`).
  - **Page 02/07 – 03/07:** Selected Transactions & Flagship Case Studies.
  - **Page 04/07 (Thesis & Curation Recap Page):** `OUR THESIS & CURATION PHILOSOPHY` — *"We Specialize in Manual-Transmission, Collectible & Timeless Enthusiast Cars."* Explains our focus on enduring value and why every deal receives bespoke preparation rather than a cookie-cutter template.
  - **Page 05/07:** `SECTION 03: Additional Transactions`.
  - **Page 06/07:** Full Historical Results Ledger Table (including the exact E39 M5 sub-note: *"Sold post-auction via our private client network for $24,000."*).
  - **Page 07/07:** Advisory Approach (4 Pillars, closing callout box, and `SCHER MASELLA MOTORCARS • schermasellamotorcars.com`).

### Module 3: Custom BrokerIDE & Sourcing Engine
- **Environment:** Custom Electron BrokerIDE launched via `Cmd + Shift + B` inside the workspace with nationwide region selection and automated sourcing scripts.