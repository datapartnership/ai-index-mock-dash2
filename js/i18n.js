/* Language support (English / Simplified Chinese) for the Global AI Adoption Index mock dashboard.

   How it works
   - The page is authored in English. Chinese is applied at display time only, so the mock data (which is seeded from the
     English labels) is identical in both languages.
   - I18N.t(text) looks the text up in the dictionary, then in the pattern list (for sentences with numbers or names in them).
   - A MutationObserver translates text and a few attributes (title, aria-label, placeholder, alt) of everything that
     enters the page, including content the dashboard engine builds later. <pre> and <code> blocks are left alone.
   - Chart.js text is drawn on a canvas, so the engine passes chart configs through I18N.chart() and canvas labels through I18N.t().
   - The toggle (any element with data-lang="en" or "zh") stores the choice in localStorage and reloads the page.
   - ?lang=zh or ?lang=en in the URL also works, and is remembered.

   Translation tables live in js/i18n.zh.*.js. Add entries with I18N.add({ 'English': '中文' }) and
   I18N.addPatterns([[/regex/, 'replacement with $1 $2' | function]]). Captured groups are translated before they are inserted.
   For a list of strings still missing in Chinese mode, open the page with ?lang=zh and run  I18N.missing()  in the console. */
(function () {
  'use strict';
  var KEY = 'aiIndexLang', SCROLL = 'aiIndexScroll', lang = 'en';
  try {
    var q = new URLSearchParams(location.search).get('lang');
    if (q === 'zh' || q === 'en') { lang = q; localStorage.setItem(KEY, q); }
    else if (localStorage.getItem(KEY) === 'zh') lang = 'zh';
  } catch (e) { /* storage blocked: stay in English */ }
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

  var dict = Object.create(null), pats = [], seenMissing = Object.create(null);
  var HAS_LATIN = /[A-Za-z]/, HAS_CJK = /[㐀-鿿]/;

  function lookup(k) {
    var v = dict[k];
    if (v !== undefined) return v;
    for (var i = 0; i < pats.length; i++) {
      var m = pats[i][0].exec(k);
      if (!m) continue;
      var r = pats[i][1];
      if (typeof r === 'function') return r.apply(null, m.slice(1).map(function (x) { return x == null ? x : t(x); }));
      return r.replace(/\$(\d)/g, function (_, d) { return m[+d] == null ? '' : t(m[+d]); });
    }
    return undefined;
  }
  // t(): translate one string. Leading and trailing whitespace is kept. Unknown strings come back unchanged.
  function t(s) {
    if (lang !== 'zh' || typeof s !== 'string' || !HAS_LATIN.test(s)) return s;
    var k = s.trim(); if (!k) return s;
    var v = lookup(k);
    if (v === undefined) { seenMissing[k] = 1; return s; }
    if (k === s) return v;
    return s.slice(0, s.indexOf(k)) + v + s.slice(s.indexOf(k) + k.length);
  }
  // I18N.wrap helpers: Chinese has no spaces, so long labels are split by length instead.
  function cjkWrap(s, n) {
    var m = Math.max(6, Math.floor(n / 2));
    if (s.length <= m) return s;
    var out = [];
    for (var i = 0; i < s.length; i += m) out.push(s.slice(i, i + m));
    return out;
  }
  function label(l) {
    if (lang !== 'zh') return l;
    if (Array.isArray(l)) { var j = l.join(' '), r = t(j); return r === j ? l : r; }
    return t(l);
  }
  // Translate the text a Chart.js config will draw: category labels, series names, axis titles.
  function chart(cfg) {
    if (lang !== 'zh' || !cfg) return cfg;
    var d = cfg.data;
    if (d) {
      if (d.labels) d.labels = d.labels.map(label);
      (d.datasets || []).forEach(function (ds) { if (ds && typeof ds.label === 'string') ds.label = t(ds.label); });
    }
    var sc = cfg.options && cfg.options.scales;
    if (sc) Object.keys(sc).forEach(function (k) { var ti = sc[k] && sc[k].title; if (ti && typeof ti.text === 'string') ti.text = t(ti.text); });
    var cb = cfg.options && cfg.options.plugins && cfg.options.plugins.tooltip && cfg.options.plugins.tooltip.callbacks;
    if (cb) ['title', 'label', 'footer'].forEach(function (k) {
      var f = cb[k]; if (typeof f !== 'function' || f.__i18n) return;
      var g = function () { var r = f.apply(this, arguments); return Array.isArray(r) ? r.map(t) : t(r); };
      g.__i18n = true; cb[k] = g;
    });
    return cfg;
  }

  // ---------- DOM translation ----------
  var ATTRS = ['title', 'aria-label', 'placeholder', 'alt'];
  var SKIP_TAG = { SCRIPT: 1, STYLE: 1, PRE: 1, CODE: 1, TEXTAREA: 1, NOSCRIPT: 1 };
  function skipped(el) { return !!(el && el.closest && el.closest('pre,code,script,style,textarea,[data-i18n-skip]')); }
  function text(node) {
    var v = node.nodeValue;
    if (!v || !HAS_LATIN.test(v) || skipped(node.parentNode)) return;
    var r = t(v); if (r !== v) node.nodeValue = r;
  }
  function attr(el, name) {
    var v = el.getAttribute(name);
    if (!v || !HAS_LATIN.test(v) || skipped(el)) return;
    var r = t(v); if (r !== v) el.setAttribute(name, r);
  }
  function walk(n) {
    if (n.nodeType === 3) { text(n); return; }
    if (n.nodeType !== 1 || SKIP_TAG[n.tagName]) return;
    for (var i = 0; i < ATTRS.length; i++) if (n.hasAttribute(ATTRS[i])) attr(n, ATTRS[i]);
    for (var c = n.firstChild; c; c = c.nextSibling) walk(c);
  }
  function mark() {
    var bs = document.querySelectorAll('[data-lang]');
    for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', String(bs[i].getAttribute('data-lang') === lang));
  }
  function translateTitle() { if (lang === 'zh') document.title = t(document.title); }

  if (lang === 'zh') {
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i];
        if (m.type === 'childList') { for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]); }
        else if (m.type === 'characterData') text(m.target);
        else if (m.type === 'attributes') attr(m.target, m.attributeName);
      }
      mark();
    }).observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }

  function setLang(l) {
    if (l !== 'en' && l !== 'zh') return;
    try {
      localStorage.setItem(KEY, l);
      sessionStorage.setItem(SCROLL, JSON.stringify({ y: window.scrollY, p: location.pathname }));
      var u = new URL(location.href); if (u.searchParams.has('lang')) { u.searchParams.delete('lang'); history.replaceState(null, '', u.toString()); }
    } catch (e) { /* ignore */ }
    location.reload();
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('[data-lang]');
    if (b && b.getAttribute('data-lang') !== lang) setLang(b.getAttribute('data-lang'));
  });

  // Put the page back where it was after a language switch reloads it.
  function restoreScroll() {
    var s; try { s = JSON.parse(sessionStorage.getItem(SCROLL) || 'null'); sessionStorage.removeItem(SCROLL); } catch (e) { return; }
    if (!s || s.p !== location.pathname || !s.y) return;
    var tries = 0;
    (function go() {
      var enough = document.documentElement.scrollHeight >= s.y + window.innerHeight;
      if (enough || tries++ > 40) { window.scrollTo(0, s.y); return; }
      setTimeout(go, 100);
    })();
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (lang === 'zh') { walk(document.body); translateTitle(); }
    mark();
  });
  window.addEventListener('load', restoreScroll);

  window.I18N = {
    lang: lang,
    t: t,
    chart: chart,
    label: label,
    cjkWrap: cjkWrap,
    isCJK: function (s) { return HAS_CJK.test(s); },
    set: setLang,
    add: function (o) { for (var k in o) dict[k] = o[k]; },
    addPatterns: function (a) { for (var i = 0; i < a.length; i++) pats.push(a[i]); },
    missing: function () { var a = Object.keys(seenMissing); return a; }
  };
})();
