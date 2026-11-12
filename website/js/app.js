/* SCHER MASELLA MOTORCARS — site behaviour (no dependencies) */
(function () {
  "use strict";

  var CARS = window.SM_CARS || [];
  var VIDEOS = window.SM_VIDEOS || {};
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var IS_FILE = location.protocol === "file:";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = function (n) { return "$" + Number(n).toLocaleString("en-US"); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); };
  var carById = function (id) { return CARS.filter(function (c) { return c.id === id; })[0]; };
  var platName = function (c) { return c.platform === "bat" ? "Bring a Trailer" : "Cars & Bids"; };
  var hasVideo = function (id) { return (VIDEOS[id] || []).length > 0; };

  /* ---------- nav ---------- */
  (function nav() {
    var navEl = $("#nav"), toggle = $("#navToggle"), links = $("#navLinks");
    var onScroll = function () { navEl.classList.toggle("is-stuck", window.scrollY > 8); };
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      links.classList.toggle("is-open", open);
    });
    $$("a", links).forEach(function (a) {
      a.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false"); links.classList.remove("is-open");
      });
    });
    // current-section highlight
    var map = {};
    $$("a", links).forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && map[e.target.id]) {
            $$("a", links).forEach(function (a) { a.classList.remove("is-current"); });
            map[e.target.id].classList.add("is-current");
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
    }
  })();

  /* ---------- count-up metrics ---------- */
  (function counters() {
    var els = $$("[data-count]");
    var fmt = function (el, v) { return (el.dataset.prefix || "") + Math.round(v).toLocaleString("en-US") + (el.dataset.suffix || ""); };
    if (REDUCED || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var el = e.target, end = +el.dataset.count, t0 = performance.now(), dur = 1400;
        (function tick(t) {
          var p = Math.min(1, (t - t0) / dur), eased = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(el, end * eased);
          if (p < 1) requestAnimationFrame(tick); else el.textContent = fmt(el, end);
        })(t0);
      });
    }, { threshold: .6 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- cinema modal ---------- */
  var cinema = (function () {
    var root = $("#cinema"), stage = $("#cinemaStage"), clipsEl = $("#cinemaClips");
    var title = $("#cinemaTitle"), meta = $("#cinemaMeta"), listing = $("#cinemaListing"), yt = $("#cinemaYT");
    var opener = null, state = { car: null, idx: 0 };

    function render() {
      var car = state.car, list = VIDEOS[car.id] || [], clip = list[state.idx];
      title.textContent = car.title;
      meta.textContent = platName(car) + " \u00b7 " + (car.outcome === "bid" ? "High Bid " + money(car.price) + " \u2192 " + money(car.final) + " Private" : money(car.price));
      listing.href = car.url;
      stage.innerHTML = "";
      if (!clip) {
        yt.hidden = true;
        stage.innerHTML = fallbackHTML(car, "Film not embedded on this listing", "Browse the full photo gallery on the live auction page.", car.url, "Open Live Auction");
      } else {
        yt.hidden = false; yt.href = clip.watch;
        if (IS_FILE || !clip.embeddable) {
          stage.innerHTML = fallbackHTML(car, clip.label,
            IS_FILE ? "Inline playback needs the site served over http(s). Open the film on YouTube, or host the site to watch in this window."
                    : "The owner has restricted embedding for this film.", clip.watch, "\u25B6 Watch on YouTube");
        } else {
          var f = document.createElement("iframe");
          f.src = clip.embed + "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
          f.title = car.title + " \u2014 " + clip.label;
          f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
          f.referrerPolicy = "strict-origin-when-cross-origin";
          f.allowFullscreen = true;
          stage.appendChild(f);
        }
      }
      clipsEl.innerHTML = "";
      if (list.length > 1) {
        list.forEach(function (c, i) {
          var b = document.createElement("button");
          b.type = "button"; b.textContent = c.label; b.setAttribute("aria-pressed", String(i === state.idx));
          b.addEventListener("click", function () { state.idx = i; render(); });
          clipsEl.appendChild(b);
        });
      }
    }
    function fallbackHTML(car, h, p, href, label) {
      return '<div class="cinema__fallback" style="background-image:url(\'' + esc(car.image) + '\')"><div><h4>' + esc(h) + '</h4><p>' + esc(p) +
        '</p><a class="btn btn--primary" href="' + esc(href) + '" target="_blank" rel="noopener">' + label + '</a></div></div>';
    }
    function open(carId, trigger) {
      var car = carById(carId); if (!car) return;
      opener = trigger || document.activeElement; state = { car: car, idx: 0 };
      render(); root.hidden = false; document.body.classList.add("is-locked");
      $(".cinema__close", root).focus();
    }
    function close() {
      if (root.hidden) return;
      root.hidden = true; stage.innerHTML = ""; document.body.classList.remove("is-locked");
      if (opener && opener.focus) opener.focus();
    }
    root.addEventListener("click", function (e) { if (e.target.closest("[data-close]")) close(); });
    document.addEventListener("keydown", function (e) {
      if (root.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "Tab") {           // simple focus trap
        var f = $$("button, a[href], iframe", root).filter(function (el) { return !el.hidden && el.offsetParent !== null; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    // any element with data-video-car opens the modal
    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-video-car]");
      if (t) { e.preventDefault(); open(t.getAttribute("data-video-car"), t); }
    });
    return { open: open, close: close };
  })();

  /* ---------- hero reel ---------- */
  (function reel() {
    var root = $("#reel"); if (!root) return;
    var slides = $$(".reel__slide", root), tabs = $$(".reel__tabs button", root), play = $("#reelPlay");
    var i = 0, timer = null;
    function go(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle("is-active", k === i); s.setAttribute("aria-hidden", String(k !== i)); });
      tabs.forEach(function (t, k) { t.classList.toggle("is-active", k === i); t.setAttribute("aria-selected", String(k === i)); });
      // restart the progress bar animation
      var active = tabs[i]; active.classList.remove("is-active"); void active.offsetWidth; active.classList.add("is-active");
    }
    function start() { if (REDUCED) return; stop(); root.classList.remove("is-paused"); timer = setInterval(function () { go(i + 1); }, 7000); }
    function stop() { clearInterval(timer); root.classList.add("is-paused"); }
    tabs.forEach(function (t, k) { t.addEventListener("click", function () { go(k); start(); }); });
    root.addEventListener("mouseenter", stop); root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop); root.addEventListener("focusout", start);
    play.addEventListener("click", function () { cinema.open(slides[i].getAttribute("data-car"), play); });
    start();
  })();

  /* ---------- track record grid + filters ---------- */
  (function grid() {
    var el = $("#carGrid"); if (!el) return;
    el.innerHTML = CARS.map(function (c) {
      var vid = hasVideo(c.id);
      var out = c.outcome === "sold"
        ? '<span class="card__out">' + esc(c.outcomeLabel) + '</span>'
        : '<span class="card__out card__out--bid">' + esc(c.outcomeLabel) + ' &middot; Reserve Not Met</span>';
      var fin = c.final ? '<div class="card__final">&rarr; <b>' + esc(c.finalLabel) + '</b></div>' : "";
      return '<article class="card" data-cat="' + c.category + '" data-plat="' + c.platform + '">' +
        '<div class="card__shot"><img src="' + esc(c.image) + '" alt="' + esc(c.title) + '" loading="lazy">' +
        '<span class="card__rank">' + String(c.rank).padStart(2, "0") + '</span>' +
        '<span class="badge badge--' + c.platform + '"><i></i>' + (c.platform === "bat" ? "BaT" : "Cars &amp; Bids") + '</span></div>' +
        '<div class="card__body"><h3>' + esc(c.title) + '</h3><p class="card__sub">' + esc(c.sub) + '</p>' +
        '<div class="card__price"><span class="card__amt">' + money(c.price) + '</span>' + out + fin + '</div>' +
        '<ul class="card__specs">' + c.specs.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + '</ul>' +
        '<p class="card__stats">' + esc(c.stats) + '</p>' +
        '<div class="deal"><span class="deal__k">Behind the Deal</span><p>' + esc(c.story) + '</p></div>' +
        '<div class="tailored"><span class="tailored__k">Custom-tailored for this car</span><ul>' + c.tailored.map(function (h) { return "<li>" + esc(h) + "</li>"; }).join("") + '</ul></div>' +
        '<div class="card__actions">' +
        (vid ? '<button type="button" class="btn btn--video" data-video-car="' + c.id + '">&#9654; Watch Video</button>' : "") +
        '<a class="btn btn--ghost" href="' + esc(c.url) + '" target="_blank" rel="noopener">' + (vid ? "Live Auction" : "View Live Auction") + ' &#8599;</a>' +
        '</div></div></article>';
    }).join("");

    el.insertAdjacentHTML("beforeend", '<article class="card card--cta" data-cta="1"><p class="eyebrow eyebrow--light"><span class="eyebrow__rule"></span>Your Vehicle Could Be Next</p>' +
      '<h3>Own a manual or collector-spec car? <em>Let\u2019s price it.</em></h3><p>Share the car and your target net payout. We will recommend the venue, schedule and strategy.</p>' +
      '<a class="btn btn--primary" href="#valuation">Request Valuation</a></article>');
    var cards = $$(".card:not(.card--cta)", el), cta = $(".card--cta", el), status = $("#filterStatus"), chips = $$(".chip", $("#filters"));
    var labels = { all: "all transactions", porsche: "Porsche & Exotic", bmw: "BMW M & Manual Icons", bat: "Bring a Trailer", cb: "Cars & Bids" };
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var f = chip.dataset.filter, n = 0;
        chips.forEach(function (c) { var on = c === chip; c.classList.toggle("is-active", on); c.setAttribute("aria-pressed", String(on)); });
        cards.forEach(function (card) {
          var show = f === "all" || card.dataset.cat === f || card.dataset.plat === f;
          card.hidden = !show; card.classList.remove("is-in");
          if (show) { n++; void card.offsetWidth; card.classList.add("is-in"); }
        });
        cta.hidden = !(f === "all" || f === "bmw");
        status.textContent = f === "all" ? "Showing all " + n + " transactions" : "Showing " + n + " \u00b7 " + labels[f];
      });
    });
  })();

  /* ---------- sortable ledger ---------- */
  (function ledger() {
    var table = $("#ledgerTable"); if (!table) return;
    var body = $("tbody", table), heads = $$("th[data-sort]", table);
    var sort = { key: "rank", dir: 1 };
    function val(c, k) {
      if (k === "platform") return platName(c);
      if (k === "outcome") return c.outcome === "sold" ? "Sold" : "High Bid";
      return c[k];
    }
    function draw() {
      var rows = CARS.slice().sort(function (a, b) {
        var x = val(a, sort.key), y = val(b, sort.key);
        if (typeof x === "number") return (x - y) * sort.dir;
        return String(x).localeCompare(String(y)) * sort.dir || (a.rank - b.rank);
      });
      body.innerHTML = rows.map(function (c) {
        var out = c.outcome === "sold"
          ? '<span class="out">Sold</span>'
          : '<span class="out out--bid">High Bid &middot; Reserve Not Met<small>&rarr; ' + esc(c.finalLabel) + '</small></span>';
        return '<tr><td class="rk">' + String(c.rank).padStart(2, "0") + '</td>' +
          '<td class="veh"><a href="' + esc(c.url) + '" target="_blank" rel="noopener">' + esc(c.title) + '</a><small>' + esc(c.sub) + (c.date ? " \u00b7 " + esc(c.date) : "") + '</small></td>' +
          '<td><span class="plat plat--' + c.platform + '"><i></i>' + (c.platform === "bat" ? "BaT" : "C&amp;B") + '</span></td>' +
          '<td>' + esc(c.transmission) + '</td><td>' + out + '</td><td class="num">' + money(c.price) + '</td></tr>';
      }).join("");
    }
    heads.forEach(function (th) {
      $("button", th).addEventListener("click", function () {
        var k = th.dataset.sort;
        sort = { key: k, dir: sort.key === k ? -sort.dir : (k === "price" ? -1 : 1) };
        heads.forEach(function (h) { h.setAttribute("aria-sort", "none"); });
        th.setAttribute("aria-sort", sort.dir === 1 ? "ascending" : "descending");
        draw();
      });
    });
    draw();
  })();

  /* ---------- media suite film tiles ---------- */
  (function films() {
    var el = $("#films"); if (!el) return;
    var withFilm = CARS.filter(function (c) { return hasVideo(c.id); });
    el.innerHTML = withFilm.map(function (c) {
      var list = VIDEOS[c.id];
      return '<button type="button" class="film" data-video-car="' + c.id + '">' +
        '<div class="film__shot"><img src="' + esc(c.image) + '" alt="" loading="lazy"><span class="film__play" aria-hidden="true">&#9654;</span>' +
        '<span class="film__count">' + list.length + (list.length === 1 ? " film" : " films") + '</span></div>' +
        '<div class="film__meta"><b>' + esc(c.title) + '</b><span>' + esc(list[0].label.replace(/\s\d+$/, "")) + '</span></div></button>';
    }).join("");
    var none = CARS.filter(function (c) { return !hasVideo(c.id); });
    if (none.length) {
      el.insertAdjacentHTML("afterend", '<p class="films__note">' + none.map(function (c) {
        return esc(c.title) + ' &mdash; <a href="' + esc(c.url) + '" target="_blank" rel="noopener" style="color:#c9a55a;border-bottom:1px solid currentColor">photo gallery on the live listing &#8599;</a>';
      }).join("; ") + '. No embedded film on that listing.</p>');
    }
  })();

  /* ---------- valuation form ---------- */
  (function form() {
    var f = $("#valForm"), conf = $("#confirm"), err = $("#formError"); if (!f) return;
    var E = f.elements, V = window.SM_VEHICLES || { makes: [], models: {}, universalTransmissions: [] };
    var MAX_YEAR = new Date().getFullYear() + 1;
    /* FormSubmit target is chosen by host: localhost / 127.0.0.1 use the dev alias, schermasellamotorcars.com uses the inbox.
       window.SM_FORM_ENDPOINT (an e-mail, alias or full URL) overrides both. */
    var LOCAL_TARGET = "0ecea8ca9bbd5a60ecb61b9e66f509ff", LIVE_TARGET = "jamesjeremy955@gmail.com";
    function formEndpoint() {
      var o = window.SM_FORM_ENDPOINT, h = location.hostname;
      if (o) return /^https?:\/\//.test(o) ? o.replace("/ajax/", "/") : "https://formsubmit.co/" + o;
      var local = h === "localhost" || h === "127.0.0.1" || h === "[::1]" || h === "" || /\.local$/.test(h);
      return "https://formsubmit.co/" + (local ? LOCAL_TARGET : LIVE_TARGET);
    }
    var STORE = "sm_valuation_requests";

    /* Required: first/last name, phone, email, year, make, model. Optional: transmission, mileage, VIN, target net payout. */
    var required = ["firstName", "lastName", "phone", "email", "year", "make", "model"];

    /* ======================= helpers ======================= */
    var squash = function (t) { return String(t).toLowerCase().replace(/[\s\-.]/g, ""); };
    var digitsOf = function (t) { return String(t).replace(/\D/g, ""); };

    /* ======================= PHONE (US/CA pinned + every ITU-T E.164 country code) ======================= */
    var US = { iso: "US/CA", name: "United States / Canada", code: "+1", alias: "usa america united states canada us ca" };
    var COUNTRIES = (window.SM_COUNTRIES || []).map(function (r) {
      var p = r.split("|"); return { iso: p[0], name: p[1], code: "+" + p[2], alias: (p[3] || "").toLowerCase() };
    }).sort(function (a, b) { return a.name.localeCompare(b.name); });
    var ALL_CC = [US].concat(COUNTRIES);
    var sel = US;                                                        // currently selected dial-code country
    var shortLabel = function (c) { return c.iso + " " + c.code; };

    function formatUS(d) {
      if (!d.length) return "";
      if (d.length <= 3) return "(" + d;
      if (d.length <= 6) return "(" + d.slice(0, 3) + ") " + d.slice(3);
      return "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
    }
    function usDigits(raw) {
      var d = digitsOf(raw);
      if (d.length > 10 && d.charAt(0) === "1") d = d.slice(1);     // 11 digits starting with 1 -> drop the country digit
      return d.slice(0, 10);
    }
    function cleanIntl(raw, maxDigits) {                             // keep digits, single spaces, one leading +
      var plus = raw.trim().charAt(0) === "+";
      var t = raw.replace(/[^\d ]/g, "").replace(/\s{2,}/g, " ").replace(/^\s+/, "");
      var out = "", n = 0;
      for (var i = 0; i < t.length; i++) { if (/\d/.test(t[i])) { if (n >= maxDigits) break; n++; } out += t[i]; }
      return (plus ? "+" : "") + out;
    }
    function isIntlMode() { return sel.code !== "+1" || E.phone.value.trim().charAt(0) === "+"; }

    /* longest calling-code prefix of a digit string ("972501234567" -> IL); +7 prefers Russia; +1 falls back to US/CA */
    function countryForDigits(all) {
      var best = null, bl = 0;
      ALL_CC.forEach(function (c) {
        var cd = c.code.slice(1);
        if (all.indexOf(cd) === 0 && cd.length > bl) { best = c; bl = cd.length; }
      });
      if (!best) return null;
      if (sel.code === best.code) return sel;                         // keep the user's pick for shared codes (KZ / RU)
      if (best.code === "+7") return COUNTRIES.filter(function (c) { return c.iso === "RU"; })[0] || best;
      return best;
    }

    var dialInput = $("#f-dial");
    function setDial(c, quiet) {
      sel = c; E.dial.value = c.code; dialInput.value = shortLabel(c);
      if (quiet) return;
      var cur = E.phone.value;
      if (c.code === "+1") E.phone.value = formatUS(usDigits(cur));
      else if (cur.trim().charAt(0) === "+") E.phone.value = "";
      else E.phone.value = cleanIntl(digitsOf(cur), 15 - (c.code.length - 1));
      if (E.phone.closest(".is-invalid")) check("phone");
    }

    function onPhoneInput() {
      var raw = E.phone.value;
      if (raw.trim().charAt(0) === "+") {                            // typed an international number: auto-select the country
        var all = digitsOf(raw).slice(0, 15), hit = all ? countryForDigits(all) : null;
        if (hit && hit.code === "+1") { setDial(US, true); E.phone.value = formatUS(usDigits(all.slice(1))); return; }
        if (hit) setDial(hit, true);
        E.phone.value = cleanIntl(raw, 15); return;
      }
      if (sel.code === "+1") { E.phone.value = formatUS(usDigits(raw)); return; }
      E.phone.value = cleanIntl(raw, 15 - (sel.code.length - 1));     // known country: national number only
    }
    E.phone.addEventListener("input", onPhoneInput);

    /* ---- searchable country combobox: US/CA +1 pinned, divider, then A-Z ---- */
    (function dialCombo() {
      var list = document.createElement("ul"), items = [], active = -1, filtering = false;
      list.className = "ac__list dial__list"; list.id = "f-dial-list"; list.setAttribute("role", "listbox"); list.hidden = true;
      dialInput.parentNode.appendChild(list);
      dialInput.setAttribute("role", "combobox"); dialInput.setAttribute("aria-autocomplete", "list"); dialInput.setAttribute("aria-expanded", "false");
      dialInput.setAttribute("aria-controls", list.id);

      function matches(q) {
        var raw = q.trim().toLowerCase(); if (!raw) return ALL_CC.slice();
        var compact = raw.replace(/\s/g, ""), isNum = /^\+?\d+$/.test(compact), digits = compact.replace(/\D/g, "");
        var scored = [];
        ALL_CC.forEach(function (c, i) {
          var iso = c.iso.toLowerCase(), name = c.name.toLowerCase(), hay = name + " " + c.alias, s = 99;
          if (isNum) { var cd = c.code.slice(1); s = cd === digits ? 0 : cd.indexOf(digits) === 0 ? 1 : 99; }
          else if (iso === raw || iso.split("/").indexOf(raw) > -1) s = 0;
          else if (name.indexOf(raw) === 0) s = 1;
          else if (hay.split(/[\s(),\-]+/).some(function (w) { return w.indexOf(raw) === 0; })) s = 2;
          else if (hay.indexOf(raw) > -1) s = 3;
          if (s < 99) scored.push({ c: c, s: s, i: i });
        });
        scored.sort(function (a, b) { return a.s - b.s || a.i - b.i; });
        return scored.map(function (x) { return x.c; });
      }
      function label(c) {
        return '<span class="c">' + esc(shortLabel(c)) + '</span><span class="n">(' + esc(c === US ? "United States / Canada" : c.name) + ")</span>";
      }
      function close() { list.hidden = true; active = -1; dialInput.setAttribute("aria-expanded", "false"); dialInput.removeAttribute("aria-activedescendant"); }
      function mark(i) {
        active = i;
        $$("li[data-i]", list).forEach(function (li) { var on = +li.dataset.i === i; li.classList.toggle("is-active", on); li.setAttribute("aria-selected", String(on)); });
        var li = i >= 0 ? list.querySelector('li[data-i="' + i + '"]') : null;
        if (li) { dialInput.setAttribute("aria-activedescendant", li.id); li.scrollIntoView({ block: "nearest" }); }
      }
      function render(q) {
        items = matches(q);
        if (!items.length) {
          list.innerHTML = '<li class="dial__sep" role="presentation">No matching country</li>'; list.hidden = false;
          dialInput.setAttribute("aria-expanded", "true"); active = -1; return;
        }
        var html = "", unfiltered = !q.trim();
        items.forEach(function (c, i) {
          html += '<li role="option" id="f-dial-' + i + '" data-i="' + i + '"' + (c === sel ? ' class="is-sel"' : "") + ">" + label(c) + "</li>";
          if (unfiltered && i === 0) html += '<li class="dial__sep" role="separator">All countries A\u2013Z</li>';
        });
        list.innerHTML = html; list.hidden = false; dialInput.setAttribute("aria-expanded", "true");
        mark(unfiltered ? items.indexOf(sel) : 0);
        if (unfiltered && sel !== US) { var s = list.querySelector(".is-sel"); if (s) list.scrollTop = Math.max(0, s.offsetTop - 80); }
      }
      function restore() { filtering = false; dialInput.value = shortLabel(sel); close(); }
      function choose(i, focusPhone) {
        if (!items[i]) return;
        setDial(items[i]); filtering = false; close();
        if (focusPhone) E.phone.focus();
      }
      dialInput.addEventListener("focus", function () { filtering = false; render(""); setTimeout(function () { dialInput.select(); }, 0); });
      dialInput.addEventListener("click", function () { if (list.hidden) { filtering = false; render(""); } });
      dialInput.addEventListener("input", function () { filtering = true; render(dialInput.value); });
      dialInput.addEventListener("blur", function () { setTimeout(function () { if (document.activeElement !== dialInput) restore(); }, 120); });
      dialInput.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown") { e.preventDefault(); if (list.hidden) render(filtering ? dialInput.value : ""); else mark(Math.min(items.length - 1, active + 1)); }
        else if (e.key === "ArrowUp" && !list.hidden) { e.preventDefault(); mark(Math.max(0, active - 1)); }
        else if (e.key === "Enter" && !list.hidden) { e.preventDefault(); choose(active >= 0 ? active : 0, true); }
        else if (e.key === "Escape" && !list.hidden) { e.stopPropagation(); restore(); }
        else if (e.key === "Tab" && !list.hidden) { if (filtering && items.length) choose(active >= 0 ? active : 0, false); else close(); }
      });
      list.addEventListener("mousedown", function (e) {
        e.preventDefault();
        var li = e.target.closest("li[data-i]"); if (li) choose(+li.dataset.i, true);
      });
    })();

    /* returns { ok, msg, display, e164 } */
    function phoneInfo() {
      var raw = E.phone.value.trim();
      if (!raw) return { ok: false, msg: "", display: "", e164: "" };
      if (!isIntlMode()) {
        var d = usDigits(raw);
        if (d.length === 10) return { ok: true, display: "+1 " + formatUS(d), e164: "+1" + d };
        return { ok: false, display: "", e164: "",
          msg: d.length === 7 ? "Please include your 3-digit area code." : "Please enter a full 10-digit number including your 3-digit area code." };
      }
      var national = raw.charAt(0) === "+" ? raw : sel.code + " " + raw;
      var total = digitsOf(national);
      var okIntl = total.length >= 8 && total.length <= 15;
      return { ok: okIntl, msg: "Please enter a valid international number (8\u201315 digits including the country code).",
        display: national.replace(/\s{2,}/g, " ").trim(), e164: "+" + total };
    }

    /* ======================= capitalization / normalization ======================= */
    var ACRONYMS = { gt: 1, gts: 1, gto: 1, gtr: 1, rs: 1, cs: 1, csl: 1, sl: 1, slk: 1, sls: 1, amg: 1, rt: 1, srt: 1, acr: 1, ss: 1, ls: 1, zhp: 1, xdrive: 0, vr4: 1, sc: 1, se: 1, ev: 1, suv: 1 };
    function hasMixedCase(t) { return /[a-z]/.test(t) && /[A-Z]/.test(t); }
    function titleWord(w) {
      var lw = w.toLowerCase();
      if (/\d/.test(w)) return /^\d/.test(w) ? lw : w.toUpperCase();      // 335i / 328d stay lowercase; M3 / GT3 / E46 uppercase
      if (w.length === 1 || ACRONYMS[lw] === 1) return w.toUpperCase();
      return lw.charAt(0).toUpperCase() + lw.slice(1);
    }
    function titleCase(t) {
      return t.replace(/[A-Za-z0-9]+/g, function (w) { return titleWord(w); });
    }
    function canonicalMake(t) {
      var k = squash(t); if (!k) return "";
      for (var i = 0; i < V.makes.length; i++) if (squash(V.makes[i]) === k) return V.makes[i];
      return "";
    }
    function normalizeMake(t) {
      t = t.trim().replace(/\s+/g, " "); if (!t) return "";
      var c = canonicalMake(t); if (c) return c;
      if (hasMixedCase(t)) return t;
      return t.replace(/[A-Za-z0-9]+/g, function (w) { return (/^[A-Z]{2,3}$/.test(w) || /\d/.test(w)) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); });
    }
    function normalizeModel(make, t) {
      t = t.trim().replace(/\s+/g, " "); if (!t) return "";
      var list = V.models[canonicalMake(make)] || [], k = squash(t);
      for (var i = 0; i < list.length; i++) if (squash(list[i]) === k) return list[i];
      if (hasMixedCase(t)) return t;
      return titleCase(t);
    }
    function titleName(t) {                                                // first / last name
      t = t.trim().replace(/\s+/g, " ");
      if (!t || hasMixedCase(t)) return t;
      return t.toLowerCase().replace(/(^|[\s\-'])([a-z\u00c0-\u024f])/g, function (m, p, c) { return p + c.toUpperCase(); });
    }

    /* ======================= typeahead component ======================= */
    function typeahead(input, getItems) {
      var list = document.createElement("ul"), items = [], active = -1;
      list.className = "ac__list"; list.id = input.id + "-list"; list.setAttribute("role", "listbox"); list.hidden = true;
      input.parentNode.appendChild(list);
      input.setAttribute("role", "combobox"); input.setAttribute("aria-autocomplete", "list");
      input.setAttribute("aria-expanded", "false"); input.setAttribute("aria-controls", list.id); input.setAttribute("autocomplete", "off");

      function close() { list.hidden = true; active = -1; input.setAttribute("aria-expanded", "false"); input.removeAttribute("aria-activedescendant"); }
      function mark(i) {
        active = i;
        $$("li", list).forEach(function (li, k) { li.classList.toggle("is-active", k === i); li.setAttribute("aria-selected", String(k === i)); });
        if (i >= 0) { var li = list.children[i]; input.setAttribute("aria-activedescendant", li.id); li.scrollIntoView({ block: "nearest" }); }
      }
      function render() {
        var q = input.value.trim(); items = getItems(q);
        if (!items.length) { close(); return; }
        var ql = q.toLowerCase();
        list.innerHTML = items.map(function (t, i) {
          var hit = ql && t.toLowerCase().indexOf(ql) === 0
            ? "<b>" + esc(t.slice(0, q.length)) + "</b>" + esc(t.slice(q.length)) : esc(t);
          return '<li role="option" id="' + list.id + "-" + i + '" data-i="' + i + '">' + hit + "</li>";
        }).join("");
        list.hidden = false; input.setAttribute("aria-expanded", "true"); active = -1;
      }
      function choose(i) {
        input.value = items[i]; close();
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new CustomEvent("suggest:chosen", { bubbles: true }));
      }
      input.addEventListener("focus", render);
      input.addEventListener("click", function () { if (list.hidden) render(); });
      input.addEventListener("input", render);
      input.addEventListener("blur", function () { setTimeout(function () { if (document.activeElement !== input) close(); }, 120); });
      input.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown") { e.preventDefault(); if (list.hidden) render(); else mark(Math.min(items.length - 1, active + 1)); }
        else if (e.key === "ArrowUp" && !list.hidden) { e.preventDefault(); mark(Math.max(0, active - 1)); }
        else if (e.key === "Enter" && !list.hidden && active >= 0) { e.preventDefault(); choose(active); }
        else if (e.key === "Escape" && !list.hidden) { e.stopPropagation(); close(); }
        else if (e.key === "Tab") close();
      });
      list.addEventListener("mousedown", function (e) {
        e.preventDefault();                                         // keep focus in the input
        var li = e.target.closest("li"); if (li) choose(+li.dataset.i);
      });
    }

    E.year.addEventListener("input", function () { E.year.value = E.year.value.replace(/\D/g, "").slice(0, 4); });
    // YEAR: 2026 -> 1950, prefix filter ("200" -> 2000-2009); any custom 4-digit year still allowed
    var YEARS = []; for (var y = 2026; y >= 1950; y--) YEARS.push(String(y));
    typeahead(E.year, function (q) { return q ? YEARS.filter(function (t) { return t.indexOf(q) === 0; }) : YEARS; });

    // MAKE: dictionary typeahead, prefix matches first, then word-start / substring matches
    typeahead(E.make, function (q) {
      if (!q) return V.makes.slice();
      var k = squash(q);
      var starts = V.makes.filter(function (m) { return squash(m).indexOf(k) === 0; });
      var inside = V.makes.filter(function (m) { return starts.indexOf(m) < 0 && squash(m).indexOf(k) > -1; });
      return starts.concat(inside);
    });

    // MODEL: coordinated with the entered make; every typed word must prefix a word in the model name
    typeahead(E.model, function (q) {
      var list = V.models[canonicalMake(E.make.value)] || [];
      if (!q) return list.slice();
      var toks = q.toLowerCase().split(/\s+/).filter(Boolean), ql = q.toLowerCase();
      var m = list.filter(function (t) {
        var words = t.toLowerCase().split(/[\s\/()\-]+/).filter(Boolean);
        return toks.every(function (tok) { return words.some(function (w) { return w.indexOf(tok) === 0; }); });
      });
      return m.sort(function (a, b) { return (b.toLowerCase().indexOf(ql) === 0) - (a.toLowerCase().indexOf(ql) === 0); });
    });

    E.make.addEventListener("blur", function () { E.make.value = normalizeMake(E.make.value); refreshTransmission(); });
    E.model.addEventListener("blur", function () { E.model.value = normalizeModel(E.make.value, E.model.value); refreshTransmission(); });
    [E.firstName, E.lastName].forEach(function (inp) { inp.addEventListener("blur", function () { inp.value = titleName(inp.value); }); });
    E.make.addEventListener("suggest:chosen", function () { E.make.value = normalizeMake(E.make.value); });
    E.vin.addEventListener("input", function () { E.vin.value = E.vin.value.toUpperCase().replace(/[^A-Z0-9]/g, ""); });
    [E.payout, E.mileage].forEach(function (inp) {
      inp.addEventListener("blur", function () {
        var d = inp.value.replace(/[^\d]/g, ""); if (d) inp.value = Number(d).toLocaleString("en-US");
      });
    });

    /* ======================= TRANSMISSION: Year + Make + Model matrix =======================
       Each rule returns the factory transmissions that really existed for that exact car, #1 = default.
       "Other / Custom Specification" is always appended last (aftermarket conversions). */
    var CUSTOM = "Other / Custom Specification";
    var PDK7 = "7-Speed PDK", PDK8 = "8-Speed PDK", TIP8 = "8-Speed Tiptronic S (Automatic)", TIP5 = "5-Speed Tiptronic S (Automatic)", TIP4 = "4-Speed Tiptronic (Automatic)",
        GTM = "6-Speed GT Sport Manual";

    function porscheMatrix(y, m) {
      var T = function (re) { return re.test(m); };
      var ch = (m.match(/ (930|964|993|996|997|991|992) /) || [])[1] || "";
      var turbo = T(/ turbo /) && !T(/ turbo look /);

      /* --- SUVs, sedans, EV: no manuals (except early Cayenne) --- */
      if (T(/ cayenne /)) {
        if (y && y <= 2010) return turbo ? ["6-Speed Tiptronic S (Automatic)"] : ["6-Speed Tiptronic S (Automatic)", "6-Speed Manual"];
        if (y >= 2011 && y <= 2014 && !turbo) return [TIP8, "6-Speed Manual"];            // rare base / GTS manuals
        if (y || turbo) return [TIP8];
        return [TIP8, "6-Speed Tiptronic S (Automatic)", "6-Speed Manual"];
      }
      if (T(/ macan /)) {
        if (T(/ (electric|ev) /)) return ["Single-Speed EV (Electric)"];
        if (y >= 2024 && !T(/ (s|gts|t) /)) return [PDK7, "Single-Speed EV (Electric)"];
        return [PDK7];
      }
      if (T(/ panamera /)) {
        if (y >= 2017) return [PDK8];
        if (y >= 2010) return [PDK7, TIP8];
        return [PDK8, PDK7, TIP8];
      }
      if (T(/ taycan /)) return ["2-Speed Automatic (EV)"];

      /* --- exact sports cars --- */
      if (T(/ ?918 /)) return [PDK7];
      if (/^ carrera gt $/.test(m)) return ["6-Speed Manual"];
      if (T(/ 959 /)) return ["6-Speed Manual"];

      /* --- front / mid-engine & classics --- */
      if (T(/ 356 /) || T(/ 550 /)) return ["4-Speed Manual"];
      if (T(/ 914 /)) return ["5-Speed Manual", "4-Speed Manual"];
      if (T(/ 924 /)) return T(/ carrera gt /) ? ["5-Speed Manual"] : ["5-Speed Manual", "4-Speed Manual", "3-Speed Automatic"];
      if (T(/ 944 /)) return T(/ (turbo|s2) /) ? ["5-Speed Manual"] : ["5-Speed Manual", "3-Speed Automatic"];
      if (T(/ 968 /)) return T(/ club sport /) ? ["6-Speed Manual"] : ["6-Speed Manual", TIP4];
      if (T(/ 928 /)) return ["5-Speed Manual", "4-Speed Automatic"];
      if (T(/ (boxster|cayman|718|spyder) /) && !T(/ 911 /)) {
        if (T(/ gt4 rs /)) return [PDK7];
        if (T(/ (gt4|spyder) /)) return ["6-Speed Manual"];
        if (y && y <= 2008) return ["6-Speed Manual", "5-Speed Manual", TIP5];
        return ["6-Speed Manual", PDK7];
      }

      /* --- 911 family --- */
      if (!(T(/ (911|930|964|993|996|997|991|992|gt3|gt2|carrera|targa|speedster|turbo|sc) /))) return null;
      var gt3 = T(/ gt3 /), gt3rs = T(/ gt3 ?rs /), gt2 = T(/ gt2 /), rs = T(/ rs /) && !gt3rs && !T(/ gt2 rs /);
      var era = "";
      if (ch === "930" || T(/ (m491|g body|sc) /)) era = "g";
      else if (ch === "964") era = "964"; else if (ch === "993") era = "993"; else if (ch === "996") era = "99x";
      else if (ch === "991") era = "991"; else if (ch === "992") era = "992";
      else if (y) era = y <= 1989 ? "g" : y <= 1994 ? "964" : y <= 1998 ? "993" : y <= 2008 ? "99x" : y <= 2011 ? "9972" : y === 2012 ? "2012" : y <= 2019 ? "991" : "992";
      else if (ch === "997") era = "997u";
      if (era === "99x" && ch === "997" && y > 2008) era = "9972";
      if (era === "991" && y && y < 2012) era = "";                                   // 991 never existed before 2012

      switch (era) {
        case "g":
          if (turbo || ch === "930") return ["4-Speed Manual (930 Turbo)", "5-Speed Manual (G50)"];
          if (rs) return ["5-Speed Manual (915 / G50)"];
          return ["5-Speed Manual (915 / G50)", "4-Speed Manual", "3-Speed Sportomatic (Automatic)"];
        case "964":
          return (turbo || rs) ? ["5-Speed Manual"] : ["5-Speed Manual", TIP4];
        case "993":
          return (turbo || rs || gt2) ? ["6-Speed Manual"] : ["6-Speed Manual", TIP4];
        case "99x":                                                                   // 996 + 997.1
          return (gt3 || gt2) ? ["6-Speed Manual"] : ["6-Speed Manual", TIP5];
        case "9972":                                                                  // 997.2
          return (gt3 || gt2 || T(/ (sport classic|speedster) /)) ? ["6-Speed Manual"] : ["6-Speed Manual", PDK7];
        case "997u":
          return (gt3 || gt2) ? ["6-Speed Manual"] : ["6-Speed Manual", TIP5, PDK7];
        case "2012":
          return (gt3 || gt2) ? ["6-Speed Manual"] : ["6-Speed Manual", "7-Speed Manual", PDK7];
        case "991":
          if (gt3rs || gt2) return [PDK7];
          if (gt3) return (y && y <= 2016) ? [PDK7] : [GTM, PDK7];                   // 991.1 GT3 = PDK only, 991.2 adds the manual
          if (T(/ (911 r|speedster) /)) return ["6-Speed Manual"];
          if (turbo) return [PDK7];
          return [PDK7, "7-Speed Manual"];
        case "992":
          if (gt3rs) return [PDK7];
          if (gt3) return [GTM, PDK7];
          if (T(/ s t /)) return ["6-Speed Manual"];
          if (T(/ sport classic /)) return ["7-Speed Manual"];
          if (turbo || T(/ dakar /)) return [PDK8];
          return [PDK8, "7-Speed Manual"];
      }
      /* year unknown: offer the union for that trim */
      if (gt3rs || gt2) return [PDK7, "6-Speed Manual"];
      if (gt3) return ["6-Speed Manual", GTM, PDK7];
      if (turbo) return [PDK7, PDK8, "6-Speed Manual", TIP5];
      return [PDK7, PDK8, "7-Speed Manual", "6-Speed Manual", "5-Speed Manual (915 / G50)", TIP5, TIP4, "3-Speed Sportomatic (Automatic)"];
    }

    function bmwMatrix(y, m) {
      var T = function (re) { return re.test(m); };
      var ch = (m.match(/ (e28|e30|e34|e36|e39|e46|e60|e63|e90|e92|e93|f10|f12|f80|f82|f87|f90|g80|g82|g87|g90) /) || [])[1] || "";
      var MST = "8-Speed M Steptronic (Automatic)", DCT = "7-Speed M-DCT";
      if (T(/ 1m /) || T(/ z8 /)) return ["6-Speed Manual"];
      if (T(/ z4 m /)) return ["6-Speed Manual"];
      if (T(/ z3 m /)) return y >= 2001 ? ["6-Speed Manual"] : y ? ["5-Speed Manual"] : ["6-Speed Manual", "5-Speed Manual"];
      if (T(/ 850csi /)) return ["6-Speed Manual"];
      if (T(/ m1 /)) return ["5-Speed Manual"];
      if (T(/ 3 0 csl /)) return ["4-Speed Manual"];
      if (T(/ 2002/)) return ["4-Speed Manual", "5-Speed Manual"];
      if (T(/ m635csi /)) return ["5-Speed Manual"];
      if (T(/ 328d /) || T(/ 535i xdrive /)) return ["8-Speed Automatic"];
      if (T(/ 540i /) && T(/ 6 speed /)) return ["6-Speed Manual"];
      if (T(/ m5 /)) {
        var g = ch || (y ? (y <= 1995 ? "e34" : y <= 2003 ? "e39" : y <= 2010 ? "e60" : y <= 2017 ? "f10" : "f90") : "");
        if (g === "e28" || g === "e34") return ["5-Speed Manual"];
        if (g === "e39") return ["6-Speed Manual"];
        if (g === "e60") return ["7-Speed SMG III", "6-Speed Manual"];
        if (g === "f10") return [DCT, "6-Speed Manual"];
        if (g === "f90" || g === "g90") return [MST];
        return ["6-Speed Manual", DCT, "7-Speed SMG III", MST, "5-Speed Manual"];
      }
      if (T(/ m6 /)) { var g6 = y && y < 1990 ? "old" : ""; return g6 ? ["5-Speed Manual"] : (y >= 2012 ? [DCT] : ["7-Speed SMG III", "6-Speed Manual"]); }
      if (T(/ m3 /) || T(/ m4 /)) {
        var is4 = T(/ m4 /);
        if (T(/ csl /)) return [is4 ? MST : "6-Speed SMG II"];
        var gg = ch || (y ? (is4 ? (y <= 2020 ? "f80" : "g80") : (y <= 1991 ? "e30" : y <= 2000 ? "e36" : y <= 2006 ? "e46" : y <= 2013 ? "e90" : y <= 2020 ? "f80" : "g80")) : "");
        if (gg === "f82") gg = "f80"; if (gg === "g82") gg = "g80"; if (gg === "e92" || gg === "e93") gg = "e90";
        if (T(/ cs /) && !is4) return [y >= 2021 || gg === "g80" ? MST : DCT];
        if (gg === "e30") return ["5-Speed Manual"];
        if (gg === "e36") return ["5-Speed Manual", "4-Speed Automatic"];
        if (gg === "e46") return ["6-Speed Manual", "6-Speed SMG II"];
        if (gg === "e90" || gg === "f80") return ["6-Speed Manual", DCT];
        if (gg === "g80") return ["6-Speed Manual", MST];
        return ["6-Speed Manual", DCT, "6-Speed SMG II", MST, "5-Speed Manual"];
      }
      if (T(/ m2 /)) return y >= 2023 ? ["6-Speed Manual", MST] : ["6-Speed Manual", DCT];
      if (T(/ 335is /)) return ["6-Speed Manual", "7-Speed Dual-Clutch (DCT)"];
      if (T(/ 335i /)) return y >= 2012 ? ["8-Speed Automatic", "6-Speed Manual"] : ["6-Speed Manual", "6-Speed Automatic"];
      if (T(/ 330i zhp /) || T(/ zhp /)) return ["6-Speed Manual"];
      if (T(/ 328i /) || T(/ 325/)) {
        if (T(/ 325is /)) return ["5-Speed Manual"];
        var gen = ch === "e30" ? "e30" : ch === "e36" ? "e36" : (y ? (y <= 1998 ? "e36" : y <= 2005 ? "e46" : y <= 2011 ? "e9x" : "f30") : "");
        if (gen === "e30") return ["5-Speed Manual", "4-Speed Automatic"];
        if (gen === "e36") return ["5-Speed Manual", "4-Speed Automatic"];
        if (gen === "e46") return ["5-Speed Manual", "5-Speed Automatic"];
        if (gen === "e9x") return ["6-Speed Manual", "6-Speed Automatic"];
        if (gen === "f30") return ["8-Speed Automatic", "6-Speed Manual"];
      }
      if (T(/ 550i /)) return y >= 2011 ? ["8-Speed Automatic", "6-Speed Manual"] : ["6-Speed Automatic", "6-Speed Manual"];
      if (T(/ 750il /)) return ["5-Speed Automatic"];
      if (T(/ (x5 m|x6 m) /)) return y >= 2015 ? [MST] : ["6-Speed Automatic"];
      if (T(/ i8 /)) return ["6-Speed Automatic"];
      return null;
    }

    function ferrariMatrix(y, m) {
      var T = function (re) { return re.test(m); };
      var OG = "6-Speed Open-Gate Manual", F1 = "6-Speed F1 Automated Manual", D7 = "7-Speed F1 Dual-Clutch", D8 = "8-Speed F1 Dual-Clutch";
      if (T(/ 550 /)) return [OG];
      if (T(/ f50 /)) return ["6-Speed Manual"];
      if (T(/ enzo /)) return [F1];
      if (T(/ laferrari /)) return [D7];
      if (T(/ (f40|288|250|246|dino|daytona|365|308|328|348|testarossa|512|mondial) /) && !T(/ sp3 /)) return ["5-Speed Manual"];
      if (T(/ 456 /)) return [OG, "4-Speed Automatic"];
      if (T(/ (scuderia|challenge stradale|16m) /)) return [F1];
      if (T(/ (355|360|f430|430|575m|575|599|612) /)) {
        if (T(/ 355 /) && y && y < 1997) return [OG];
        return [OG, F1];
      }
      if (T(/ (sf90|296|roma|purosangue|12cilindri|849) /) || T(/ portofino m /)) return [D8];
      if (T(/ (458|488|f8|812|f12|f12berlinetta|california|portofino|gtc4lusso|ff|daytona sp3|f8) /)) return [D7];
      if (y >= 2019) return [D8, D7];
      if (y >= 2010) return [D7, D8];
      if (y >= 1995) return [OG, F1];
      if (y) return ["5-Speed Manual", "4-Speed Manual"];
      return null;
    }

    function lamboMatrix(y, m) {
      var T = function (re) { return re.test(m); };
      var OG = "6-Speed Open-Gate Manual", EG = "6-Speed E-Gear", LDF = "7-Speed LDF Dual-Clutch", ISR = "7-Speed ISR";
      if (T(/ huracan /)) return [LDF];
      if (T(/ aventador /)) return [ISR];
      if (T(/ revuelto /)) return ["8-Speed Dual-Clutch (DCT)"];
      if (T(/ urus /)) return ["8-Speed Automatic"];
      if (T(/ reventon /)) return [EG];
      if (T(/ (gallardo|murcielago) /)) return [OG, EG];
      if (T(/ (diablo|countach|miura|jalpa|espada|jarama|urraco|lm002|silhouette) /)) return ["5-Speed Manual"];
      if (y >= 2014) return [LDF, ISR, "8-Speed Automatic"];
      if (y >= 2011) return [ISR, LDF];
      if (y >= 2002) return [OG, EG];
      if (y) return ["5-Speed Manual"];
      return null;
    }

    function mclarenMatrix(y, m) {
      var T = function (re) { return re.test(m); };
      if (/^ (mclaren )?f1 $/.test(m) || (y >= 1992 && y <= 1998)) return ["6-Speed Manual"];
      if (T(/ artura /) || y >= 2022) return ["8-Speed SSG Dual-Clutch", "7-Speed SSG Dual-Clutch"];
      return ["7-Speed SSG Dual-Clutch", "8-Speed SSG Dual-Clutch"];
    }

    function modelMatrix(y, make, model) {
      var m = " " + String(model || "").toLowerCase().replace(/[()\/,\-_.]+/g, " ").replace(/\s+/g, " ").trim() + " ";
      if (m === "  ") m = " ";
      if (make === "Porsche") return model ? porscheMatrix(y, m) : null;
      if (make === "BMW") return model ? bmwMatrix(y, m) : null;
      if (make === "Dodge") return /viper/.test(m) ? ["6-Speed Manual"] : null;
      if (make === "Ferrari") return (model || y) ? ferrariMatrix(y, m) : null;
      if (make === "Lamborghini") return (model || y) ? lamboMatrix(y, m) : null;
      if (make === "McLaren") return (model || y) ? mclarenMatrix(y, m) : null;
      return null;
    }
    /* make-level fallbacks when the model isn't in the matrix */
    function makeDefaults(year, m) {
      if (m === "Porsche") {
        if (year && year < 2009) return ["6-Speed Manual", "5-Speed Manual", TIP5];
        if (year && year >= 2009) return ["6-Speed Manual", "7-Speed Manual", PDK7];
        return ["6-Speed Manual", "5-Speed Manual", "7-Speed Manual", PDK7, TIP5];
      }
      if (m === "BMW") return ["6-Speed Manual", "5-Speed Manual", "7-Speed M-DCT", "7-Speed SMG III", "8-Speed Automatic"];
      if (m === "Ferrari") return ["6-Speed Open-Gate Manual", "5-Speed Manual", "6-Speed F1 Automated Manual", "7-Speed F1 Dual-Clutch", "8-Speed F1 Dual-Clutch"];
      if (m === "Lamborghini") return ["6-Speed Open-Gate Manual", "5-Speed Manual", "6-Speed E-Gear", "7-Speed LDF Dual-Clutch", "7-Speed ISR", "8-Speed Automatic"];
      if (m === "McLaren") return ["7-Speed SSG Dual-Clutch", "8-Speed SSG Dual-Clutch"];
      if (m === "Mercedes-Benz") return ["6-Speed Manual", "5-Speed Manual", "AMG Speedshift / Automated", "7G-Tronic Automatic", "Automatic"];
      return V.universalTransmissions.filter(function (o) { return o !== CUSTOM; });
    }
    function transmissionOptions(year, make, model) {
      var list = modelMatrix(year, make, model) || makeDefaults(year, make), out = [];
      list.forEach(function (o) { if (o !== CUSTOM && out.indexOf(o) < 0) out.push(o); });
      out.push(CUSTOM);                                              // always last: aftermarket conversions
      return out;
    }

    var transSel = E.transmission, userPicked = false;
    function refreshTransmission() {
      var y = /^\d{4}$/.test(E.year.value) ? +E.year.value : 0;
      var opts = transmissionOptions(y, canonicalMake(E.make.value), E.model.value.trim());
      var cur = transSel.value;
      if (Array.prototype.map.call(transSel.options, function (o) { return o.value; }).join("|") !== opts.join("|")) {
        transSel.innerHTML = opts.map(function (o) { return '<option value="' + esc(o) + '">' + esc(o) + "</option>"; }).join("");
        var keep = userPicked && opts.indexOf(cur) > -1;              // a deliberate pick survives only if still valid
        transSel.value = keep ? cur : opts[0];
        if (!keep) userPicked = false;
      }
      toggleCustomTransmission();
    }
    function toggleCustomTransmission() {
      var show = transSel.value === CUSTOM, field = $("#transCustomField");
      if (field.hidden === show) { field.hidden = !show; if (show) E.transmissionCustom.focus(); }
    }
    transSel.addEventListener("change", function () { userPicked = true; toggleCustomTransmission(); });
    ["input", "suggest:chosen"].forEach(function (ev) {
      E.year.addEventListener(ev, refreshTransmission);
      E.make.addEventListener(ev, refreshTransmission);
      E.model.addEventListener(ev, refreshTransmission);
    });
    refreshTransmission();
    var transmissionValue = function () {
      return transSel.value === CUSTOM ? (E.transmissionCustom.value.trim() || CUSTOM) : transSel.value;
    };

    /* ======================= validation ======================= */
    var lastMsg = {};
    function valid(name) {
      var v = E[name].value.trim();
      lastMsg[name] = "";
      if (!v) return false;
      if (name === "email") { lastMsg.email = "Please enter a valid email address."; return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
      if (name === "phone") { var p = phoneInfo(); lastMsg.phone = p.msg; return p.ok; }
      if (name === "year") { lastMsg.year = "Please enter a 4-digit model year."; return /^\d{4}$/.test(v) && +v >= 1886 && +v <= MAX_YEAR; }
      return true;
    }
    function check(name) {
      var ok = valid(name), el = E[name];
      el.closest(".field").classList.toggle("is-invalid", !ok);
      el.setAttribute("aria-invalid", String(!ok));
      return ok;
    }
    required.forEach(function (n) {
      E[n].addEventListener("input", function () { if (E[n].closest(".is-invalid")) check(n); });
    });

    /* ======================= confirmation ======================= */
    function cell(label, html) { return "<div><dt>" + label + "</dt><dd>" + html + "</dd></div>"; }
    function renderConfirmation(d) {
      $("#cName").textContent = d.firstName + " " + d.lastName;
      $("#cCar").textContent = d.vehicle; $("#cEmail").textContent = d.email;
      var h = cell("REFERENCE", esc(d.reference)) + cell("VEHICLE", esc(d.vehicle)) + cell("TRANSMISSION", esc(d.transmission)) +
        cell("CLIENT CONTACT", esc(d.phone) + "<small>" + esc(d.email) + "</small>");
      if (d.mileage) h += cell("MILEAGE", esc(d.mileage) + " mi");
      if (d.vin) h += cell("VIN", esc(d.vin));
      if (d.payout) h += cell("TARGET NET PAYOUT", "$" + esc(d.payout.replace(/^\$/, "")));
      $("#cSum").innerHTML = h;
    }

    /* ======================= email delivery (FormSubmit) ======================= */
    function emailPayload(d) {
      var p = {
        _subject: "New Valuation Inquiry [Ref: " + d.reference + "] \u2014 " + d.year + " " + d.make + " " + d.model,
        _template: "table", _captcha: "false",
        _replyto: d.email, email: d.email,
        _autoresponse: "Thank you for contacting Scher Masella Motorcars (Reference: " + d.reference + "). We have received your private valuation inquiry for your " +
          d.year + " " + d.make + " " + d.model + ". A Scher Masella advisor is reviewing your vehicle details and will respond with a recommended selling strategy, schedule, and valuation target within one business day. " +
          "\u2014 Scher Masella Motorcars | Private Client Auction Advisory & Collector Vehicle Brokerage (schermasellamotorcars.com)",
        reference: d.reference, name: d.firstName + " " + d.lastName, phone: d.phone, vehicle: d.vehicle,
        year: d.year, make: d.make, model: d.model, transmission: d.transmission
      };
      if (d.mileage) p.mileage = d.mileage;
      if (d.vin) p.vin = d.vin;
      if (d.payout) p.target_net_payout = "$" + d.payout.replace(/^\$/, "");
      return p;
    }
    function readStore() { try { return JSON.parse(localStorage.getItem(STORE) || "[]"); } catch (x) { return []; } }
    function writeStore(a) { try { localStorage.setItem(STORE, JSON.stringify(a)); } catch (x) { /* storage unavailable */ } }
    function markSent(ref) { var a = readStore(); a.forEach(function (r) { if (r.reference === ref) r.sent = true; }); writeStore(a); }
    /* FormSubmit's /ajax/ endpoint silently drops _autoresponse, so the lead is POSTed as a normal form into a hidden iframe:
       the visitor never leaves the page, we get the lead e-mail, and the client gets the auto-response. */
    var inflight = {};
    function send(d) {                                           // never blocks the UI; failures stay unsent and are retried
      if (inflight[d.reference] || navigator.onLine === false) return;
      inflight[d.reference] = true;
      var name = "sm_relay_" + d.reference.replace(/\W/g, "_");
      var ifr = document.createElement("iframe");
      ifr.name = name; ifr.id = name; ifr.title = "Secure submission relay"; ifr.tabIndex = -1; ifr.setAttribute("aria-hidden", "true");
      ifr.style.cssText = "position:absolute;width:0;height:0;border:0;visibility:hidden;pointer-events:none";
      var form = document.createElement("form");
      form.method = "POST"; form.action = formEndpoint(); form.target = name; form.acceptCharset = "UTF-8"; form.style.display = "none";
      var payload = emailPayload(d); payload._honey = "";
      Object.keys(payload).forEach(function (k) {
        var i = document.createElement("input"); i.type = "hidden"; i.name = k; i.value = payload[k]; form.appendChild(i);
      });
      document.body.appendChild(ifr); document.body.appendChild(form);
      var done = false;
      function finish(ok) {
        if (done) return; done = true; delete inflight[d.reference];
        if (ok && navigator.onLine !== false) markSent(d.reference);
        setTimeout(function () { if (form.parentNode) form.parentNode.removeChild(form); if (ifr.parentNode) ifr.parentNode.removeChild(ifr); }, 500);
      }
      try { form.submit(); } catch (x) { finish(false); return; }
      ifr.addEventListener("load", function () { finish(true); });  // attached after submit: ignores the initial about:blank load
      setTimeout(function () { finish(false); }, 25000);
    }
    function retryPending() {
      readStore().filter(function (r) { return r.sent === false && r.year; }).forEach(send);
    }
    window.addEventListener("online", retryPending);
    setTimeout(retryPending, 2500);

    /* ======================= submit ======================= */
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      E.firstName.value = titleName(E.firstName.value); E.lastName.value = titleName(E.lastName.value);
      E.make.value = normalizeMake(E.make.value); E.model.value = normalizeModel(E.make.value, E.model.value);
      refreshTransmission();
      var bad = required.filter(function (n) { return !check(n); });
      if (bad.length) {
        var specific = bad.filter(function (n) { return lastMsg[n] && E[n].value.trim(); });
        err.hidden = false;
        err.textContent = specific.length ? lastMsg[specific[0]] : "Please complete the highlighted fields.";
        E[bad[0]].focus(); return;
      }
      err.hidden = true;
      var ph = phoneInfo(), now = new Date();
      var ref = "SM-" + now.getFullYear() + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0") + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      var d = {
        reference: ref, submitted: now.toISOString(), sent: false,
        firstName: E.firstName.value.trim(), lastName: E.lastName.value.trim(),
        phone: ph.display, phoneE164: ph.e164, email: E.email.value.trim(),
        year: E.year.value.trim(), make: E.make.value.trim(), model: E.model.value.trim(),
        transmission: transmissionValue(), mileage: E.mileage.value.trim(), vin: E.vin.value.trim(), payout: E.payout.value.trim()
      };
      d.vehicle = [d.year, d.make, d.model].join(" ");
      var arr = readStore(); arr.push(d); writeStore(arr);

      renderConfirmation(d);                                       // instant, works offline
      f.hidden = true; conf.hidden = false; conf.focus();
      conf.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "center" });
      if (!E._honey.value) send(d);                                // honeypot: bots see the same screen but nothing is sent
    });
    $("#again").addEventListener("click", function () {
      f.reset(); $$(".is-invalid", f).forEach(function (n) { n.classList.remove("is-invalid"); });
      setDial(US, true); userPicked = false; refreshTransmission(); err.hidden = true; conf.hidden = true; f.hidden = false; E.firstName.focus();
    });
  })();

  /* ---------- scroll reveal ---------- */
  (function reveal() {
    if (REDUCED || !("IntersectionObserver" in window)) return;
    var sel = ".sechead, .callout, .compare-head, .compare, .steps li, .case__copy, .suite, .metric, .val__intro, .val__card, .ledger__scroll, .filters";
    var els = $$(sel);
    els.forEach(function (el) { el.classList.add("reveal"); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (el) { io.observe(el); });
  })();
})();
