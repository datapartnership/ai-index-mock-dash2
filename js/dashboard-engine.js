/* Global AI Adoption Index — mock dashboard engine (World Bank Group / Loop design-system edition).
   All figures invented; adapted from the original mock, restyled with inline tokens. */
(function () {
'use strict';

const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const T = { // sourced live from the design system's colors.css / spacing.css custom properties
  navy: cssVar('--blue-12'), navyDark: cssVar('--blue-20'), purple: cssVar('--teal-60'),
  orange: cssVar('--orange-57'), orangeDark: cssVar('--orange-46'),
  teal: cssVar('--teal-63'), tealDark: cssVar('--teal-60'),
  blue: cssVar('--blue-45'),
  gray50: cssVar('--gray-97'), gray100: cssVar('--gray-95'), gray200: cssVar('--gray-91'), gray400: cssVar('--gray-44'), gray600: cssVar('--gray-36'), gray800: cssVar('--gray-21'),
  radius: cssVar('--radius-none') || '0', radiusLg: cssVar('--radius-none') || '0',
  shadowSm: cssVar('--shadow-card'), shadowMd: cssVar('--shadow-dropdown')
};
const NAVY = T.navy, ORANGE = T.orangeDark, TEAL = T.tealDark, PURPLE = T.purple;
const SERIES = [NAVY, ORANGE, TEAL, PURPLE];
const RAMP = ['#dbe3f4', '#a9bbe3', '#6f8acb', '#34539f', NAVY];
// Each core indicator has its own sequential ramp, so the map reads as a different measure at a glance:
// Consumer AI use = blue family, API token volume = orange family (design-system tokens).
// Mock-profile countries are marked in near-black instead, which stays visible on both ramps.
const HILITE = cssVar('--gray-7') || '#161616';
const RAMPS = {
  consumer: RAMP,
  api: ['#fde9e3', '#f8bdad', cssVar('--orange-64'), cssVar('--orange-46'), '#7d1b08']
};
const MCOL = { consumer: RAMP[3], api: RAMPS.api[3] };   // mid-dark step of each ramp: dots, axis titles
const NODATA = T.gray200;
const INK = T.gray800;

function h(str) {
  let x = 2166136261;
  for (let i = 0; i < str.length; i++) { x ^= str.charCodeAt(i); x = Math.imul(x, 16777619); }
  x ^= x >>> 15; x = Math.imul(x, 2246822507); x ^= x >>> 13; x = Math.imul(x, 3266489909); x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}
const r1 = v => Math.round(v * 10) / 10;
function shares(key, labels, weights, tilt) {
  const w = labels.map((l, i) => weights[i] * ((tilt && tilt[l]) || 1) * (0.8 + 0.4 * h(key + l)));
  const s = w.reduce((a, b) => a + b, 0);
  return w.map(v => r1(100 * v / s));
}
function sortDesc(labels, values) {
  const idx = labels.map((_, i) => i).sort((a, b) => values[b] - values[a]);
  return [idx.map(i => labels[i]), idx.map(i => values[i])];
}
const QUARTERS = ['2025 Q1', '2025 Q2', '2025 Q3', '2025 Q4', '2026 Q1', '2026 Q2', '2026 Q3'];
function trend(key, start, end) {
  return QUARTERS.map((_, i) => {
    const t = i / (QUARTERS.length - 1);
    return r1((start + (end - start) * t) * (0.97 + 0.06 * h(key + i)));
  });
}
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const pct = v => r1(v) + '%';
function wrap(l, n) {
  if (typeof l !== 'string' || l.length <= n) return l;
  const out = ['']; l.split(' ').forEach(w => { if ((out[out.length - 1] + ' ' + w).trim().length > n) out.push(w); else out[out.length - 1] = (out[out.length - 1] + ' ' + w).trim(); });
  return out;
}
const flat = l => Array.isArray(l) ? l.join(' ') : l;

// ---------- inline-style fragments ----------
const sTag = (bg, fg, dashed) => `display:inline-block;font-size:0.7rem;font-family:var(--font-display);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;padding:0.2rem 0.55rem;border-radius:0;background:${bg};color:${fg};${dashed ? 'border:1px dashed ' + fg + ';' : ''}`;
const tagDefault = sTag(T.gray100, T.gray600);
const tagPartner = sTag('rgba(0,34,69,0.08)', NAVY);
const tagProposed = sTag(T.gray100, T.gray600, true);
const sCardSub = `font-size:0.875rem;color:${T.gray600};margin:0.15rem 0 0.75rem;`;
const sMockNote = `font-size:0.75rem;color:${T.gray400};margin:0.5rem 0 0;`;
const sSmallSecondary = `font-size:0.875rem;color:${T.gray600};`;
const sH3 = `font-size:1.15rem;color:${NAVY};margin:0;font-family:var(--font-display);`;
const sTableBase = 'width:100%;border-collapse:collapse;font-size:0.85rem;';
const sTh = `text-align:left;font-weight:600;color:${T.gray600};padding:0.55rem 0.85rem;border-bottom:2px solid ${T.gray200};`;
const sThEnd = sTh + 'text-align:right;';
const sTd = `padding:0.6rem 0.85rem;border-bottom:1px solid ${T.gray100};color:${T.gray600};vertical-align:top;`;
const sTdEnd = sTd + 'text-align:right;';
const sBtnTable = `min-height:0;padding:0.2rem 0.7rem;font-size:0.8125rem;border:1px solid ${T.gray200};border-radius:0;background:#fff;color:${T.blue};cursor:pointer;font-family:var(--font-body);`;

function panelFrame() {
  return `background:#fff;border:1px solid ${T.gray200};border-top:1px solid ${T.tealDark};border-radius:${T.radiusLg};padding:1.25rem 1.5rem;box-shadow:${T.shadowSm};display:flex;flex-direction:column;`;
}

// ---------- chart-card scaffolding ----------
const charts = {};
function buildChartCards(root) {
  root.querySelectorAll('[data-cc]').forEach(el => {
    const partner = el.dataset.partner ? ` <span style="${tagPartner}">Partner data: ${esc(el.dataset.partner)}</span>` : '';
    const proposed = el.dataset.proposed ? ` <span style="${tagProposed}">proposed</span>` : '';
    const keepFlex = el.style.flex;
    el.style.cssText = panelFrame();
    if (keepFlex) el.style.flex = keepFlex;
    el.innerHTML =
      `<div style="display:flex;justify-content:space-between;gap:0.75rem;align-items:flex-start;">
         <h3 style="${sH3}"><span class="ct">${esc(el.dataset.title || '')}</span>${partner}${proposed}</h3>
         <button type="button" class="btn-table" style="${sBtnTable}" aria-expanded="false">Table</button>
       </div>
       <p class="card-sub" style="${sCardSub}">${esc(el.dataset.sub || '')}</p>
       <div class="chart-box" style="position:relative;flex:1;min-height:${el.dataset.h}px;overflow:hidden"><canvas role="img" style="position:absolute;inset:0;width:100%;height:100%;"></canvas></div>
       <div class="table-box" style="display:none;max-height:18rem;overflow:auto;margin-top:0.5rem;"></div>`;
    const btn = el.querySelector('.btn-table'), box = el.querySelector('.table-box');
    btn.addEventListener('click', () => {
      const hidden = box.style.display === 'none';
      box.style.display = hidden ? 'block' : 'none';
      btn.setAttribute('aria-expanded', String(hidden));
      btn.textContent = hidden ? 'Hide table' : 'Table';
    });
  });
}
function setHead(id, title, sub) {
  const el = document.getElementById(id);
  if (title != null) el.querySelector('.ct').textContent = title;
  if (sub != null) el.querySelector('.card-sub').textContent = sub;
}
function tableHTML(cfg) {
  const d = cfg.data;
  if (cfg.type === 'scatter') {
    let rows = '';
    d.datasets.filter(ds => ds.type !== 'line').forEach(ds => ds.data.forEach(p => { rows += `<tr><td style="${sTd}">${esc(p.name)}</td><td style="${sTdEnd}">${p.tx ?? p.x}</td><td style="${sTdEnd}">${p.ty ?? p.y}</td></tr>`; }));
    const hd = cfg.tableHeads || {};
    return `<table style="${sTableBase}"><thead><tr><th style="${sTh}">Country</th><th style="${sThEnd}">${esc(hd.x || 'x')}</th><th style="${sThEnd}">${esc(hd.y || 'y')}</th></tr></thead><tbody>${rows}</tbody></table>`;
  }
  const head = `<th style="${sTh}"></th>` + d.datasets.map(ds => `<th style="${sThEnd}">${esc(ds.label || 'Value')}</th>`).join('');
  const rows = d.labels.map((l, i) => `<tr><td style="${sTd}">${esc(flat(l))}</td>${d.datasets.map(ds => `<td style="${sTdEnd}">${ds.data[i]}</td>`).join('')}</tr>`).join('');
  return `<table style="${sTableBase}"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
}
function draw(id, cfg) {
  const el = document.getElementById(id);
  if (charts[id] && charts[id].config.type === cfg.type) {
    const ch = charts[id]; ch.data = cfg.data; ch.options = cfg.options; ch.update('none');
    const tb = el.querySelector('.table-box'); if (tb) tb.innerHTML = tableHTML(cfg);
    return;
  }
  if (charts[id]) charts[id].destroy();
  const canvas = el.querySelector('canvas');
  canvas.removeAttribute('width'); canvas.removeAttribute('height');
  canvas.style.cssText = 'position:absolute;inset:0;';
  const ctEl = el.querySelector('.ct');
  if (ctEl) canvas.setAttribute('aria-label', ctEl.textContent + '. Use the Table button for the values.');
  charts[id] = new Chart(canvas, cfg);
  const tableBox = el.querySelector('.table-box');
  if (tableBox) tableBox.innerHTML = tableHTML(cfg);
}
function navyShades(n) {
  return Array.from({ length: n }, (_, i) => d3.interpolateRgb(NAVY, '#a7bfe0')(n <= 1 ? 0 : i / (n - 1)));
}
function hbar(id, labels, values, opt) {
  opt = opt || {};
  draw(id, {
    type: 'bar',
    data: { labels: labels.map(l => wrap(l, opt.wrap || 34)), datasets: [{ label: opt.label || 'Share (%)', data: values, backgroundColor: opt.colors || navyShades(values.length), borderRadius: 0, maxBarThickness: opt.thick || 18 }] },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false }, tooltip: { callbacks: { title: t => flat(t[0].label).replace(/,/g, ' '), label: c => ' ' + c.parsed.x + (opt.unit === undefined ? '%' : opt.unit) } } },
      scales: { x: { beginAtZero: true, max: opt.max, ticks: { callback: opt.unit === '' ? undefined : pct } }, y: { grid: { display: false }, ticks: { autoSkip: false } } }
    }
  });
}
function line(id, labels, series, opt) {
  opt = opt || {};
  draw(id, {
    type: 'line',
    data: { labels, datasets: series.map((s, i) => ({ label: s.name, data: s.data, borderColor: SERIES[i], backgroundColor: SERIES[i], borderWidth: 2, pointRadius: 4, pointHoverRadius: 6, tension: 0.25, pointStyle: ['circle', 'rectRot', 'triangle', 'rect'][i] })) },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: series.length > 1, labels: { usePointStyle: true } }, tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${c.parsed.y}%` } } },
      scales: { y: { beginAtZero: opt.zero !== false, ticks: { callback: pct, maxTicksLimit: 7 } }, x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkipPadding: 12 } } }
    }
  });
}

// =====================================================================
// SECTION 1: WORLD MAP
// =====================================================================
const HIGH = ['United States of America','Canada','United Kingdom','Ireland','Germany','France','Netherlands','Belgium','Luxembourg','Switzerland','Austria','Sweden','Norway','Denmark','Finland','Iceland','Estonia','Spain','Portugal','Italy','Israel','United Arab Emirates','Qatar','Kuwait','Saudi Arabia','Japan','South Korea','Australia','New Zealand','Czechia','Slovenia','Poland','Lithuania','Latvia','Cyprus','Greece','Chile','Uruguay','Malaysia'];
const LOW = ['Malawi','Mozambique','Madagascar','Niger','Chad','Mali','Burkina Faso','Central African Rep.','Dem. Rep. Congo','S. Sudan','Sudan','Somalia','Eritrea','Ethiopia','Burundi','Uganda','Tanzania','Zambia','Zimbabwe','Sierra Leone','Liberia','Guinea','Guinea-Bissau','Togo','Benin','Gambia','Mauritania','Afghanistan','Yemen','Haiti','Lesotho','Congo','Angola','Papua New Guinea','Myanmar','Nepal','Laos','Timor-Leste','Tajikistan','Cameroon','Djibouti','Eq. Guinea','Solomon Is.','Vanuatu'];
const SKIP = ['Antarctica','Fr. S. Antarctic Lands'];
const NO_DATA = ['Taiwan','Kosovo','W. Sahara','Somaliland','N. Cyprus','Falkland Is.','North Korea','Greenland','Puerto Rico','New Caledonia','Palestine'];
const PROFILE = { 'Brazil': 'BR', 'Malawi': 'MW', 'United States of America': 'US' };
const FIXED = { 'Brazil': 0.56, 'Malawi': 0.14, 'United States of America': 0.92 };

const IND = { consumer: 'Consumer AI use', api: 'API token volume' };
const NORM = { pop: 'per resident', wap: 'per working-age resident', gdp: 'per unit of gross domestic product', gdppc: 'relative to GDP per capita' };
const KSLOPE = { pop: 3.0, wap: 2.9, gdp: 1.0, gdppc: 0.6 };
const COR = [
  { id: 'internet', label: 'Population with access to the Internet', unit: '%', lo: 8, hi: 99, a: 0.85, sign: 1 },
  { id: 'urban', label: 'Urban population', unit: '%', lo: 15, hi: 95, a: 0.6, sign: 1 },
  { id: 'lrl', label: 'Low-resource language index', unit: '', lo: 0, hi: 1, a: 0.7, sign: -1 },
  { id: 'phones', label: 'Population with smartphones', unit: '%', lo: 10, hi: 95, a: 0.8, sign: 1 },
  { id: 'elec', label: 'Electrification rate', unit: '%', lo: 12, hi: 100, a: 0.75, sign: 1 },
  { id: 'college', label: 'College graduates (adults)', unit: '%', lo: 1, hi: 50, a: 0.7, sign: 1 }
];
const GWA = ['Getting information','Working with computers','Thinking creatively','Analyzing data or information','Documenting and recording information','Communicating with people outside the organization','Training and teaching others','Making decisions and solving problems','Interpreting the meaning of information for others','Providing consultation and advice to others'];
const GWA_W = [13, 9, 12, 6, 12, 2, 3, 7, 3, 24];   // roughly Claude.ai shares (Anthropic Economic Index)
const IWA = ['Write material for artistic or commercial purposes','Program computer systems or production equipment','Interpret language, cultural, or religious information for others','Prepare informational or instructional materials','Analyze data to improve operations','Edit written materials or documents','Explain technical details of products or services','Explain regulations, policies, or procedures','Develop marketing or promotional materials','Advise others on healthcare or wellness issues'];
const IWA_W = [15, 14, 9, 11, 11, 10, 10, 6, 8, 6];
const TOPICS = ["Management","Science and engineering","Health","Teaching","Business and administration","Information and communications technology","Legal","Social science, counselling, and religion","Writing, translation, and the arts","Clerical support","Service and sales","Skilled agricultural, forestry, and fishery","Craft and related trades","Plant and machine operations and assembly","Elementary tasks"];
const TOPIC_ISCO = {"Management":"1","Science and engineering":"21; 31","Health":"22; 32","Teaching":"23","Business and administration":"24; 33","Information and communications technology":"25; 35","Legal":"261; 3411","Social science, counselling, and religion":"262–263; 3412–3413; 342","Writing, translation, and the arts":"264–265; 343","Clerical support":"4","Service and sales":"5","Skilled agricultural, forestry, and fishery":"6","Craft and related trades":"7","Plant and machine operations and assembly":"8","Elementary tasks":"9"};
const TOPIC_W = [5,9,5,7,12,15,4,4,12,6,6,2,3,2,2];
const ISIC22 = ['A Agriculture, forestry, fishing','B Mining and quarrying','C Manufacturing','D Electricity and gas supply','E Water supply and waste','F Construction','G Wholesale and retail trade','H Transportation and storage','I Accommodation and food services','J Publishing, broadcasting, content','K Telecoms, computing, information services','L Financial and insurance','M Real estate','N Professional, scientific, technical','O Administrative and support services','P Public administration','Q Education','R Human health and social work','S Arts, sports, recreation','T Other services','U Households as employers','V Extraterritorial organizations'];
const ISIC22_W = [3, 1.5, 7, 1.5, 1, 3, 8, 3, 3, 6, 14, 8, 2.5, 12, 5, 4, 9, 5, 2.5, 2, 0.4, 0.3];
// Definitive 10-group industry classification (derived from ISIC)
const IND10 = ['Agriculture, forestry and fishing','Industry, including construction','Trade, transport, accommodation and food','Information and communication','Financial and insurance activities','Real estate, professional, scientific, technical and administrative','Public administration','Education','Human health and social work','Arts, recreation and other services'];
const IND10_W = [2, 12, 16, 26, 16, 17, 3, 3, 2, 3];
// consumer industry weights: the 22 ISIC sections rolled up to the definitive 10 groups
const ISIC_TO_10 = [0, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 4, 5, 5, 5, 6, 7, 8, 9, 9, 9, 9];
const IND10C_W = IND10.map((_, g) => ISIC22_W.reduce((a, w, i) => a + (ISIC_TO_10[i] === g ? w : 0), 0));
// mock affinities: how much more (or less) of a work activity an industry does, and how use types tilt activities
const ICT_AFF = { 0: { 0: 1.5, 6: 1.3 }, 1: { 7: 1.5, 3: 1.2 }, 2: { 5: 1.8, 0: 1.2 }, 3: { 1: 2.2, 2: 1.4 }, 4: { 3: 2.0, 4: 1.5 }, 5: { 4: 1.6, 3: 1.4, 8: 1.4 }, 6: { 4: 1.8, 5: 1.5 }, 7: { 6: 2.6, 0: 1.2 }, 8: { 8: 2.4, 0: 1.3, 6: 1.2 }, 9: { 2: 2.0, 0: 1.1 } };
const ICT_USE = {
  Work: [1, 1.3, 0.9, 1.2, 1.1, 1.2, 0.7, 1.3, 1, 0.9],
  Personal: [1.3, 0.8, 1.5, 0.7, 0.6, 0.7, 0.8, 0.9, 0.9, 1.2],
  Education: [1.2, 0.6, 0.8, 0.6, 0.7, 0.5, 2.4, 0.7, 1.1, 1.5]
};
// Mock occupational-topic affinities for broad general work activities (GWAs).
const OCC_GWA_AFF = { 'Management': { 7: 1.6, 9: 1.5 }, 'Science and engineering': { 1: 1.8, 2: 1.5, 3: 2.2 }, 'Health': { 0: 1.3, 8: 1.5, 9: 1.8 }, 'Teaching': { 0: 1.3, 4: 1.3, 6: 2.5 }, 'Business and administration': { 3: 1.4, 4: 1.8, 7: 1.3 }, 'Information and communications technology': { 1: 4.5, 3: 1.6, 7: 1.4 }, 'Legal': { 4: 1.8, 7: 1.3, 8: 2.2 }, 'Social science, counselling, and religion': { 6: 1.6, 8: 1.3, 9: 2.0 }, 'Writing, translation, and the arts': { 2: 2.4, 4: 1.8, 8: 1.4 }, 'Clerical support': { 0: 1.4, 4: 2.0, 5: 1.2 }, 'Service and sales': { 0: 1.3, 5: 1.8, 9: 1.3 } };
const USE_NAMES = ['Work', 'Personal', 'Education'];
const USE_COL = [NAVY, RAMP[2], RAMP[1]];
function occGwa(key, c, topic) {
  const raw = GWA.map((name, i) => GWA_W[i] * ((OCC_GWA_AFF[topic] || {})[i] || 1) * (c.tilt[name] || 1) * (0.85 + 0.3 * h(key + topic + i)));
  return to100(raw);
}
// table blocks that follow the selected tab of a card
function tblBlock(root, hostSel, name, html) {
  const host = root.querySelector(hostSel); let b = host.querySelector('[data-tbl="' + name + '"]');
  if (!b) { b = document.createElement('div'); b.dataset.tbl = name; host.appendChild(b); }
  b.innerHTML = html;
}
function tblSync(root, hostSel, tabMap) {
  const host = root.querySelector(hostSel), act = Object.keys(tabMap).find(id => root.querySelector('#' + id).getAttribute('aria-selected') === 'true');
  host.querySelectorAll('[data-tbl]').forEach(b => { b.style.display = b.dataset.tbl === tabMap[act] ? 'block' : 'none'; });
}
const WA_TABS = { 'tab-wa-tree': 'tree', 'tab-wa-use': 'use', 'tab-wa-top': 'tree' };
const OCC_TABS = { 'tab-occ-share': 'topics', 'tab-occ-prof': 'topics', 'tab-occ-acts': 'acts' };
// writes each segment's value inside the bar
const segLabels = { id: 'segLabels', afterDatasetsDraw(chart) {
  const ctx = chart.ctx;
  chart.data.datasets.forEach((ds, di) => chart.getDatasetMeta(di).data.forEach((bar, i) => {
    const v = ds.data[i]; if (v < 8) return;
    ctx.save(); ctx.fillStyle = ds.labelColor; ctx.font = "600 12px 'Open Sans', sans-serif"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(Math.round(v) + '%', (bar.x + bar.base) / 2, bar.y); ctx.restore();
  }));
} };
const ORIGIN = ['North America','East Asia','Europe','Other regions'];
const ORIGIN_COL = [RAMPS.api[4], RAMPS.api[3], RAMPS.api[2], RAMPS.api[1]];   // API orange ramp, darkest = largest origin
const ORIGIN_TREND = [0.06, -0.35, 0.05, -0.2];      // mock: first-quarter share relative to the latest quarter
const IND10_TREND = [-0.2, 0.12, -0.18, 0.15, 0.1, -0.1, 0.35, 0.3, 0.3, 0.08];   // mock: growth of each group's share, first to latest quarter
// rounded shares that sum to exactly 100: the largest group takes the rounding remainder
function to100(raw) {
  const s = raw.reduce((a, b) => a + b, 0), v = raw.map(x => r1(100 * x / s)), big = v.indexOf(Math.max(...v));
  v[big] = r1(100 - v.reduce((a, b, i) => a + (i === big ? 0 : b), 0));
  return v;
}
function shareSeries(code, key, end, trend, noise) {
  const n = QUARTERS.length - 1;
  return QUARTERS.map((_, t) => to100(end.map((v, i) => v / Math.pow(1 + trend[i], 1 - t / n) * (t < n ? 1 + (h(code + key + i + t) - 0.5) * noise : 1))));
}
const SKILLS = ['AI literacy and prompting','Machine learning','Data engineering','AI product management','AI governance and ethics','Automation and agents'];
const PUB_IWA = ['Explain regulations, policies, or procedures','Prepare documentation for contracts, applications, or permits','Interpret language, cultural, or religious information for others','Analyze data to improve operations','Respond to customer problems or inquiries','Prepare informational or instructional materials'];   // IWA x industry cells: annual, four quarters pooled
const PUB_COLS = ['Public administration','Education','Health and social work'];

const C = {
  BR: {
    name: 'Brazil', index: [41.8, 58.2], rank: 34, lang: 'Portuguese', lang2: 'English is second, at about 10%',
    sample: 'Sample: about 400,000 classified conversations this quarter (100,000 per firm, four firms; tier 1). All cross-tabs are available.',
    use: [44, 34, 22], langs: [['Portuguese', 86], ['English', 10], ['Spanish', 3], ['Other', 1]],
    peaks: [[15, 1], [21, 0.8]], tilt: { 'Write material for artistic or commercial purposes': 1.25, 'Business and administration': 1.2, 'Writing, translation, and the arts': 1.3, 'L Financial and insurance': 1.5, 'Financial and insurance activities': 1.6, 'Agriculture, forestry and fishing': 1.6, 'A Agriculture, forestry, fishing': 1.6 },
    ct: [true, true, true, true], open: [31, 38], origin: [71, 17, 8, 4],
    lfpr: [61.9, 62.4], adopt: [[9, 19], [12, 22]], skills: [62, 48, 51, 44, 38, 47], eduAtt: [58, 22, 3], eduUse: [17, 22],
    opps: [['AI engineer', 84], ['AI trainer and data annotator', 61], ['Conversation designer', 47], ['ML operations engineer', 39], ['AI compliance analyst', 33]],
    insights: [
      ['Finance leads API use; manufacturing lags', 'Finance and insurance account for the largest share of API tokens, about twice the share of all industry combined. Manufacturing is 7% of work-related consumer AI activity but under-represented in API activity.', 'Adoption support for manufacturing SMEs (shared tooling, vouchers) would target the gap rather than sectors already moving.'],
      ['Portuguese dominates, so local-language quality matters', '86% of queries are in Portuguese. Use is concentrated in writing and business topics where language quality drives usefulness.', 'Public procurement and evaluation standards should test Portuguese performance directly, not rely on English benchmarks.'],
      ['Open-source share is rising', 'Open-source models went from 31% to 38% of API tokens over seven quarters.', 'Compute access and hosting rules will increasingly shape who can build; review data-residency and cloud-credit policy with that in mind.'],
      ['Work use is catching up with personal use', 'Monthly work use roughly doubled to 19% of the working-age population, still behind personal use at 22%.', 'Workforce programmes can build on skills people already have from personal use; prioritise sectors where work use is lowest.']
    ]
  },
  MW: {
    name: 'Malawi', index: [6.1, 12.4], rank: 151, lang: 'English', lang2: 'Chichewa is second, at about 22%',
    sample: 'Sample: Malawi is pooled each quarter with six Eastern African neighbours (about 80,000 classified conversations for the group: 20,000 per firm, four firms). Country figures shown are annual where firms’ volumes allow. In this mock, the industry-by-use breakdown is suppressed while broader GWA views are shown; live availability depends on sample thresholds. API estimates carry wide uncertainty.',
    use: [28, 27, 45], langs: [['English', 71], ['Chichewa', 22], ['Chitumbuka', 3], ['Other', 4]],
    peaks: [[20, 1], [13, 0.45]], tilt: { 'Training and teaching others': 1.8, 'Getting information': 1.3, 'Teaching': 2.2, 'Skilled agricultural, forestry, and fishery': 3, 'Information and communications technology': 0.5, 'Explain technical details of products or services': 1.7, 'Prepare informational or instructional materials': 1.5, 'Interpret language, cultural, or religious information for others': 1.5, 'Program computer systems or production equipment': 0.5, 'Q Education': 2.2, 'A Agriculture, forestry, fishing': 3.5, 'K Telecoms, computing, information services': 0.6, 'Agriculture, forestry and fishing': 3, 'Education': 2.2, 'Public administration': 1.6, 'Human health and social work': 1.5 },
    ct: [true, false, true, true], open: [55, 62], origin: [58, 29, 7, 6],
    lfpr: [72.6, 73.1], adopt: [[0.8, 2.6], [1.0, 3.1]], skills: [34, 12, 15, 9, 14, 11], eduAtt: [14, 3, 0.5], eduUse: [38, 45],
    opps: [['Local-language data annotator', 72], ['Digital agriculture advisor', 54], ['EdTech content developer', 41], ['Mobile money data analyst', 36], ['AI support officer (NGO programmes)', 28]],
    insights: [
      ['Education is the main use', '45% of sampled consumer AI activity is for education, the highest of the three use types, and teaching-related activities lead work use.', 'Teacher training and curriculum guidance on AI would reach the largest existing user group; start there before broader workforce programmes.'],
      ['Chichewa use is substantial despite weak model support', 'About one in five queries is in Chichewa, a low-resource language where model quality is lower.', 'Investment in Chichewa text and speech data (for example through a national language data trust) would improve usefulness for most of the population.'],
      ['Use peaks in the evening', 'Use peaks around 20:00, outside working hours, consistent with personal devices and off-peak data bundles rather than workplace access.', 'Connectivity cost and workplace device access are likely binding constraints; consider zero-rating education uses.'],
      ['Open-source models carry most API use, on a small base', 'Open-source models account for an estimated 62% of API tokens, but the sample is small and the estimate uncertain.', 'Treat API figures as indicative. Shared regional compute may matter more than national infrastructure at this scale.']
    ]
  },
  US: {
    name: 'United States', index: [82.5, 91.3], rank: 3, lang: 'English', lang2: 'Spanish is second, at about 8%',
    sample: 'Sample: about 400,000 classified conversations this quarter (100,000 per firm, four firms; tier 1). All cross-tabs are available. State-level figures are published in the US sub-national index.',
    use: [52, 33, 15], langs: [['English', 88], ['Spanish', 8], ['Chinese', 1.5], ['Other', 2.5]],
    peaks: [[11, 1], [14, 0.95], [21, 0.5]], tilt: { 'Working with computers': 1.5, 'Analyzing data or information': 1.3, 'Information and communications technology': 1.6, 'Science and engineering': 1.3, 'Program computer systems or production equipment': 1.6, 'K Telecoms, computing, information services': 1.4, 'N Professional, scientific, technical': 1.2, 'Information and communication': 1.3 },
    ct: [true, true, true, true], open: [18, 22], origin: [89, 6, 4, 1],
    lfpr: [62.5, 62.6], adopt: [[21, 38], [24, 41]], skills: [81, 77, 72, 70, 58, 79], eduAtt: [91, 38, 14], eduUse: [13, 15],
    opps: [['AI engineer', 68], ['Agent orchestration engineer', 63], ['AI governance lead', 44], ['Forward-deployed engineer', 41], ['AI trainer (domain expert)', 35]],
    insights: [
      ['Work use is concentrated in computing and professional services', 'Information and communications technology is the top occupational topic and information services the top industry in both consumer and API activity.', 'Diffusion policy should focus on lagging sectors such as construction, transport and health, where use is low relative to employment.'],
      ['Use happens during the working day', 'Use peaks late morning and early afternoon, consistent with workplace adoption.', 'Employer practices (training, acceptable-use rules) are the main channel for skills policy.'],
      ['Demand for agent and governance skills is rising fastest', 'LinkedIn postings for agent orchestration and AI governance roles grew more than 40% year on year.', 'Community college and apprenticeship programmes should add these tracks; they are not covered by current ML-focused curricula.'],
      ['Proprietary models dominate API use', '78% of API tokens go to proprietary models, mostly of North American origin.', 'Concentration is a competition and resilience question worth monitoring quarterly.']
    ]
  }
};

const REGION = { BR: 'Latin America & Caribbean', MW: 'Sub-Saharan Africa', US: 'North America' };
// Quarterly benchmark series: [first quarter, latest quarter] on one raw scale per indicator (consumer: share of
// working-age population using AI monthly, %; API: token-volume index). Both are shown as an index with the
// world's first quarter = 100, so growth and level gaps read on the same axis.
const BENCH_ENDS = {
  consumer: { BR: [12, 22], MW: [1.0, 3.1], US: [24, 41], 'Latin America & Caribbean': [14, 24], 'Sub-Saharan Africa': [2.5, 6], 'North America': [22, 38], World: [12, 21] },
  api: { BR: [22, 52], MW: [2.5, 9], US: [52, 88], 'Latin America & Caribbean': [15, 35], 'Sub-Saharan Africa': [2.2, 7], 'North America': [48, 82], World: [13, 33] }
};
// 10-group industry classification (index 0 = all industries). Industry cuts cover work-related use only.
const BENCH_INDUSTRIES = ['All industries'].concat(IND10);
// mock intensity of each industry relative to all industries (=1), a growth drift per industry, and per-economy tilts
const IND_INTENSITY = { consumer: [1, .35, .55, .75, 2.1, 1.6, 1.5, .8, 1.25, .7, .9], api: [1, .2, .6, .7, 3.0, 2.2, 1.7, .6, .8, .5, .6] };
const IND_DRIFT = [0, 0, .05, .05, .45, .35, .3, .05, .1, .05, .1];
const IND_TILT = { BR: { 1: 1.5, 5: 1.3 }, MW: { 1: 3, 8: 2, 4: .5, 7: 1.4 }, US: { 4: 1.3, 6: 1.15 }, 'Latin America & Caribbean': { 1: 1.4, 5: 1.2 }, 'Sub-Saharan Africa': { 1: 2.5, 8: 1.8, 4: .6 }, 'North America': { 4: 1.25, 6: 1.15 }, World: {} };
function benchSeries(kind, who, ind) {   // geometric growth between the two end points, small deterministic noise, indexed to world Q1 = 100
  const [a, b] = BENCH_ENDS[kind][who], base = BENCH_ENDS[kind].World[0], n = QUARTERS.length - 1;
  ind = ind || 0;
  const mult = ind ? IND_INTENSITY[kind][ind] * (IND_TILT[who][ind] || 1) * (0.85 + 0.3 * h(kind + who + 'ind' + ind)) : 1;
  return QUARTERS.map((_, i) => r1(100 * a * Math.pow(b / a, i / n) * (0.985 + 0.03 * h(kind + who + i)) / base * mult * (ind ? 1 + IND_DRIFT[ind] * i / n : 1)));
}

let mapState = {}, svg, projection, path, paths, countries, features;

function heatTable(rows, cols, key, corner) {
  const m = rows.map(rw => cols.map(cl => h(key + rw + cl)));
  const tot = m.flat().reduce((a, b) => a + b, 0);
  const vals = m.map(rw => rw.map(v => r1(100 * v / tot)));
  const max = Math.max(...vals.flat());
  return `<table style="font-size:0.8125rem;border-collapse:separate;border-spacing:2px;width:100%;table-layout:fixed;"><thead><tr><th style="font-weight:500;text-align:left;padding:0.25rem 0.375rem;width:30%;">${esc(corner)}</th>${cols.map(c => `<th style="font-weight:500;text-align:center;vertical-align:bottom;padding:0.25rem 0.375rem;">${esc(c)}</th>`).join('')}</tr></thead><tbody>` +
    rows.map((rw, i) => `<tr><th scope="row" style="font-weight:500;text-align:left;padding:0.25rem 0.375rem;">${esc(rw)}</th>${vals[i].map(v => { const a = 0.08 + 0.87 * v / max; return `<td style="text-align:center;padding:0.375rem;border-radius:0;min-width:3.25rem;background:rgba(0,34,69,${a.toFixed(2)});color:${a > 0.5 ? '#fff' : T.gray800}">${v}</td>`; }).join('')}</tr>`).join('') +
    '</tbody></table>';
}

function score(n) {
  if (FIXED[n] != null) return FIXED[n];
  const base = HIGH.includes(n) ? 0.8 : LOW.includes(n) ? 0.2 : 0.5;
  return base + (h(n) - 0.5) * 0.22;
}
function indValue(n, ind, norm) {
  const k = KSLOPE[norm] * (ind === 'api' ? 1.25 : 1);
  return Math.max(1, Math.round(100 * Math.exp(k * (score(n) - 0.5)) * (0.8 + 0.4 * h(n + ind + norm))));
}
function metricValues(norm) {
  const v = { consumer: {}, api: {} };
  countries.forEach(n => { v.consumer[n] = indValue(n, 'consumer', norm); v.api[n] = indValue(n, 'api', norm); });
  return v;
}
function indicatorDeciles(values) {
  const scale = d3.scaleQuantile().domain(Object.values(values)).range(d3.range(1, 11));
  return Object.fromEntries(Object.entries(values).map(([country, value]) => [country, scale(value)]));
}

function renderMap(root) {
  const ind = root.querySelector('#sel-ind').value, norm = root.querySelector('#sel-norm').value;
  const both = metricValues(norm), values = both[ind], ramp = RAMPS[ind];
  const deciles = { consumer: indicatorDeciles(both.consumer), api: indicatorDeciles(both.api) };
  mapState = { ind, norm, deciles };
  const colors = d3.range(10).map(i => d3.interpolateRgb(ramp[0], ramp[ramp.length - 1])(i / 9));
  const scale = d3.scaleOrdinal().domain(d3.range(1, 11)).range(colors);
  paths.attr('fill', d => deciles[ind][d.properties.name] == null ? NODATA : scale(deciles[ind][d.properties.name]));
  root.querySelector('#map-title').textContent = ind === 'consumer' ? `${IND[ind]} (based on monthly active users) ${NORM[norm]}` : `${IND[ind]} ${NORM[norm]}`;
  const chip = c => `<span style="display:inline-block;width:1rem;height:1rem;border-radius:0;margin-right:0.25rem;vertical-align:-2px;border:1px solid rgba(0,0,0,.15);background:${c}"></span>`;
  root.querySelector('#map-legend').innerHTML = colors.map((c, i) =>
    `<span>${chip(c)}Decile ${i + 1}${i === 0 ? ' (lowest)' : i === 9 ? ' (highest)' : ''}</span>`).join('') +
    `<span>${chip(NODATA)}No data</span>`;

  // Side scatter: API token volume decile against Consumer AI use decile, coloured as on the map.
  // Countries sharing a decile pair are spread slightly within the cell; the table and tooltip keep the exact deciles.
  const jit = s => (h(s) - 0.5) * 0.6;
  const pts = countries.map(n => ({ tx: deciles.consumer[n], ty: deciles.api[n], x: deciles.consumer[n] + jit(n + 'x'), y: deciles.api[n] + jit(n + 'y'), name: n }));
  const fit = fitLinear(pts.map(p => ({ x: p.tx, y: p.ty })));
  setHead('c-scatter', `${IND.api} and ${IND.consumer} deciles`,
    `Each dot is a country, coloured as on the map. Dots are spread slightly within each decile cell. Linear fit on deciles: R² = ${fmt2(fit.r2)}, r = ${fmt2(fit.r)}, n = ${pts.length}.`);
  const scEl = document.getElementById('c-scatter');
  scEl.querySelector('h3').style.fontSize = '1rem';
  scEl.querySelector('h3').style.lineHeight = '1.3';
  scEl.querySelector('.card-sub').style.fontSize = '0.8125rem';
  decileScatter('c-scatter', {
    pts, fit, xDecile: true,
    dotColors: p => scale(deciles[ind][p.name]), dotBorder: ramp[ramp.length - 1] + 'AA',
    color: MCOL.api, xColor: MCOL.consumer,
    xTitle: `${IND.consumer} (decile)`, yTitle: `${IND.api} (decile)`,
    heads: { x: `${IND.consumer} decile`, y: `${IND.api} decile` },
    tip: c => ` ${c.raw.name}: consumer decile ${c.raw.tx}, API decile ${c.raw.ty}`
  });
}

function corValue(n, c) {
  let t = c.a * (score(n) - 0.05) / 0.9 + (1 - c.a) * h(n + c.id);
  t = Math.min(1, Math.max(0, t));
  if (c.sign < 0) t = 1 - t;
  const v = c.lo + (c.hi - c.lo) * t;
  return c.unit === '%' ? Math.round(v) : Math.round(v * 100) / 100;
}

const labelPlugin = {
  id: 'pointLabels',
  afterDatasetsDraw(chart) {
    const meta = chart.getDatasetMeta(1); if (!meta || meta.hidden) return;
    const ctx = chart.ctx; ctx.save(); ctx.font = "500 11px 'Open Sans', sans-serif"; ctx.fillStyle = INK;
    meta.data.forEach((pt, i) => {
      const name = chart.data.datasets[1].data[i].short;
      const right = pt.x > chart.chartArea.right - 70;
      ctx.textAlign = right ? 'right' : 'left';
      ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.strokeText(name, pt.x + (right ? -11 : 11), pt.y + 4); ctx.fillText(name, pt.x + (right ? -11 : 11), pt.y + 4);
    });
    ctx.restore();
  }
};

// Least-squares fit of the decile (y) on the comparator (x)
function fitLinear(pts) {
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const mx = d3.mean(xs), my = d3.mean(ys);
  const sxx = d3.sum(xs, v => (v - mx) ** 2), syy = d3.sum(ys, v => (v - my) ** 2), sxy = d3.sum(xs, (v, i) => (v - mx) * (ys[i] - my));
  const b = sxy / sxx, a = my - b * mx, r = sxy / Math.sqrt(sxx * syy);
  const x0 = d3.min(xs), x1 = d3.max(xs);
  return { r, r2: r * r, n: pts.length, line: [{ x: x0, y: a + b * x0 }, { x: x1, y: a + b * x1 }] };
}
const fmt2 = v => (Math.round(v * 100) / 100).toFixed(2).replace('-', '\u2212');

// "R² = 0.62" printed inside the plot area; the text comes from options.plugins.r2Label
const r2Plugin = {
  id: 'r2Label',
  afterDatasetsDraw(chart) {
    const o = chart.options.plugins && chart.options.plugins.r2Label; if (!o || !o.text) return;
    const ctx = chart.ctx, a = chart.chartArea;
    ctx.save(); ctx.font = "700 13px 'Open Sans', sans-serif";
    const w = ctx.measureText(o.text).width + 16, hgt = 24;
    const x = o.corner === 'tr' ? a.right - w - 8 : a.left + 8, y = a.top + 8;
    ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.fillRect(x, y, w, hgt);
    ctx.strokeStyle = o.color || INK; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, hgt - 1);
    ctx.fillStyle = INK; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillText(o.text, x + 8, y + hgt / 2 + 0.5);
    ctx.restore();
  }
};

const decileAxis = (text, color) => ({ min: 0.5, max: 10.5, afterBuildTicks: ax => { ax.ticks = d3.range(1, 11).map(value => ({ value })); }, ticks: { callback: v => Number.isInteger(v) ? v : '' }, title: { display: true, text, color, font: { size: 12, weight: '600' } } });

// Decile scatter with a fitted trend line and R². Mock-profile countries are drawn as labelled dark diamonds, as on the map.
function decileScatter(id, o) {
  const prof = o.pts.filter(p => PROFILE[p.name]).map(p => Object.assign({ short: p.name === 'United States of America' ? 'United States' : p.name }, p));
  const rest = o.pts.filter(p => !PROFILE[p.name]);
  draw(id, {
    type: 'scatter',
    tableHeads: o.heads,
    data: { datasets: [
      { label: 'Countries', data: rest, order: 1, backgroundColor: o.dotColors ? rest.map(o.dotColors) : o.color + 'B3', borderColor: o.dotBorder || '#fff', borderWidth: 1, pointRadius: 4.5, pointHoverRadius: 6.5 },
      { label: 'Mock profiles', data: prof, order: 0, backgroundColor: HILITE, borderColor: '#fff', borderWidth: 2, pointRadius: 7, pointHoverRadius: 9, pointStyle: 'rectRot' },
      { type: 'line', label: 'Trend line', data: o.fit.line, order: 2, borderColor: INK, borderWidth: 2, borderDash: [6, 4], pointRadius: 0, pointHoverRadius: 0, fill: false, tension: 0 }
    ] },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: { filter: it => it.dataset.type !== 'line', callbacks: { label: o.tip } },
        r2Label: { text: `R² = ${fmt2(o.fit.r2)}`, corner: o.fit.r < 0 ? 'tr' : 'tl', color: o.color }
      },
      scales: {
        x: o.xDecile ? decileAxis(o.xTitle, o.xColor) : { title: { display: true, text: o.xTitle, color: INK, font: { size: 12, weight: '600' } } },
        y: decileAxis(o.yTitle, o.color)
      }
    },
    plugins: [labelPlugin, r2Plugin]
  });
}

// Comparisons: each core indicator's decile against the chosen comparator
let cmpState = {};
function renderComparisons(root) {
  const norm = root.querySelector('#sel-norm-cmp').value, cor = COR.find(c => c.id === root.querySelector('#sel-cor').value);
  const both = metricValues(norm);
  const deciles = { consumer: indicatorDeciles(both.consumer), api: indicatorDeciles(both.api) };
  cmpState = { norm, cor, deciles, fits: {} };
  const xTitle = cor.label + (cor.unit ? ' (' + cor.unit + ')' : '');
  ['consumer', 'api'].forEach(k => {
    const pts = countries.map(n => ({ x: corValue(n, cor), y: deciles[k][n], name: n }));
    const fit = fitLinear(pts);
    cmpState.fits[k] = fit;
    setHead('c-cmp-' + k, `${IND[k]} decile and ${cor.label.toLowerCase()}`,
      `Each dot is a country. Linear fit on deciles: R² = ${fmt2(fit.r2)}, r = ${fmt2(fit.r)}, n = ${pts.length}. ${IND[k]} ${NORM[norm]}; decile 1 is the lowest group and decile 10 the highest.`);
    decileScatter('c-cmp-' + k, {
      pts, fit, color: MCOL[k],
      xTitle, yTitle: `${IND[k]} (decile)`,
      heads: { x: cor.label, y: `${IND[k]} decile` },
      tip: c => ` ${c.raw.name}: ${c.raw.x}${cor.unit}, decile ${c.raw.y}`
    });
  });
}

function renderBenchmark(root, code, c, q) {
  const region = REGION[code], QL = QUARTERS.slice(0, q + 1);
  const ind = +root.querySelector('#sel-ind-bench').value, indName = BENCH_INDUSTRIES[ind];
  root.querySelector('#bench-region-label').textContent = region;
  const kinds = { consumer: { id: 'c-bench-consumer', color: MCOL.consumer, light: RAMP[2] }, api: { id: 'c-bench-api', color: RAMPS.api[3], light: RAMPS.api[2] } };
  Object.keys(kinds).forEach(k => {
    const o = kinds[k];
    setHead(o.id, `${IND[k]} growth index`, ind ? `${indName}. 2025 Q1 = 100` : 'All industries. 2025 Q1 = 100');
    const mk = (label, who, style) => Object.assign({ label, data: benchSeries(k, who, ind).slice(0, q + 1), pointRadius: 4, pointHoverRadius: 6, tension: 0.2 }, style);
    draw(o.id, {
      type: 'line',
      data: { labels: QL, datasets: [
        mk(c.name, code, { borderColor: o.color, backgroundColor: o.color, borderWidth: 3, pointStyle: 'circle' }),
        mk(region, region, { borderColor: o.light, backgroundColor: o.light, borderWidth: 2, borderDash: [7, 4], pointStyle: 'rectRot' }),
        mk('World', 'World', { borderColor: T.gray400, backgroundColor: T.gray400, borderWidth: 2, borderDash: [2, 3], pointStyle: 'triangle' })
      ] },
      options: {
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { labels: { usePointStyle: true } }, tooltip: { callbacks: { label: x => ` ${x.dataset.label}: ${x.parsed.y}` } } },
        scales: { y: { beginAtZero: true, title: { display: true, text: 'Growth index (2025 Q1 = 100)', font: { size: 11 } }, ticks: { maxTicksLimit: 7 } }, x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkipPadding: 12 } } }
      }
    });
  });
}

// =====================================================================
// Work activities: GWA treemap with drill-down to the IWAs inside each GWA
// =====================================================================
// General work activities (GWAs) each contain intermediate work activities (IWAs). Mock hierarchy; weights are relative.
const WA_TREE = {   // O*NET IWAs under each GWA that the sampling standard can report by country each quarter; weights roughly Claude.ai shares
  'Getting information': [['Gather information from physical or electronic sources', 11.9], ['Read documents or materials to inform work processes', 0.3], ['Other activities in this group (published half-yearly, annually or by region)', 0.6]],
  'Working with computers': [['Resolve computer problems', 3.4], ['Program computer systems or production equipment', 3.1], ['Process digital or online data', 2.6], ['Other activities in this group (published half-yearly, annually or by region)', 0.3]],
  'Thinking creatively': [['Design computer or information systems or applications', 2.6], ['Develop marketing or promotional materials', 2.2], ['Create visual designs or displays', 2.0], ['Develop news, entertainment, or artistic content', 1.8], ['Develop business or marketing plans', 0.8], ['Other activities in this group (published half-yearly, annually or by region)', 2.4]],
  'Analyzing data or information': [['Analyze data to improve operations', 2.1], ['Analyze scientific or applied data using mathematical principles', 1.2], ['Analyze market or industry conditions', 0.8], ['Evaluate designs, specifications, or other technical data', 0.6], ['Other activities in this group (published half-yearly, annually or by region)', 1.2]],
  'Documenting and recording information': [['Prepare informational or instructional materials', 4.1], ['Write material for artistic or commercial purposes', 3.5], ['Present research or technical information', 1.5], ['Maintain operational records', 0.8], ['Other activities in this group (published half-yearly, annually or by region)', 1.7]],
  'Communicating with people outside the organization': [['Respond to customer problems or inquiries', 2.0], ['Other activities in this group (published half-yearly, annually or by region)', 0.1]],
  'Training and teaching others': [['Teach academic or vocational subjects', 2.9], ['Other activities in this group (published half-yearly, annually or by region)', 0.3]],
  'Making decisions and solving problems': [['Edit written materials or documents', 5.3], ['Diagnose system or equipment problems', 1.0], ['Other activities in this group (published half-yearly, annually or by region)', 0.3]],
  'Interpreting the meaning of information for others': [['Explain technical details of products or services', 1.3], ['Interpret language, cultural, or religious information for others', 1.0], ['Explain regulations, policies, or procedures', 0.6], ['Explain medical information to patients or family members', 0.3], ['Other activities in this group (published half-yearly, annually or by region)', 0.2]],
  'Providing consultation and advice to others': [['Advise others on the design or use of technologies', 6.2], ['Advise others on products or services', 6.0], ['Counsel others about personal matters', 2.4], ['Advise patients or clients on medical issues', 2.4], ['Advise others on business or operational matters', 2.1], ['Advise others on financial matters', 1.7], ['Other activities in this group (published half-yearly, annually or by region)', 3.1]]
};
let waData = [], waSel = null, waW = 0, waFocus = null;
function relLum(col) { const c = d3.rgb(col), f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); }
const contrastOf = (a, b) => { const x = relLum(a), y = relLum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const inkOn = bg => contrastOf(bg, '#ffffff') >= contrastOf(bg, '#161616') ? '#ffffff' : '#161616';

function waBuild(key, c) {
  const gs = shares(key + 'gwa', GWA, GWA_W, c.tilt);
  const items = GWA.map((name, i) => {
    const iw = WA_TREE[name], tot = gs[i];
    const raw = shares(key + 'wa' + i, iw.map(x => x[0]), iw.map(x => x[1]), c.tilt).map(p => tot * p / 100);
    const tenths = raw.map(v => Math.round(v * 10));           // round to 0.1 so the IWAs add up to the GWA
    tenths[tenths.indexOf(Math.max(...tenths))] += Math.round(tot * 10) - tenths.reduce((a, b) => a + b, 0);
    return { name, share: tot, iwas: iw.map((x, j) => ({ name: x[0], value: tenths[j] / 10, other: x[0].startsWith('Other activities') })).sort((a, b) => (a.other - b.other) || (b.value - a.value)) };
  }).sort((a, b) => b.share - a.share);
  const ramp = d3.interpolateRgb(NAVY, '#a9bbe3');
  items.forEach((d, i) => { d.color = ramp(items.length > 1 ? 0.92 * i / (items.length - 1) : 0); });
  return items;
}

function waLayout(root) {
  const host = root.querySelector('#wa-tree'); if (!host || !waData.length) return;
  const W = host.clientWidth; if (!W) return;                     // hidden tab: laid out when it is shown
  waW = W;
  const btn = (d, pos, inner, extra) => `<button type="button" class="wa-tile" data-name="${esc(d.name)}" aria-pressed="${d.name === waSel}" aria-controls="wa-detail" style="${pos}background:${d.color};color:${inkOn(d.color)};${extra || ''}">${inner}</button>`;
  if (W < 640) {
    // phones: a treemap would leave slivers too thin to read, so stack full-width tiles (colour and figure still carry the share)
    const rowH = 64, gap = 4;
    host.style.height = (waData.length * (rowH + gap) - gap) + 'px';
    host.innerHTML = waData.map((d, i) => { const sel = d.name === waSel;
      return btn(d, `left:0;top:${i * (rowH + gap)}px;width:100%;height:${rowH}px;`,
        `<span class="wa-name" style="font-size:0.9375rem">${esc(d.name)}</span><span class="wa-foot" style="align-items:center;"><span class="wa-pct" style="font-size:1.25rem">${d.share}%</span><i class="loop ${sel ? 'loop-angle-down' : 'loop-angle-right'}" aria-hidden="true"></i></span>`,
        'flex-direction:row;align-items:center;gap:12px;'); }).join('');
  } else {
    const H = Math.round(Math.min(540, W * 0.42));
    host.style.height = H + 'px';
    const hier = d3.hierarchy({ children: waData.map(d => ({ name: d.name, value: d.share })) }).sum(d => d.value || 0).sort((a, b) => b.value - a.value);
    d3.treemap().size([W, H]).paddingInner(4).round(true)(hier);
    host.innerHTML = hier.leaves().map(l => {
      const d = waData.find(x => x.name === l.data.name), w = l.x1 - l.x0, hh = l.y1 - l.y0, sel = d.name === waSel;
      const big = w >= 300 && hh >= 170, small = w < 170 || hh < 110;
      const nameSize = big ? '1.25rem' : small ? '0.8125rem' : '1.0625rem', pctSize = big ? '1.75rem' : small ? '1rem' : '1.375rem';
      const tag = w < 110 ? '' : `<span class="wa-tag">${sel ? 'Shown below' : (n => n + (n === 1 ? ' activity' : ' activities'))(d.iwas.filter(x => !x.other).length)} <i class="loop ${sel ? 'loop-angle-down' : 'loop-angle-right'}" aria-hidden="true"></i></span>`;
      return btn(d, `left:${l.x0}px;top:${l.y0}px;width:${w}px;height:${hh}px;`,
        `<span class="wa-name" style="font-size:${nameSize}">${esc(d.name)}</span><span class="wa-foot"${w < 170 ? ' style="flex-direction:column;align-items:flex-start;gap:4px;"' : ''}><span class="wa-pct" style="font-size:${pctSize}">${d.share}%</span>${tag}</span>`);
    }).join('');
  }
  if (waFocus) { const b = Array.from(host.querySelectorAll('.wa-tile')).find(x => x.dataset.name === waFocus); if (b) b.focus(); waFocus = null; }
  waDetail(root);
}

function waDetail(root) {
  const el = root.querySelector('#wa-detail'), d = waData.find(x => x.name === waSel); if (!el || !d) return;
  const max = Math.max(...d.iwas.map(x => x.value));
  el.innerHTML = `<div style="border-left:6px solid ${d.color};padding:0.125rem 0 0.25rem 1.25rem;">
    <div style="font-size:0.8125rem;color:${T.gray600};">All work activities / <strong style="color:${T.gray800};">${esc(d.name)}</strong></div>
    <h4 style="font-family:var(--font-display);font-size:1.25rem;font-weight:600;color:${NAVY};margin:0.25rem 0 0;">${esc(d.name)}</h4>
    <p style="font-size:0.875rem;color:${T.gray600};margin:0.25rem 0 0.75rem;">${(n => n === 1 ? 'One intermediate work activity (IWA)' : n + ' intermediate work activities (IWAs)')(d.iwas.filter(x => !x.other).length)} under this work activity can be reported for each country every quarter; rarer ones are published half-yearly, annually or by region. Together the work activity makes up ${d.share}% of consumer AI activity.</p>
    ${d.iwas.map(x => `<div class="wa-row"><div class="wa-row-label">${esc(x.name)}</div>
      <div class="wa-row-track"><div style="height:100%;width:${(100 * x.value / max).toFixed(1)}%;background:${MCOL.consumer};"></div></div>
      <div class="wa-row-val"><strong>${x.value}%</strong> <span style="color:${T.gray600};">${Math.round(100 * x.value / d.share)}% of this activity</span></div></div>`).join('')}
  </div>`;
}

function renderWorkActivities(root, key, c) {
  waData = waBuild(key, c);
  if (!waData.some(d => d.name === waSel)) waSel = waData[0].name;
  waLayout(root);
  // second tab: the ten largest intermediate work activities across all work activities
  const all = waData.flatMap(d => d.iwas.filter(x => !x.other).map(x => Object.assign({ gwa: d.name }, x))).sort((a, b) => b.value - a.value);
  const top = all.slice(0, 10);
  hbar('c-iwa', top.map(x => x.name), top.map(x => x.value), { wrap: 46, max: Math.ceil(top[0].value / 2) * 2 });
  tblBlock(root, '#wa-table', 'tree', `<table style="${sTableBase}"><thead><tr><th style="${sTh}">Work activity (GWA)</th><th style="${sTh}">Intermediate work activity (IWA)</th><th style="${sThEnd}">% of work-related consumer AI activity</th></tr></thead><tbody>` +
    waData.map(d => `<tr><td style="${sTd}font-weight:600;color:${T.gray800};">${esc(d.name)}</td><td style="${sTd}"></td><td style="${sTdEnd}font-weight:600;">${d.share}</td></tr>` +
      d.iwas.map(x => `<tr><td style="${sTd}"></td><td style="${sTd}">${esc(x.name)}</td><td style="${sTdEnd}">${x.value}</td></tr>`).join('')).join('') + '</tbody></table>');
  renderUseByGwa(root, key, c);
  tblSync(root, '#wa-table', WA_TABS);
}

// ---------- Work activities by use type (100% stacked bars) ----------
function renderUseByGwa(root, key, c) {
  const box = root.querySelector('#c-wause'), msg = root.querySelector('#wa-use-msg');
  if (!c.ct[0]) {
    if (charts['c-wause']) { charts['c-wause'].destroy(); delete charts['c-wause']; }
    box.style.display = 'none'; msg.style.display = 'block';
    msg.innerHTML = `<div style="border-left:0.375rem solid ${T.orangeDark};background:${T.gray50};padding:0.75rem 1rem;"><strong>Not available for ${esc(c.name)}.</strong> The sample is below the disclosure threshold for this breakdown. It will appear when the sample is large enough.</div>`;
    tblBlock(root, '#wa-table', 'use', '');
    return;
  }
  box.style.display = 'block'; msg.style.display = 'none';
  const ord = waData.slice().sort((a, b) => b.share - a.share);
  const split = ord.map(d => { const g = GWA.indexOf(d.name);
    return to100(USE_NAMES.map((u, ui) => c.use[ui] * ICT_USE[u][g] * (0.85 + 0.3 * h(key + 'use' + ui + g)))); });
  draw('c-wause', {
    type: 'bar',
    data: { labels: ord.map(d => wrap(d.name, 40)), datasets: USE_NAMES.map((u, ui) => ({ label: u, data: split.map(r => r[ui]), backgroundColor: USE_COL[ui], labelColor: inkOn(USE_COL[ui]), borderColor: '#fff', borderWidth: 1, maxBarThickness: 26 })) },
    options: { indexAxis: 'y', interaction: { mode: 'index', intersect: false },
      plugins: { tooltip: { callbacks: { title: t => flat(t[0].label).replace(/,/g, ' '), label: x => ` ${x.dataset.label}: ${x.parsed.x}%` } } },
      scales: { x: { stacked: true, max: 100, ticks: { callback: pct } }, y: { stacked: true, grid: { display: false }, ticks: { autoSkip: false } } } },
    plugins: [segLabels]
  });
  tblBlock(root, '#wa-table', 'use', `<table style="${sTableBase}"><thead><tr><th style="${sTh}">Work activity (GWA)</th>${USE_NAMES.map(u => `<th style="${sThEnd}">${u} (%)</th>`).join('')}</tr></thead><tbody>` +
    ord.map((d, i) => `<tr><td style="${sTd}">${esc(d.name)}</td>${split[i].map(v => `<td style="${sTdEnd}">${v}</td>`).join('')}</tr>`).join('') + '</tbody></table>');
}

// ---------- Industry (API): growth index and latest-quarter rank index ----------
function renderIndustryTrends(root, series, q) {
  const QL = QUARTERS.slice(0, q + 1), grid = root.querySelector('#ind10-grid');
  IND10.forEach((_, i) => { const id = 'ind10-p' + i; if (charts[id]) { charts[id].destroy(); delete charts[id]; } });
  const signed = d => (d >= 0 ? '+' : '−') + Math.abs(d).toFixed(1);
  const col = IND10.map((_, i) => series.slice(0, q + 1).map(r => r1(100 * r[i] / series[0][i])));
  grid.innerHTML = IND10.map((name, i) => {
    const vals = col[i], now = vals[q], d = q > 0 ? r1(now - 100) : null;
    const dTxt = d == null ? 'Base quarter' : `${signed(d)}% since ${QL[0]}`;
    const lbl = `${name}: growth index ${now.toFixed(1)} in ${QL[q]}` + (d == null ? '' : `, ${signed(d)}% since ${QL[0]}`);
    return `<div class="ind-panel" role="group" aria-label="${esc(lbl)}"><div class="ind-name">${esc(name)}</div><div class="ind-val"><strong>${now.toFixed(1)}</strong><span>${dTxt}</span></div><div id="ind10-p${i}" class="ind-cv"><canvas role="img" aria-label="Growth index line chart: ${esc(lbl)}" style="position:absolute;inset:0;"></canvas></div></div>`;
  }).join('');
  IND10.forEach((name, i) => draw('ind10-p' + i, {
    type: 'line',
    data: { labels: QL, datasets: [{ label: name, data: col[i], borderColor: MCOL.api, backgroundColor: MCOL.api, borderWidth: 2, tension: 0.25, pointRadius: c => c.dataIndex === q ? 4 : 0, pointHoverRadius: 5 }] },
    options: {
      plugins: { legend: { display: false }, tooltip: { callbacks: { title: t => t[0].label, label: c => ` Growth index: ${c.parsed.y.toFixed(1)} (2025 Q1 = 100)` } } },
      scales: {
        y: { beginAtZero: true, grace: '10%', title: { display: true, text: 'Growth index (2025 Q1 = 100)', font: { size: 10 } }, ticks: { maxTicksLimit: 3, font: { size: 11 } } },
        x: { grid: { display: false }, ticks: { autoSkip: false, maxRotation: 0, font: { size: 11 }, callback: function (v, j, t) { return (j === 0 || j === t.length - 1) ? this.getLabelForValue(v) : ''; } } }
      }
    }
  }));
  root.querySelector('#ind10-growth-table').innerHTML = `<table style="${sTableBase}"><thead><tr><th style="${sTh}">Industry (growth index, 2025 Q1 = 100)</th>${QL.map(l => `<th style="${sThEnd}">${l}</th>`).join('')}</tr></thead><tbody>` +
    IND10.map((name, i) => `<tr><td style="${sTd}">${esc(name)}</td>${col[i].map(v => `<td style="${sTdEnd}">${v.toFixed(1)}</td>`).join('')}</tr>`).join('') + '</tbody></table>';
  const [rankLabels, rankValues] = sortDesc(IND10, series[q]);
  hbar('c-ind10', rankLabels, rankValues, { wrap: 46, colors: rankLabels.map(() => MCOL.api) });
  root.querySelector('#ind10-rank-table').innerHTML = `<table style="${sTableBase}"><thead><tr><th style="${sTh}">Rank</th><th style="${sTh}">Industry</th><th style="${sThEnd}">Share of API tokens (%)</th></tr></thead><tbody>` +
    rankLabels.map((name, i) => `<tr><td style="${sTd}">${i + 1}</td><td style="${sTd}">${esc(name)}</td><td style="${sTdEnd}">${rankValues[i]}</td></tr>`).join('') + '</tbody></table>';
}

// ---------- Occupational topics: share bars + proficiency squares ----------
const GRAY_KEY = '#787878';
const PROF_COL = { Low: RAMP[1], Medium: RAMP[2], High: NAVY };
function renderOccupations(root, code, topicShare) {
  const profBase = { US: 0.62, BR: 0.5, MW: 0.36 }[code];
  const prof = {};
  TOPICS.forEach(t => {
    const p = profBase + (h(code + t + 'prof') - 0.5) * 0.5 + (/Information|Science|Legal/.test(t) ? 0.12 : 0);
    const hi = Math.min(55, Math.max(8, p * 55)), lo = Math.min(45, Math.max(5, (1 - p) * 35));
    const v = [r1(lo), r1(100 - hi - lo), r1(hi)];    // Low, Medium, High
    v[1] = r1(100 - v[0] - v[2]);
    // twenty squares, each 5% of the topic's conversations (largest-remainder rounding)
    const raw = v.map(x => x / 5), n = raw.map(Math.floor);
    let left = 20 - n.reduce((a, b) => a + b, 0);
    raw.map((x, i) => [x - n[i], i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left > 0) { n[i]++; left--; } });
    prof[t] = { v, n };
  });
  const [tls, tvs] = sortDesc(TOPICS, topicShare);
  hbar('c-occ', tls.slice(0, 10), tvs.slice(0, 10), { wrap: 40, thick: 26 });
  const top = tls.slice(0, 10).sort((a, b) => prof[b].v[2] - prof[a].v[2]);
  const key = (nm, c) => `<span><span class="occ-key" style="background:${PROF_COL[nm]};border:1px solid ${RAMP[2]};"></span>${nm}</span>`;
  root.querySelector('#occ-prof').innerHTML =
    `<div class="occ-legend">${key('Low')}${key('Medium')}${key('High')}<span><span class="occ-key" style="background:${GRAY_KEY};"></span>= 5% of the topic's consumer AI activity</span></div>` +
    `<div role="list" aria-label="Occupational topics by proficiency, highest share of high proficiency first">` +
    top.map(t => {
      const { v, n } = prof[t], sq = ['Low', 'Medium', 'High'].map((nm, i) => Array(n[i]).fill(`<b style="background:${PROF_COL[nm]};border:1px solid ${RAMP[2]};"></b>`).join('')).join('');
      const lbl = `${t}: ${v[2]}% high, ${v[1]}% medium, ${v[0]}% low proficiency`;
      return `<div class="occ-row" role="listitem" aria-label="${esc(lbl)}"><span class="occ-name">${esc(t)}</span><span class="occ-sq" aria-hidden="true">${sq}</span><span class="occ-val"><strong>${v[2]}%</strong> High</span></div>`;
    }).join('') + '</div>';
  tblBlock(root, '#occ-table', 'topics', `<table style="${sTableBase}"><thead><tr><th style="${sTh}">Occupational topic</th><th style="${sTh}">ISCO-08</th><th style="${sThEnd}">Share of consumer AI activity (%)</th><th style="${sThEnd}">Low (%)</th><th style="${sThEnd}">Medium (%)</th><th style="${sThEnd}">High (%)</th></tr></thead><tbody>` +
    tls.map((t, i) => `<tr><td style="${sTd}">${esc(t)}</td><td style="${sTd}font-size:0.75rem;color:${T.gray400};">${esc(TOPIC_ISCO[t])}</td><td style="${sTdEnd}">${tvs[i]}</td><td style="${sTdEnd}">${prof[t].v[0]}</td><td style="${sTdEnd}">${prof[t].v[1]}</td><td style="${sTdEnd}">${prof[t].v[2]}</td></tr>`).join('') + '</tbody></table>');
  renderOccActivities(root, code, tls);
  tblSync(root, '#occ-table', OCC_TABS);
}

let occSel = null;
function renderOccActivities(root, code, topicsBySize) {
  const c = C[code], key = code + root.querySelector('#sel-q').value, sel = root.querySelector('#sel-occ-topic'), out = root.querySelector('#occ-acts');
  if (!occSel || !TOPICS.includes(occSel)) occSel = topicsBySize[0];
  sel.innerHTML = topicsBySize.map(t => `<option value="${esc(t)}"${t === occSel ? ' selected' : ''}>${esc(t)}</option>`).join('');
  if (!c.ct[2]) {
    out.innerHTML = `<div style="border-left:0.375rem solid ${T.orangeDark};background:${T.gray50};padding:0.75rem 1rem;"><strong>Not available for ${esc(c.name)}.</strong> The sample is below the disclosure threshold for this cross-tab. It will appear when the sample is large enough.</div>`;
    tblBlock(root, '#occ-table', 'acts', '');
    return;
  }
  const mine = occGwa(key, c, occSel).map(v => r1(v));
  const tw = TOPIC_W.reduce((a, b) => a + b, 0);
  const avg = GWA.map((_, i) => TOPICS.reduce((a, t, ti) => a + TOPIC_W[ti] * occGwa(key, c, t)[i], 0) / tw);
  const ord = GWA.map((_, i) => i).sort((a, b) => mine[b] - mine[a]), top = ord.slice(0, 8);
  const scale = Math.max(...top.map(i => Math.max(mine[i], avg[i]))) * 1.08;
  out.innerHTML = `<div style="font-size:0.8125rem;color:${T.gray600};margin:0 0 0.5rem;"><span style="display:inline-block;width:14px;height:10px;background:${MCOL.consumer};margin-right:0.35rem;"></span>Share of this occupation's work-related AI use <span style="display:inline-block;width:2px;height:14px;background:${T.gray800};margin:0 0.35rem 0 1.25rem;vertical-align:middle;"></span>Weighted average across occupational topics</div>` +
    top.map(i => { const x = mine[i];
      return `<div class="wa-row"><div class="wa-row-label">${esc(GWA[i])}</div><div class="wa-row-track" style="position:relative;"><div style="height:100%;width:${(100 * x / scale).toFixed(1)}%;background:${MCOL.consumer};"></div><div title="Weighted average across occupational topics: ${avg[i].toFixed(1)}%" style="position:absolute;top:-2px;bottom:-2px;left:${(100 * avg[i] / scale).toFixed(1)}%;width:2px;background:${T.gray800};"></div></div><div class="wa-row-val"><strong>${x}%</strong> <span style="color:${T.gray600};">vs ${avg[i].toFixed(1)}% weighted average</span></div></div>`; }).join('') +
    `<p style="font-size:0.8125rem;color:${T.gray600};margin:0.75rem 0 0;">The eight largest of ${GWA.length} general work activities are shown; the Table button lists all ten.</p>`;
  tblBlock(root, '#occ-table', 'acts', `<table style="${sTableBase}"><thead><tr><th style="${sTh}">General work activity (GWA), ${esc(occSel)}</th><th style="${sThEnd}">Share of this occupation's work-related AI use (%)</th><th style="${sThEnd}">Weighted average across occupational topics (%)</th><th style="${sThEnd}">Difference (percentage points)</th></tr></thead><tbody>` +
    ord.map(i => `<tr><td style="${sTd}">${esc(GWA[i])}</td><td style="${sTdEnd}">${mine[i]}</td><td style="${sTdEnd}">${avg[i].toFixed(1)}</td><td style="${sTdEnd}">${(mine[i] - avg[i] >= 0 ? '+' : '\u2212') + Math.abs(mine[i] - avg[i]).toFixed(1)}</td></tr>`).join('') + '</tbody></table>');
}

// ---------- Industry (consumer): separate use-type and work-activity views ----------
function ictMatrix(key) {
  return IND10.map((_, i) => {
    const raw = GWA_W.map((w, g) => w * ((ICT_AFF[i] || {})[g] || 1) * ICT_USE.Work[g] * (0.85 + 0.3 * h(key + 'Work' + i + g)));
    const s = raw.reduce((a, b) => a + b, 0); return raw.map(v => 100 * v / s);
  });
}
function industryUseShares(key, c) {
  return IND10.map((_, i) => to100(USE_NAMES.map((use, ui) => c.use[ui] * GWA_W.reduce((sum, weight, g) =>
    sum + weight * ((ICT_AFF[i] || {})[g] || 1) * ICT_USE[use][g] * (0.85 + 0.3 * h(key + 'industry-use' + ui + i + g)), 0))));
}
function renderIndustryUseCross(root, key, c) {
  const box = root.querySelector('#ict-use-box');
  if (!c.ct[1]) {
    box.innerHTML = `<div style="border-left:0.375rem solid ${T.orangeDark};background:${T.gray50};padding:0.75rem 1rem;"><strong>Not available for ${esc(c.name)}.</strong> The industry-by-use sample is below the disclosure threshold.</div>`;
    return;
  }
  const values = industryUseShares(key, c);
  const rows = IND10.map((name, i) => `<tr><th scope="row" style="${sTd}font-weight:500;">${esc(name)}</th>${values[i].map((v, ui) =>
    `<td style="${sTdEnd}background:${USE_COL[ui]}18;color:${T.gray800};">${v}%</td>`).join('')}</tr>`).join('');
  box.innerHTML = `<table style="${sTableBase}"><caption style="text-align:left;color:${T.gray600};padding:0.5rem 0;">Share of consumer AI activity within each industry; each row sums to 100%.</caption><thead><tr><th style="${sTh}">Industry</th>${USE_NAMES.map((use, ui) => `<th style="${sThEnd}color:${USE_COL[ui]};">${esc(use)} (%)</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`;
}
function renderIndustryCross(root, key, c, indW) {
  const box = root.querySelector('#ict-box');
  renderIndustryUseCross(root, key, c);
  if (!c.ct[3]) {
    box.innerHTML = `<div style="border-left:0.375rem solid ${T.orangeDark};background:${T.gray50};padding:0.75rem 1rem;"><strong>Not available for ${esc(c.name)}.</strong> The industry-by-GWA sample is below the disclosure threshold.</div>`;
    return;
  }
  const view = root.querySelector('#sel-ict-view').value;
  const m = ictMatrix(key), tw = indW.reduce((a, b) => a + b, 0);
  const avg = GWA.map((_, g) => m.reduce((a, rw, i) => a + rw[g] * indW[i] / tw, 0));
  const val = (i, g) => view === 'share' ? m[i][g] : 100 * m[i][g] / avg[g];
  const all = IND10.flatMap((_, i) => GWA.map((_, g) => val(i, g)));
  const t = v => view === 'share' ? v / Math.max(...all) : Math.max(0, Math.min(1, (v - 100) / 150));
  const ramp = d3.interpolateRgb('#eef2fa', NAVY);
  const order = GWA.map((_, g) => g).sort((a, b) => avg[b] - avg[a]);
  const head = order.map(g => GWA[g]).map(n => `<th scope="col" style="font-weight:600;font-size:0.75rem;line-height:1.25;text-align:center;vertical-align:bottom;hyphens:auto;padding:0 0.25rem 0.4rem;color:${T.gray800};">${esc(n)}</th>`).join('');
  const rows = IND10.map((name, i) => `<tr><th scope="row" style="font-weight:500;font-size:0.8125rem;text-align:left;padding:0.25rem 0.5rem 0.25rem 0;line-height:1.3;color:${T.gray800};">${esc(name)}</th>` +
    order.map(j => { const g = GWA[j], v = val(i, j), bg = ramp(t(v)), txt = view === 'share' ? v.toFixed(1) : String(Math.round(v)), strong = view === 'index' && v >= 150;
      return `<td title="${esc(name)} / ${esc(g)}: ${txt}${view === 'share' ? '%' : ''}" style="text-align:center;padding:0.5rem 0.125rem;background:${bg};color:${inkOn(bg)};font-size:0.8125rem;${strong ? 'font-weight:700;' : ''}">${txt}</td>`; }).join('') + '</tr>').join('');
  const note = view === 'share'
    ? 'Each row adds to 100%. Darker cells are a bigger share of that industry\'s work-related AI use.'
    : '100 = the average industry. 150 means the industry does one and a half times as much of that activity as the average. Cells at or above 150 are in bold; cells below 100 are left pale.';
  box.innerHTML = `<table style="border-collapse:separate;border-spacing:2px;width:100%;min-width:980px;table-layout:fixed;"><caption style="text-align:left;font-size:0.8125rem;color:${T.gray600};padding-bottom:0.5rem;caption-side:bottom;">${esc(note)}</caption><colgroup><col style="width:24%">${GWA.map(() => '<col>').join('')}</colgroup><thead><tr><th scope="col" style="text-align:left;vertical-align:bottom;font-weight:600;font-size:0.75rem;padding:0 0.5rem 0.4rem 0;color:${T.gray800};">Industry / general work activity (GWA, largest first)</th>${head}</tr></thead><tbody>${rows}</tbody></table>`;
}
function renderIndustryConsumer(root, key, c) {
  const vals = shares(key + 'i10c', IND10, IND10C_W, c.tilt);
  hbar('c-indc', IND10, vals, { wrap: 46, colors: IND10.map(() => MCOL.consumer) });
  root.querySelector('#indc-table').innerHTML = `<table style="${sTableBase}"><thead><tr><th style="${sTh}">Industry</th><th style="${sThEnd}">Share of work-related consumer AI activity (%)</th></tr></thead><tbody>` +
    IND10.map((n, i) => `<tr><td style="${sTd}">${esc(n)}</td><td style="${sTdEnd}">${vals[i]}</td></tr>`).join('') + '</tbody></table>';
  renderIndustryCross(root, key, c, IND10C_W);
}

function renderCountry(root) {
  const selCountry = root.querySelector('#sel-country'), selQ = root.querySelector('#sel-q');
  const code = selCountry.value, c = C[code], q = +selQ.value, key = code + q, QL = QUARTERS.slice(0, q + 1);
  const Tr = (k, a, b) => trend(code + k, a, b).slice(0, q + 1);
  // the page has either the country sections (main page) or the Jobs and skills view (Questions page), or both
  const MAINP = !!root.querySelector('#stat-cards'), QP = !!root.querySelector('#c-lfpr');
  if (MAINP) {
  root.querySelector('#country-title').textContent = c.name;
  root.querySelector('#country-quarter').textContent = QUARTERS[q];
  root.querySelector('#country-method-note').textContent = c.sample;

  const topicShare = shares(key + 'topic', TOPICS, TOPIC_W, c.tilt), [tl] = sortDesc(TOPICS, topicShare);
  const ind10M = shareSeries(code, 'i10', shares(code + 'i10', IND10, IND10_W, c.tilt), IND10_TREND, 0.05), api10 = ind10M[q], [al] = sortDesc(IND10, api10);
  // quarterly change of the two core indicators, from the same series the benchmark charts draw
  const chg = (kind, who) => { const sr = benchSeries(kind, who); return q > 0 ? { v: r1(100 * (sr[q] / sr[q - 1] - 1)), lvl: Math.round(sr[q]) } : { v: null, lvl: Math.round(sr[q]) }; };
  const signed = v => (v >= 0 ? '+' : '\u2212') + Math.abs(v).toFixed(1) + '%';
  const qcard = kind => {
    const me = chg(kind, code);
    return [IND[kind], me.v == null ? 'n/a' : signed(me.v), 'QoQ change in Growth Index', MCOL[kind]];
  };
  const cards = [
    qcard('consumer'),
    qcard('api'),
    ['Primary language of AI use', c.lang, c.lang2],
    ['Largest occupational topic', tl[0], 'Occupational topic with the largest share of sampled consumer AI activity'],
    ['Largest API industry', al[0], 'Industry with the largest share of API tokens']
  ];
  root.querySelector('#stat-cards').innerHTML = cards.map(k =>
    `<div style="flex:1 1 200px;background:#fff;border:1px solid ${T.gray200};border-top:1px solid ${T.tealDark};${k[3] ? 'border-left:0.375rem solid ' + k[3] + ';' : ''}border-radius:${T.radiusLg};padding:1rem 1.125rem;box-shadow:${T.shadowSm};display:flex;flex-direction:column;">
       <div style="font-family:var(--font-display);font-size:1rem;line-height:1.3;min-height:2.6em;color:${T.gray600};">${esc(k[0])}</div>
       <div style="font-family:var(--font-display);font-size:1.75rem;font-weight:600;color:${NAVY};line-height:1.15;margin-top:0.25rem;">${esc(k[1])}</div>
       <div style="font-size:0.875rem;line-height:1.4;color:${T.gray600};margin-top:0.4rem;">${esc(k[2])}</div>
     </div>`).join('');
  renderBenchmark(root, code, c, q);

  // consumer
  hbar('c-usetype', ['Work', 'Personal', 'Education'], shares(key + 'use', ['Work', 'Personal', 'Education'], c.use.map(v => v), null).map((v, i) => r1(c.use[i] + (v - c.use[i]) * 0.3)));
  hbar('c-lang', c.langs.map(l => l[0]), c.langs.map(l => l[1]));
  renderWorkActivities(root, key, c);
  renderIndustryConsumer(root, key, c);

  renderOccupations(root, code, topicShare);

  // API
  const open = Tr('open', c.open[0], c.open[1]);
  draw('c-open', {
    type: 'bar',
    data: { labels: QL, datasets: [
      { label: 'Open-source', data: open, backgroundColor: RAMPS.api[3], borderColor: '#fff', borderWidth: 1, maxBarThickness: 44 },
      { label: 'Proprietary', data: open.map(v => r1(100 - v)), backgroundColor: RAMPS.api[1], borderColor: '#fff', borderWidth: 1, maxBarThickness: 44 }
    ] },
    options: { interaction: { mode: 'index', intersect: false }, plugins: { tooltip: { callbacks: { label: x => ` ${x.dataset.label}: ${x.parsed.y}%` } } },
      scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, max: 100, ticks: { callback: pct } } } }
  });
  const orig = shareSeries(code, 'org', c.origin, ORIGIN_TREND, 0.03).slice(0, q + 1);
  draw('c-origin', {
    type: 'bar',
    data: { labels: QL, datasets: ORIGIN.map((nm, i) => ({ label: nm, data: orig.map(r => r[i]), backgroundColor: ORIGIN_COL[i], borderColor: '#fff', borderWidth: 1, maxBarThickness: 44 })) },
    options: { interaction: { mode: 'index', intersect: false }, plugins: { tooltip: { callbacks: { label: x => ` ${x.dataset.label}: ${x.parsed.y}%` } } },
      scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, max: 100, ticks: { callback: pct } } } }
  });
  renderIndustryTrends(root, ind10M, q);

  }

  if (QP) {
  // labor
  line('c-lfpr', QL, [{ name: 'Participation rate (%)', data: Tr('lfpr', c.lfpr[0], c.lfpr[1]).map((v, i) => r1(c.lfpr[0] + (c.lfpr[1] - c.lfpr[0]) * i / 6)) }], { zero: false });
  line('c-adopt', QL, [{ name: 'Work', data: Tr('aw', c.adopt[0][0], c.adopt[0][1]) }, { name: 'Personal', data: Tr('ap', c.adopt[1][0], c.adopt[1][1]) }]);
  draw('c-skills', {
    type: 'radar',
    data: { labels: SKILLS.map(l => wrap(l, 14)), datasets: [
      { label: c.name, data: c.skills.map((v) => Math.round(v * (0.75 + 0.25 * (q + 1) / 7))), borderColor: NAVY, backgroundColor: 'rgba(0,34,69,0.15)', borderWidth: 2, pointRadius: 4, pointBackgroundColor: NAVY },
      { label: 'World median', data: [45, 30, 33, 27, 26, 29], borderColor: T.orange, backgroundColor: 'rgba(205,44,15,0.08)', borderWidth: 2, borderDash: [5, 4], pointRadius: 4, pointStyle: 'rectRot', pointBackgroundColor: T.orange }
    ] },
    options: { plugins: { legend: { labels: { usePointStyle: true } } }, scales: { r: { min: 0, max: 100, ticks: { stepSize: 25, backdropColor: 'rgba(255,255,255,0.7)' }, pointLabels: { font: { size: 11 }, padding: 4 } } }, layout: { padding: 0 } }
  });
  const impactBase = [18, 34, 32, 78, 71, 74, 45, 50, 48, 38], scaleF = { US: 1, BR: 0.78, MW: 0.42 }[code];
  hbar('c-impact', IND10, impactBase.map((v, i) => Math.round(v * scaleF * (0.85 + 0.3 * h(key + 'imp' + i)))), { unit: '', max: 100, label: 'AI Impact Index', wrap: 46 });
  const [il, iv] = sortDesc(IWA, shares(code + 'iwa-all', IWA, IWA_W, c.tilt));
  line('c-iwatrend', QL, il.slice(0, 4).map((l, i) => ({ name: l, data: Tr('iw' + i, iv[i] * (0.7 + 0.5 * h(code + l)), iv[i]) })));
  root.querySelector('#p-opps').innerHTML = `<table style="${sTableBase}"><thead><tr><th style="${sTh}">Role</th><th style="${sThEnd}">Postings, year on year</th></tr></thead><tbody>` +
    c.opps.map(o => `<tr><td style="${sTd}">${esc(o[0])}</td><td style="${sTdEnd}"><i class="loop loop-angle-up" aria-hidden="true"></i> ${o[1]}%</td></tr>`).join('') + '</tbody></table>';

  // public sector (shown on the Jobs and skills question)
  root.querySelector('#p-pubct').innerHTML = heatTable(PUB_IWA, PUB_COLS, key + 'pub', 'IWA / industry');

  // keep the Jobs and skills view's own selectors in step with the country and quarter above
  const labCountry = root.querySelector('#sel-country-lab'), labQ = root.querySelector('#sel-q-lab');
  if (labCountry) labCountry.value = code;
  if (labQ) labQ.value = String(q);
  }
}

// ---------- modal ----------
function initModal(root) {
  const modal = root.querySelector('#access-modal'), backdrop = modal.querySelector('.modal-backdrop-panel'), dialog = modal.querySelector('.modal-dialog-panel');
  const aTitle = root.querySelector('#access-title'), aBody = root.querySelector('#access-body'), copyBtn = root.querySelector('#btn-copy'), copyStatus = root.querySelector('#copy-status');
  let copyText = '';
  function show() { modal.style.display = 'flex'; }
  function hide() { modal.style.display = 'none'; }
  backdrop.addEventListener('click', hide);
  root.querySelectorAll('[data-modal-close]').forEach(b => b.addEventListener('click', hide));
  window.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.style.display === 'flex') hide(); });

  // ----- Questions section: preview, copy or save the data behind the selected question -----
  const dlBtn = root.querySelector('#btn-download');
  let dlName = '', dlText = '';
  const preStyle = `background:${T.gray100};border:1px solid ${T.gray200};border-radius:${T.radius};padding:0.75rem;font-size:0.8125rem;max-height:18rem;overflow:auto;white-space:pre-wrap;`;
  function presentFile(title, introHTML, text, filename) {
    copyText = text; copyStatus.textContent = '';
    aTitle.textContent = title;
    aBody.innerHTML = introHTML + `<pre style="${preStyle}">${esc(text.length > 5000 ? text.slice(0, 5000) + '\n...' : text)}</pre>`;
    copyBtn.style.display = text ? 'inline-block' : 'none';
    dlName = filename || ''; dlText = filename ? text : '';
    if (dlBtn) dlBtn.style.display = filename ? 'inline-block' : 'none';
    show();
  }
  const Q_SLUG = { edu: 'ai-education', lab: 'jobs-and-skills', dsl: 'digital-services-labor' };
  const Q_NAME = { edu: 'AI in education', lab: 'Jobs and skills', dsl: 'Digital services labor' };
  function presentQuestion(kind, which, d) {
    const rows = Math.max(0, d.csv.split('\n').length - 1);
    if (kind === 'csv') {
      presentFile('Download .csv', `<p>Data behind <strong>${esc(Q_NAME[which])}</strong> for <strong>${esc(d.scope)}</strong>: ${rows} rows in long format. Check the contents below, then download or copy the file.</p>`,
        d.csv, `ai-adoption-index_${Q_SLUG[which]}_${d.slug}.csv`);
    } else {
      presentFile('Access via API', `<p>Placeholder endpoint for the current <strong>${esc(Q_NAME[which])}</strong> view. The address is not real.</p>`,
        `curl "https://api.ai-adoption-index.example/v1/questions/${Q_SLUG[which]}?${d.params}&format=json"`, '');
    }
  }
  function csvCell(v) { v = String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  function tableRows(sel) {
    return Array.from(root.querySelectorAll(sel + ' tbody tr')).map(tr => Array.from(tr.children).map(td => td.textContent.trim()));
  }
  // The Jobs and skills view is native, so its data comes straight from the charts on the page.
  function laborData() {
    const code = root.querySelector('#sel-country').value, c = C[code], q = QUARTERS[+root.querySelector('#sel-q').value];
    const rows = [['country', 'period', 'indicator', 'series', 'category', 'value']];
    [['c-lfpr', 'Labor force participation rate (%)'], ['c-adopt', 'AI adoption by use type (%)'], ['c-skills', 'Emerging AI skill demand (index, 0-100)'],
     ['c-impact', 'AI Impact Index by industry (0-100)'], ['c-iwatrend', 'Top consumer AI activity trends (% of work-related consumer AI activity)']].forEach(([id, title]) => {
      const ch = charts[id]; if (!ch) return;
      ch.data.datasets.forEach(ds => ds.data.forEach((v, i) => rows.push([c.name, q, title, ds.label, flat(ch.data.labels[i]), v])));
    });
    tableRows('#p-opps').forEach(r => rows.push([c.name, q, 'Emerging opportunities: AI-related job postings, year on year (%)', '', r[0], parseFloat(r[1].replace(/[^0-9.\-]/g, ''))]));
    const heads = Array.from(root.querySelectorAll('#p-pubct thead th')).slice(1).map(th => th.textContent.trim());
    Array.from(root.querySelectorAll('#p-pubct tbody tr')).forEach(tr => {
      const cells = Array.from(tr.children).map(td => td.textContent.trim());
      heads.forEach((hd, j) => rows.push([c.name, q, 'IWA by industry: public service activities (% of public-sector consumer AI activity, four quarters pooled)', hd, cells[0], parseFloat(cells[j + 1])]));
    });
    const qs = q.replace(' ', '');
    return { scope: `${c.name}, ${q}`, slug: `${code}_${qs}`, params: `country=${code}&period=${qs}`, csv: rows.map(r => r.map(csvCell).join(',')).join('\n') };
  }
  let pendingQ = null;
  root.querySelectorAll('[data-q-access]').forEach(b => b.addEventListener('click', () => {
    const t = root.querySelector('[role="tab"][id^="tab-q-"][aria-selected="true"]');
    if (!t) return;
    const which = t.id.replace('tab-q-', ''), kind = b.dataset.qAccess;
    if (which === 'lab') { presentQuestion(kind, which, laborData()); return; }
    const f = root.querySelector('#tabpanel-q-' + which + ' iframe');
    if (!f) return;
    pendingQ = { kind, which };
    try { f.contentWindow.postMessage({ __q_req: 'data' }, '*'); } catch (err) { pendingQ = null; }
  }));
  // the education and digital-services views are separate pages: they answer with their own data
  window.addEventListener('message', ev => {
    const d = ev.data;
    if (!pendingQ || !d || typeof d !== 'object' || !d.__q_data) return;
    const f = root.querySelector('#tabpanel-q-' + pendingQ.which + ' iframe');
    if (!f || f.contentWindow !== ev.source) return;
    const p = pendingQ; pendingQ = null;
    const x = d.__q_data;
    if (typeof x.csv !== 'string' || !x.csv) return;
    presentQuestion(p.kind, p.which, { scope: String(x.scope || ''), slug: String(x.slug || 'data').replace(/[^\w.-]+/g, '-'), params: String(x.params || ''), csv: x.csv });
  });
  if (dlBtn) dlBtn.addEventListener('click', async () => {
    copyStatus.textContent = '';
    try {
      const dl = window.claude && window.claude.use ? await window.claude.use('downloads') : null;
      if (dl) { await dl.save({ filename: dlName, data: dlText }); copyStatus.textContent = 'Saved.'; return; }
    } catch (err) {
      if (err && err.code === 'declined') return;
    }
    try {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([dlText], { type: 'text/csv' })); a.download = dlName;
      document.body.appendChild(a); a.click(); a.remove();
    } catch (err) { copyStatus.textContent = 'The download was blocked. Use Copy instead.'; }
  });

  function openAccess(kind) {
    const { ind, norm, deciles } = mapState, c = C[root.querySelector('#sel-country').value], q = QUARTERS[+root.querySelector('#sel-q').value];
    copyText = ''; copyStatus.textContent = '';
    if (dlBtn) dlBtn.style.display = 'none';
    if (kind === 'csv') {
      const text = 'country,normalization,consumer_activity_decile,api_usage_decile\n' + countries.slice().sort().map(n => `${csvCell(n)},${norm},${deciles.consumer[n]},${deciles.api[n]}`).join('\n');
      presentFile('Download .csv', `<p>Data behind the world map: <strong>${esc(IND.consumer)}</strong> and <strong>${esc(IND.api)}</strong> deciles, ${esc(NORM[norm])}, for ${countries.length} countries. Decile 1 is the lowest group and decile 10 the highest. Check the contents below, then download or copy the file.</p>`,
        text, `ai-adoption-index_world-map_${norm}.csv`);
      return;
    } else if (kind === 'api') {
      copyText = `curl "https://api.ai-adoption-index.example/v1/indicators?indicator=${ind}&normalize=${norm}&period=2026Q3&format=json"`;
      aTitle.textContent = 'Access via API';
      aBody.innerHTML = `<p>Placeholder endpoint for the current map selection. The address is not real. Values are deciles (1 = lowest group, 10 = highest group), not exact ranks.</p><pre style="background:${T.gray100};border:1px solid ${T.gray200};border-radius:${T.radius};padding:0.75rem;font-size:0.8125rem;max-height:18rem;overflow:auto;white-space:pre-wrap;">${esc(copyText)}</pre><p style="margin-bottom:0.25rem;">Example response:</p><pre style="background:${T.gray100};border:1px solid ${T.gray200};border-radius:${T.radius};padding:0.75rem;font-size:0.8125rem;max-height:18rem;overflow:auto;white-space:pre-wrap;">${esc(JSON.stringify({ indicator: ind, normalize: norm, period: '2026Q3', unit: 'decile (1 = lowest, 10 = highest)', data: [{ country: 'BRA', value: deciles[ind]['Brazil'] }, { country: 'MWI', value: deciles[ind]['Malawi'] }, { country: 'USA', value: deciles[ind]['United States of America'] }] }, null, 2))}</pre>`;
    } else if (kind === 'cmpcsv') {
      const { cor: kc, norm: kn, deciles: kd, fits } = cmpState;
      const text = `country,normalization,consumer_activity_decile,api_usage_decile,${kc.id}\n` + countries.slice().sort().map(n => `${csvCell(n)},${kn},${kd.consumer[n]},${kd.api[n]},${corValue(n, kc)}`).join('\n');
      presentFile('Download .csv', `<p>Data behind the comparison with <strong>${esc(kc.label)}</strong>: ${countries.length} countries, indicator values as deciles (1 = lowest group, 10 = highest group). Fitted R² is ${fmt2(fits.consumer.r2)} for ${esc(IND.consumer)} and ${fmt2(fits.api.r2)} for ${esc(IND.api)}. Check the contents below, then download or copy the file.</p>`,
        text, `ai-adoption-index_comparison_${kc.id}_${kn}.csv`);
      return;
    } else if (kind === 'cmpapi') {
      const { cor: kc, norm: kn } = cmpState;
      copyText = `curl "https://api.ai-adoption-index.example/v1/comparisons?compare=${kc.id}&normalize=${kn}&period=2026Q3&format=json"`;
      aTitle.textContent = 'Access via API';
      aBody.innerHTML = `<p>Placeholder endpoint for the current comparison. The address is not real. Indicator values are deciles (1 = lowest group, 10 = highest group), not exact ranks.</p><pre style="background:${T.gray100};border:1px solid ${T.gray200};border-radius:${T.radius};padding:0.75rem;font-size:0.8125rem;max-height:18rem;overflow:auto;white-space:pre-wrap;">${esc(copyText)}</pre>`;
    } else if (kind === 'mcp') {
      copyText = JSON.stringify({ mcpServers: { 'ai-adoption-index': { type: 'http', url: 'https://mcp.ai-adoption-index.example/mcp' } } }, null, 2);
      aTitle.textContent = 'Access via MCP (proposed)';
      aBody.innerHTML = `<p>An MCP server would let AI assistants query the Index directly, for example "compare consumer AI use per working-age resident in Brazil and Malawi". Placeholder configuration; the address is not real.</p><pre style="background:${T.gray100};border:1px solid ${T.gray200};border-radius:${T.radius};padding:0.75rem;font-size:0.8125rem;max-height:18rem;overflow:auto;white-space:pre-wrap;">${esc(copyText)}</pre><p style="margin:0;">Possible tools: <code>list_indicators</code>, <code>get_indicator</code>, <code>get_country_profile</code>, <code>compare_countries</code>.</p>`;
    } else if (kind === 'pdf') {
      aTitle.textContent = 'Country report (.pdf)';
      aBody.innerHTML = `<p>In the live site this downloads a formatted report for <strong>${esc(c.name)}, ${q}</strong>: the headline cards, every chart on the ${esc(IND.consumer)} and ${esc(IND.api)} tabs, and a methods note.</p><p style="margin:0;">Not generated in this mock.</p>`;
    } else {
      copyText = 'country,period,section,indicator,category,value\n' +
        [['consumer', 'use_type', 'Work', c.use[0]], ['consumer', 'use_type', 'Personal', c.use[1]], ['consumer', 'use_type', 'Education', c.use[2]]].concat(c.langs.map(l => ['consumer', 'language', l[0], l[1]])).map(rw => `${c.name},${q},${rw.join(',')}`).join('\n') + '\n...';
      aTitle.textContent = 'Country data (.csv)';
      aBody.innerHTML = `<p>In the live site this downloads every indicator for <strong>${esc(c.name)}, ${q}</strong> in long format. First rows:</p><pre style="background:${T.gray100};border:1px solid ${T.gray200};border-radius:${T.radius};padding:0.75rem;font-size:0.8125rem;max-height:18rem;overflow:auto;white-space:pre-wrap;">${esc(copyText)}</pre>`;
    }
    copyBtn.style.display = copyText ? 'inline-block' : 'none';
    show();
  }
  root.querySelectorAll('[data-access]').forEach(b => b.addEventListener('click', () => openAccess(b.dataset.access)));
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(copyText).then(() => { copyStatus.textContent = 'Copied.'; }, () => { copyStatus.textContent = 'Copy was blocked; select the text instead.'; });
  });
}

function initTabs(root) {
  // Each [role=tablist] is its own group; a tab controls the panel named in its aria-controls.
  root.querySelectorAll('[role="tablist"]').forEach(list => {
    const btns = Array.from(list.querySelectorAll('[role="tab"]'));
    const panelOf = b => root.querySelector('#' + b.getAttribute('aria-controls'));
    function select(btn, focus) {
      btns.forEach(b => {
        const on = b === btn;
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
        const p = panelOf(b);
        if (p) p.style.display = on ? 'block' : 'none';
      });
      if (focus) btn.focus();
    }
    btns.forEach((btn, i) => {
      btn.addEventListener('click', () => select(btn, false));
      btn.addEventListener('keydown', ev => {
        let j = null;
        if (ev.key === 'ArrowRight') j = (i + 1) % btns.length;
        else if (ev.key === 'ArrowLeft') j = (i - 1 + btns.length) % btns.length;
        else if (ev.key === 'Home') j = 0;
        else if (ev.key === 'End') j = btns.length - 1;
        if (j !== null) { ev.preventDefault(); select(btns[j], true); }
      });
    });
  });
}

// The question views are separate pages in iframes; each reports its content height so the frame fits it.
function initQuestionFrames(root) {
  const frames = Array.from(root.querySelectorAll('iframe[data-q-frame]'));
  window.addEventListener('message', ev => {
    const d = ev.data;
    if (!d || typeof d.__q_h !== 'number' || d.__q_h < 200) return;
    const f = frames.find(fr => fr.contentWindow === ev.source);
    if (f) f.style.height = Math.ceil(d.__q_h) + 'px';
  });
}

// =====================================================================
// QUESTIONS PAGE: eight stakeholder questions, each answered for ONE example country ("Country X").
// Every chart describes that single country (over time, or across its own sectors, occupations, languages or proficiency levels)
// so that a practitioner there can act on it. No chart compares countries.
// All Index and supplemental values are invented; figures marked as published are real and linked.
// Question text, sources, data lists and uses follow "AI Index: Research Questions and Data Mapping".
// =====================================================================
const CX = 'Country X';
const QX_COLS = [   // columns of the overview matrix
  ['cons', 'Consumer AI use', 0], ['api', 'API token volume', 0],
  ['use', 'Use type', 1], ['act', 'Work activity', 1], ['occ', 'Occupational topic', 1], ['ind', 'Industry', 1], ['prof', 'Proficiency', 1], ['lang', 'Language', 1], ['mod', 'API model type', 1]
];
const QX_FIT = {
  direct: ['Direct fit', 'Most of the answer sits in the Index itself; supplemental data adds context.'],
  combined: ['Needs supplemental data', 'The Index shows the pattern; supplemental data is needed to explain it or act on it.'],
  context: ['Context only', 'The Index informs one side of the question; the rest needs other evidence.']
};
const QX_W3 = {
  cards: [
    { n: 'LinkedIn', tag: 'Partnership data', links: [['OECD.AI definitions', 'https://oecd.ai/en/linkedin']],
      m: 'Job postings and the skills they request; skills and certifications that members list on their profiles. One taxonomy of 39,000+ skills.',
      w: 'Self-reported: certifications on profiles are not verified, and members favor formal, knowledge-intensive jobs. OECD.AI shows only countries where LinkedIn covers at least 40% of the labour force.' },
    { n: 'Coursera', tag: 'Partnership data', links: [['Global Skills Report 2025', 'https://blog.coursera.org/presenting-courseras-2025-global-skills-report-the-skills-trends-shaping-the-future-of-education-and-employment'], ['Global Skills Report 2026', 'https://www.coursera.org/gsi']],
      m: 'Enrollments and course completions by skill and country, through the partnership. The public report covers 300M+ Coursera and Udemy learners in 98 countries (2026 edition) but gives country rankings, not country series.',
      w: 'Counts people learning on one platform, who are not the workforce; single-country counts can be small.' }
  ],
  also: [],
  joins: [['Work activity', 'Index work activities follow O*NET, which lists the intermediate activities within each.'], ['Skills', 'Posting and certification skills use LinkedIn’s and Coursera’s own taxonomies. Track a fixed skill list over time, and treat skills absent from baseline postings as new.']],
  A: {
    labels: ['Information and communications technology', 'Business and administration', 'Science and engineering', 'Management', 'Clerical support', 'Teaching', 'Service and sales', 'Health'],
    use0: [13, 15, 9, 10, 6, 3, 4, 3],
    use: [17, 16, 11, 10, 6, 5, 5, 4]
  },
  B: [
    { id: 'Information and communications technology', rows: [['Working with computers', 5, 10, 9], ['Analyzing data or information', 3, 6, 5], ['Providing consultation and advice to others', 4, 5, 3], ['Getting information', 3, 4, 3], ['Making decisions and solving problems', 2, 4, 3]] },
    { id: 'Business and administration', rows: [['Documenting and recording information', 4, 10, 8], ['Analyzing data or information', 3, 8, 6], ['Providing consultation and advice to others', 4, 6, 4], ['Making decisions and solving problems', 4, 5, 3], ['Getting information', 2, 4, 3]] },
    { id: 'Science and engineering', rows: [['Analyzing data or information', 4, 8, 6], ['Working with computers', 3, 7, 5], ['Thinking creatively', 4, 6, 3], ['Documenting and recording information', 2, 5, 4], ['Getting information', 2, 4, 3]] },
    { id: 'Management', rows: [['Making decisions and solving problems', 4, 8, 6], ['Providing consultation and advice to others', 3, 7, 5], ['Analyzing data or information', 4, 6, 3], ['Communicating with people outside the organization', 3, 6, 4], ['Thinking creatively', 2, 4, 2]] },
    { id: 'Clerical support', rows: [['Getting information', 6, 7, 3], ['Documenting and recording information', 5, 6, 2], ['Working with computers', 5, 4, 2], ['Communicating with people outside the organization', 4, 5, 2], ['Interpreting the meaning of information for others', 3, 4, 1]] },
    { id: 'Teaching', rows: [['Training and teaching others', 5, 9, 6], ['Getting information', 4, 7, 4], ['Documenting and recording information', 3, 6, 4], ['Interpreting the meaning of information for others', 4, 4, 2], ['Making decisions and solving problems', 2, 3, 2]] },
    { id: 'Service and sales', rows: [['Communicating with people outside the organization', 6, 6, 2], ['Getting information', 5, 5, 2], ['Providing consultation and advice to others', 5, 4, 1], ['Making decisions and solving problems', 3, 3, 1], ['Interpreting the meaning of information for others', 3, 3, 1]] },
    { id: 'Health', rows: [['Providing consultation and advice to others', 5, 7, 4], ['Interpreting the meaning of information for others', 4, 6, 3], ['Getting information', 3, 5, 2], ['Analyzing data or information', 2, 4, 3], ['Training and teaching others', 2, 3, 2]] }
  ],
  signals: [
    { v: '+195%', t: 'Coursera enrollments in generative AI courses, 2025 against 2024, worldwide (more than 8 million in total). A global figure; it says nothing specific about one country.', s: 'Coursera Global Skills Report 2025', u: 'https://blog.coursera.org/presenting-courseras-2025-global-skills-report-the-skills-trends-shaping-the-future-of-education-and-employment' },
    { v: 'Check coverage', t: 'OECD.AI shows LinkedIn data only for countries where LinkedIn covers at least 40% of the labour force. Confirm that the country meets that bar before relying on LinkedIn skills data.', s: 'OECD.AI', u: 'https://oecd.ai/en/linkedin' }
  ],
  sources: [
    ['O*NET: 332 intermediate work activities, each belonging to one general work activity; CC BY 4.0.', [['O*NET data dictionary', 'https://www.onetcenter.org/dictionary/30.3/text/gwas_to_iwas.html']]],
    ['LinkedIn: taxonomy of 39,000+ skills in 26 languages.', [['LinkedIn Engineering', 'https://engineering.linkedin.com/blog/2022/building-linkedin-s-skills-graph-to-power-a-skills-first-world']]],
    ['LinkedIn: skills genome is the 50 most characteristic skills of a country or industry; OECD.AI shows countries with at least 40% labour-force coverage on LinkedIn.', [['OECD.AI', 'https://oecd.ai/en/linkedin']]],
    ['Coursera: 2025 report, 170M+ learners in 100+ countries, generative AI enrollments up 195% (more than 8 million) and up 425% in Latin America; 2026 report, 300M+ Coursera and Udemy learners in 98 countries.', [['2025 report', 'https://blog.coursera.org/presenting-courseras-2025-global-skills-report-the-skills-trends-shaping-the-future-of-education-and-employment'], ['2026 report', 'https://www.coursera.org/gsi']]],
  ]
};

// ---- helpers ----
const qxNice = (arrs, step, k) => Math.ceil(Math.max.apply(null, [].concat.apply([], arrs).filter(v => v != null)) * (k || 1.18) / step) * step;
const qxGr = a => Math.round(100 * (a[a.length - 1] / a[0] - 1));
const qxIdx = (key, e) => { const v = trend(key, e[0] * 10, e[1] * 10); return v.map(x => Math.round(100 * x / v[0])); };
const lcs = s => s.toLowerCase();
const QX_URL = { ookla: 'https://registry.opendata.aws/speedtest-global-performance/', talis: 'https://read.oecd-ilibrary.org/en/about/programmes/talis/talis-participants.html', belebele: 'https://huggingface.co/datasets/facebook/belebele', cetic: 'https://www.cg.org.br/media/docs/publicacoes/2/20250512121112/ict_enterprises_2024_executive_summary.pdf', btos: 'https://census.gov/library/stories/2026/05/ai-use-businesses.html', wbes: 'https://www.enterprisesurveys.org/en/data/data-updates', ilo140: 'https://webapps.ilo.org/static/english/intserv/working-papers/wp140/index.html', egdi: 'https://publicadministration.un.org/egovkb/en-us/Reports/UN-E-Government-Survey-2024', gtmi: 'https://www.worldbank.org/en/programs/govtech/gtmi-2025-update', wwbi: 'https://datacatalog.worldbank.org/search/dataset/0038132/worldwide-bureaucracy-indicators', clear: 'https://clearglobal.org/cg_resource_type/language-maps-and-data/', dhslang: 'https://microdata.worldbank.org/index.php/catalog/3188/variable/F68/V3123?name=v045c', afrolang: 'https://microdata.worldbank.org/catalog/4745/variable/F1/V40?name=Q2', uis4a1: 'https://uis.unesco.org/en/glossary-term/proportion-schools-access-internet-pedagogical-purposes', giga: 'https://giga.global' };
const QX_MIN = 'Sample size. Under the sampling standard (100 conversations per cell), countries outside the 12 high-usage countries can report about 42 activities each quarter, 53 with two quarters pooled and 69 with a year. Detailed cuts by occupation, industry or use type are smaller cells; country-level publication depends on sample size and may require pooling or suppression.';
const QX_SELECT = 'Who uses AI: Index shares describe AI activity from people who use these tools, who are not a random sample. Supplemental figures describe the whole population or workforce, so gaps between them partly reflect who has access.';

// Q1 part b: illustrative Admin 2 districts. r,c = hex grid position; s = median mobile download (Mbps, Ookla); a = AI use per 100 people (Index; null = hidden, too little activity); p = population (thousands)
const QX_D1 = [
  { n: '01', r: 0, c: 2, s: 6, a: 4, p: 210 }, { n: '02', r: 0, c: 3, s: 9, a: 6, p: 180 }, { n: '03', r: 0, c: 4, s: 14, a: 7, p: 160 },
  { n: '04', r: 1, c: 1, s: 5, a: null, p: 90 }, { n: '05', r: 1, c: 2, s: 8, a: 5, p: 240 }, { n: '06', r: 1, c: 3, s: 18, a: 9, p: 300 }, { n: '07', r: 1, c: 4, s: 31, a: 14, p: 420 }, { n: '08', r: 1, c: 5, s: 22, a: 8, p: 260 },
  { n: '09', r: 2, c: 0, s: 4, a: 3, p: 150 }, { n: '10', r: 2, c: 1, s: 7, a: 6, p: 280 }, { n: '11', r: 2, c: 2, s: 12, a: 11, p: 350 }, { n: '12', r: 2, c: 3, s: 35, a: 19, p: 610 }, { n: 'Capital', r: 2, c: 4, s: 48, a: 26, p: 1900 }, { n: '14', r: 2, c: 5, s: 29, a: 12, p: 380 },
  { n: '15', r: 3, c: 1, s: 6, a: 4, p: 230 }, { n: '16', r: 3, c: 2, s: 11, a: 5, p: 270 }, { n: '17', r: 3, c: 3, s: 27, a: 7, p: 340 }, { n: '18', r: 3, c: 4, s: 33, a: 16, p: 520 }, { n: '19', r: 3, c: 5, s: 25, a: 10, p: 300 },
  { n: '20', r: 4, c: 2, s: 5, a: null, p: 110 }, { n: '21', r: 4, c: 3, s: 10, a: 4, p: 260 }, { n: '22', r: 4, c: 4, s: 21, a: 9, p: 290 },
  { n: '23', r: 5, c: 3, s: 8, a: 3, p: 170 }, { n: '24', r: 5, c: 4, s: 16, a: 6, p: 200 }
].map(d => Object.assign(d, { n: d.n === 'Capital' ? 'Capital District' : 'District ' + d.n }));
// bivariate palette: rows = AI use (low, mid, high), columns = speed (low, mid, high); gray = supplemental axis, blue = Index axis
// language question: share of AI activity in regional languages by district (null = hidden) and the main regional language (A or B); same order as QX_D1
const QX_LM = { s: [48, 35, 22, null, 52, 30, 14, 18, 61, 44, 26, 12, 5, 10, 38, 29, 15, 8, 12, null, 41, 24, 46, 33], l: 'AAAAAAAAAAAAAABBBBBBBBBB'.split('') };
const QX_BIV = [['#e4e6e9', '#b3b8bf', '#7d848e'], ['#b5cbe6', '#8ba4c4', '#5f7898'], ['#6b9bd6', '#3e6fae', '#163d70']];

const QX = [
  // 1 ---------------------------------------------------------------
  {
    asked: { Digital: 'IDB, IDB Invest', Education: 'OECD, World Bank', Labor: 'World Bank, IDB, IDB Invest' },
    fit: 'combined', g: { cons: 'c' }, supp: 'Connectivity',
    ask: ['Is AI use low because few people are online, or because people who are online do not use it?', 'For people who are not online, is the gap network coverage, or getting people who are covered online?', 'Among people who are covered, is the barrier the cost of data, devices or electricity?', 'If district-level Index data become available: in which districts are both connection quality and AI use low?'],
    scope: 'The Index measures use, not infrastructure. Here infrastructure means network coverage and quality, the cost of data, devices and electricity, each measured by a supplemental dataset.',
    index: [{ k: 'c', t: 'Consumer AI use', d: 'share of the working-age population using AI monthly; also per internet user' }, { k: 'c', t: 'Consumer AI use by Admin 2 district', d: 'prospective; part b' }],
    supps: [{ t: 'ITU', d: 'population covered by a 4G network; internet use among people of working age (from household surveys)' }, { t: 'ITU price baskets', d: '2 GB mobile data basket as % of monthly GNI per capita' }, { t: 'ITU household ICT data, World Bank WDI', d: 'mobile phone ownership, household computers; electricity access' }, { t: 'Ookla', d: 'speed and latency tiles, fixed and mobile, aggregated to Admin 2 (part b)' }, { t: 'WorldPop or census', d: 'working-age population by Admin 2, to weight Ookla tiles and as the denominator (part b)' }],
    also: [['Ookla Open Data', QX_URL.ookla, 'speed and latency tiles of about 610 m, quarterly']],
    limits: ['Why people who are online do not use AI. The funnel locates the gap; skills, language (Question 5) and relevance explain more of it.', 'Cause, in the district view. Districts with faster connections are usually richer and more urban too, so the view ranks districts for further study; it does not show that speed drives use.', 'Small districts. Admin 2 cells below the minimum amount of activity are hidden, so the smallest rural districts, where coverage matters most, may be blank.', 'Ookla speeds come only from people who run speed tests. Districts with few tests have unreliable figures, and no tests does not mean no network.', 'Timing. ITU coverage and internet-use figures are annual and lag; the Index is quarterly.'],
    context: ['Target digital infrastructure where access limits adoption, by combining usage data with connectivity, electricity and device data.', 'Use connectivity and access to inform decisions and investments.'],
    build() {
      const D = QX_D1, tot = D.reduce((s, d) => s + d.p, 0), seen = D.filter(d => d.a != null);
      const ai = Math.round(seen.reduce((s, d) => s + d.a * d.p, 0) / seen.reduce((s, d) => s + d.p, 0));
      const cov = 88, onl = 54, perNet = Math.round(100 * ai / onl), cg = 100 - cov, ug = cov - onl;
      const basket = 2.1, phone = 78, comp = 24, elec = 92;
      const cls = d => [d.s < 10 ? 0 : d.s <= 25 ? 1 : 2, d.a == null ? null : d.a < 6 ? 0 : d.a <= 10 ? 1 : 2];
      const infra = D.filter(d => d.a != null && cls(d)[0] === 0 && cls(d)[1] === 0), dem = D.filter(d => d.a != null && cls(d)[0] > 0 && cls(d)[1] === 0), hid = D.filter(d => d.a == null);
      const pp = a => Math.round(100 * a.reduce((s, d) => s + d.p, 0) / tot), nm = a => { const ids = a.map(d => d.n.replace('District ', '')); return a.length === 1 ? a[0].n : 'Districts ' + ids.slice(0, -1).join(', ') + ' and ' + ids[ids.length - 1]; };
      const funnel = { kind: 'bars', horizontal: true, labels: ['Working-age population', 'Covered by a 4G network', 'Uses the internet', 'Uses AI monthly'], unit: '%', max: 100,
        series: [{ name: 'Share of the working-age population (%)', color: ['supp', 'supp', 'supp', 'consumer'], data: [100, cov, onl, ai] }],
        legend: [{ name: 'Supplemental: ITU', color: 'supp' }, { name: 'Index: consumer AI activity diffusion', color: 'consumer' }],
        title: `From population to consumer AI use in ${CX}`, sub: 'Share of the working-age population at each step (%)', src: 'ITU (4G population coverage; internet use among people of working age, from household surveys); Index (consumer AI activity diffusion: share of the working-age population using AI monthly). Values are illustrative.', alt: `Bar chart for ${CX}: of the working-age population, ${cov}% covered by 4G, ${onl}% online, ${ai}% using AI monthly.` };
      const head = ug > cg ? 'Most people who are offline live where there is a network' : 'The network itself is the largest gap';
      const scat = { kind: 'scatter', title: `Connection speed and consumer AI use in ${CX}, by district`, sub: 'One dot per Admin 2 district; latest quarter', src: 'Ookla open data aggregated to Admin 2 districts; Index consumer AI activity diffusion by Admin 2 (prospective); WorldPop or census working-age population. Values are illustrative.', alt: `Scatter plot for ${CX}: median mobile download speed against consumer AI use per 100 people, one dot per district.`,
        xl: 'Median mobile download speed (Mbps, Ookla)', yl: 'AI users per 100 working-age people (Index)', pts: seen.map(d => ({ x: d.s, y: d.a, n: d.n, c: QX_BIV[cls(d)[1]][cls(d)[0]] })) };
      return {
        title: `How does infrastructure limit AI use in ${CX}?`,
        chart: funnel,
        note: { head, text: [`${cg}% of people in ${CX} live outside 4G coverage, while ${ug}% are covered but not online. ${ug > cg ? 'Getting covered people online matters more than extending the network.' : 'Extending the network matters more than getting covered people online.'}`, `${ai}% of the population uses AI: ${perNet} in every 100 internet users. For people already online, skills, language and relevance are more likely limits than the network.`] },
        tiles: [{ v: basket + '%', l: `of monthly GNI per capita buys a 2 GB mobile data basket (target: 2% or less)`, s: 'ITU price baskets', k: 's' }, { v: phone + '%', l: 'of people own a mobile phone', s: 'ITU household ICT data', k: 's' }, { v: comp + '%', l: 'of households have a computer', s: 'ITU household ICT data', k: 's' }, { v: elec + '%', l: 'of the population has access to electricity', s: 'World Bank WDI', k: 's' }],
        sub: { map: D, cls, scat, tot,
          note: { head: `${infra.length} districts have both slow connections and low AI use`, text: [`${nm(infra)} (${pp(infra)}% of the population) are below 10 Mbps and below 6 AI users per 100 people: candidates for network investment.`, `${nm(dem)} (${pp(dem)}% of the population) have adequate connections but low AI use, so the network is unlikely to be what holds them back.`, `${hid.length} districts (${nm(hid)}) are hidden because they have too little activity to report. Faster districts also tend to be richer and more urban, so treat this as a ranking for follow-up, not proof that speed drives use.`] } },
      };
    }
  },
  // 2 ---------------------------------------------------------------
  {
    asked: { Education: 'UNICEF, World Bank, OECD' },
    fit: 'combined', g: { use: 'c', act: 'c', occ: 'c', prof: 'c' }, supp: 'Teaching workforce',
    ask: ['How has teaching’s share of work-related consumer AI activity changed, and how does it compare with the regional and OECD aggregates?', 'Within teaching, which activities does AI support, and at what proficiency are teaching requests overall?', 'Where Country X took part in TALIS 2024, what share of teachers report using AI?'],
    scope: 'Part a uses the Index occupational topic for teaching, which follows ISCO-08 (group 23). Part b uses broad O*NET general work activities (GWAs), not more granular IWAs, to reduce small occupation-level cross-tabs. Activity where a student is being taught falls under the Education use type and is excluded.',
    index: [{ k: 'c', t: 'Use type: Work', d: 'work-related consumer AI activity' }, { k: 'c', t: 'Occupational topic: Teaching', d: 'follows ISCO-08 group 23' }, { k: 'c', t: 'Regional and OECD aggregates', d: 'the same measure, pooled across countries' }, { k: 'c', t: 'Teaching-related GWAs', d: 'broad O*NET general work activities; publication depends on sample size' }, { k: 'c', t: 'Proficiency', d: 'estimated level of expertise, from the wording of the request: low, medium or high' }],
    supps: [{ t: 'ILOSTAT', d: 'number of teaching professionals (ISCO 23)' }, { t: 'UNESCO UIS', d: 'pupil–teacher ratio; schools with internet for teaching (SDG 4.a.1)' }, { t: 'OECD TALIS 2024', d: 'teachers’ reported AI use; participating systems only' }],
    also: [['OECD TALIS participants', QX_URL.talis, '55 education systems in 2024; South Africa is the only Sub-Saharan African participant listed'], ['UIS: schools with internet', QX_URL.uis4a1, 'SDG 4.a.1, data to 2025'], ['Giga', QX_URL.giga, 'school locations and connectivity']],
    limits: ['How many teachers use AI. Activity is not people: heavy users and automated agents count many times. Only a teacher survey such as TALIS gives the share of teachers.', 'Why Country X differs from the aggregates. A larger teaching share can reflect a larger teaching workforce or less AI use in other occupations, not only more use by teachers.', 'Who is a teacher. The topic is inferred from what the activity is about, so trainers and tutors may be included.', 'Timing. ILOSTAT and UIS figures are annual and lag one to two years, and TALIS is a single 2024 round: they are baselines, not quarterly series.', 'Whether AI improves teaching or grading quality.', QX_MIN],
    context: ['Design teacher support and chatbots around how teachers use AI for curriculum design, preparing materials and assessing students.'],
    build() {
      const tp = trend('q2t', 41, 60).map(v => r1(v / 10)), rg = trend('q2r', 36, 46).map(v => r1(v / 10)), oe = trend('q2o', 52, 66).map(v => r1(v / 10)), last = tp.length - 1;
      const acts = [['Training and teaching others', [8, 12, 10]], ['Getting information', [7, 9, 8]], ['Documenting and recording information', [5, 7, 6]], ['Interpreting the meaning of information for others', [3, 5, 4]], ['Making decisions and solving problems', [2, 4, 3]]];
      const short = ['Training and teaching', 'Getting information', 'Documenting information', 'Interpreting information', 'Making decisions'];
      const rows = acts.map(a => [a[0]].concat(a[1])), tot = rows.map(r => r[1] + r[2] + r[3]), all = tot.reduce((a, b) => a + b, 0);
      const ti = tot.indexOf(Math.max.apply(null, tot)), mhp = Math.round(100 * rows.reduce((s, r) => s + r[2] + r[3], 0) / all);
      return {
        title: `Are teachers in ${CX} using AI, and if so, how are they using it?`,
        subA: 'Are they using it: teaching’s share of work-related consumer AI activity',
        chart: { kind: 'line', labels: QUARTERS, unit: '%', ymin: 0, yl: 'Share (%)', series: [{ name: `${CX} (Index)`, color: 'consumer', data: tp }, { name: 'Regional aggregate (Index)', color: RAMP[2], data: rg, dash: true }, { name: 'OECD aggregate (Index)', color: T.gray400, data: oe, dash: true }],
          title: `Teaching’s share of work-related consumer AI activity: ${CX} against regional and OECD aggregates`, sub: 'By quarter (%)', src: 'Index: work use type, occupational topic Teaching; regional and OECD aggregates of the same measure. Values are illustrative.', alt: `Line chart: teaching’s share of work-related consumer AI activity by quarter for ${CX}, the regional aggregate and the OECD aggregate.` },
        note: { head: tp[last] > rg[last] ? `${CX} is above the regional aggregate` : `${CX} is below the regional aggregate`,
          text: [`Teaching went from ${tp[0]}% to ${tp[last]}% of work-related consumer AI activity in ${CX}, against ${rg[last]}% for the region and ${oe[last]}% for the OECD in the latest quarter.`, 'This is a share of activity, not of teachers: it cannot say how many teachers use AI.'] },
        subB: 'How they use it: broad work activities',
        chart2: { kind: 'bars', horizontal: true, labels: rows.map(r => r[0]), unit: '%', max: qxNice([tot], 5, 1.25), series: [{ name: 'Share of the teaching topic’s work-related consumer AI activity (%)', color: 'consumer', data: tot }],
          title: `What broad work activities consumer AI supports in ${CX}’s teaching topic`, sub: 'Share of the teaching topic’s work-related consumer AI activity (%), by O*NET GWA. Values are illustrative.', src: 'Index: work use type, occupational topic Teaching, O*NET general work activities. Values are illustrative.', alt: `Bar chart for ${CX}: five general work activities by share of the teaching topic’s work-related consumer AI activity.` },
        note2: { head: `${short[ti]} is the most common use`, text: [`“${rows[ti][0]}” accounts for ${tot[ti]}% of teaching’s work-related consumer AI activity in ${CX}.`, `Across the teaching topic, ${mhp}% of requests are at medium or high proficiency. The Index rates proficiency by occupational topic, not by activity.`] },
        tiles: [{ v: mhp + '%', l: 'of teaching-topic AI requests are at medium or high proficiency (rated for the topic as a whole)', s: 'Index: proficiency by occupational topic', k: 'c' }, { v: '41%', l: 'of lower-secondary teachers report using AI in their work (only if Country X took part)', s: 'OECD TALIS 2024', k: 's' }, { v: '38', l: 'pupils per teacher in primary education', s: 'UNESCO UIS, latest year', k: 's' }, { v: '46%', l: 'of primary schools have internet for teaching', s: 'UNESCO UIS (SDG 4.a.1), latest year', k: 's' }, { v: '1.4 million', l: 'teachers employed (ISCO group 23)', s: 'ILOSTAT, 2024', k: 's' }]
      };
    }
  },
  // 3 ---------------------------------------------------------------
  {
    asked: { Education: 'World Bank, ADB', Labor: 'UNICEF' },
    fit: 'combined', g: { use: 'c', act: 'c', occ: 'c', prof: 'c' }, supp: 'Labour and skills', worked: true,
    ask: ['In which occupations is AI moving into work fastest?', 'Within those occupations, which work activities does AI support, and at what proficiency are the occupation’s requests?', 'In the job market, which skills are employers requesting less, which more, and which are new?', 'Which fields are people getting certified in, AI and otherwise, and how is that shifting?'],
    index: [{ k: 'c', t: 'Use type: Work', d: 'work-related consumer AI activity' }, { k: 'c', t: 'Occupational topic', d: '15 topics that follow ISCO-08 occupation groups' }, { k: 'c', t: 'Work activity', d: 'broad O*NET general work activities (GWAs); no occupation-by-IWA breakdown' }, { k: 'c', t: 'Proficiency', d: 'estimated level of expertise, from the wording of the request: low, medium or high' }],
    limits: ['What people can do without AI. The Index shows what they ask AI to do, not their underlying skill.', 'Activity is not people: heavy users and automated agents count many times, so a growing share can reflect a few intensive users.', 'Who posts and who certifies. Online job postings over-represent formal, urban jobs; platform learners are not the workforce; certifications listed on LinkedIn are self-reported.', 'Cause. A skill falling in postings can reflect the business cycle or other shifts in demand, not AI: compare with other skills over the same period before attributing a change to AI.', QX_MIN],
    context: ['Update TVET and higher education curricula toward the skills people need, based on how AI is used.'],
    build() {
      const W = QX_W3, A = W.A, u0 = A.use0, u1 = A.use, n = A.labels.length;
      const ch = A.labels.map((l, i) => ({ l, d: u1[i] - u0[i] })).sort((x, y) => y.d - x.d);
      const occ = W.B[qxOcc], rows = occ.rows;
      const tot = rows.reduce((s, r) => s + r[1] + r[2] + r[3], 0), mhp = Math.round(100 * rows.reduce((s, r) => s + r[2] + r[3], 0) / tot);
      const sk = [['Content writing', -1.1, 1], ['Translation', -0.9, 1], ['Copyediting and proofreading', -0.7, 1], ['Graphic design', -0.6, 1], ['Data entry', -0.5, 1], ['Data analysis', 0.8, 1], ['Using generative AI tools (AI literacy)', 1.2, 2], ['Machine learning (AI engineering)', 0.4, 2], ['Project management', 0.3, 0], ['Client relationship management', 0.2, 0]].sort((x, y) => x[1] - y[1]);
      const fresh = ['Prompt writing', 'Reviewing AI output', 'AI policy and governance', 'Building AI agents'];
      const ex = sk.filter(s => s[2] === 1), ot = sk.filter(s => s[2] === 0), av = a => r1(a.reduce((s, x) => s + x[1], 0) / a.length);
      const cf = [['Content writing and editing', -1.0, 1], ['Graphic design', -0.9, 1], ['Translation', -0.5, 1], ['Electrical and technical trades', 0.4, 0], ['Healthcare and caregiving', 0.5, 0], ['AI engineering', 0.6, 2], ['Project management', 0.7, 0], ['Cybersecurity', 0.8, 0], ['Data analytics', 1.2, 0], ['AI literacy', 2.1, 2]];
      const CC = [T.gray400, T.gray400, T.gray800], LEG = [{ name: 'AI skills', color: T.gray800 }, { name: 'Other skills', color: T.gray400 }];
      const sLo = v => Math.floor(Math.min.apply(null, v) * 1.6 * 2) / 2, sHi = v => Math.ceil(Math.max.apply(null, v) * 1.45 * 2) / 2;
      return {
        title: `How should curricula and skills programs in ${CX} change in anticipation of increased AI adoption?`,
        A: { kind: 'bars', horizontal: true, labels: A.labels, unit: '%', max: qxNice([u0, u1], 5, 1.2), series: [{ name: '2025 Q1', color: RAMP[1], data: u0 }, { name: '2026 Q3', color: 'consumer', data: u1 }],
          title: `Share of work-related consumer AI activity in ${CX}, by occupation`, sub: 'Index occupational topics; 2025 Q1 against the latest quarter (%)', src: 'Index: work use type, occupational topics. Values are illustrative.', alt: `Horizontal bar chart for ${CX}: each occupation’s share of work-related consumer AI activity in 2025 Q1 and 2026 Q3.` },
        B: { kind: 'bars', horizontal: true, labels: rows.map(r => r[0]), unit: '%', max: qxNice([rows.map(r => r[1] + r[2] + r[3])], 5, 1.25), series: [{ name: 'Share of the occupation’s work-related consumer AI activity (%)', color: 'consumer', data: rows.map(r => r[1] + r[2] + r[3]) }],
          title: `What broad work activities people in this occupation in ${CX} use AI for`, sub: 'Share of the occupation’s work-related consumer AI activity (%), by O*NET general work activity (GWA). Values are illustrative.', src: 'Index: work use type, occupational topic, general work activities (GWAs). Values are illustrative.', alt: `Bar chart for ${CX}: general work activities by share of the selected occupation’s work-related consumer AI activity.` },
        C: { kind: 'bars', horizontal: true, signed: true, rowH: 38, tick: '', labels: sk.map(s => s[0]), unit: ' pts', min: sLo(sk.map(s => s[1])), max: sHi(sk.map(s => s[1])), series: [{ name: 'Change in share of postings, 2025 Q1 to 2026 Q3 (percentage points)', color: sk.map(s => CC[s[2]]), data: sk.map(s => s[1]) }], legend: LEG,
          title: `Change in the skills employers request in ${CX}`, sub: 'Share of LinkedIn job postings requesting each skill: change from 2025 Q1 to 2026 Q3, in percentage points', src: 'LinkedIn job postings (partnership data). Values are illustrative.', alt: `Diverging bar chart for ${CX}: change in the share of job postings requesting ten skills.` },
        D: { kind: 'bars', horizontal: true, signed: true, rowH: 38, tick: '', labels: cf.map(s => s[0]), unit: ' pts', min: sLo(cf.map(s => s[1])), max: sHi(cf.map(s => s[1])), series: [{ name: 'Change in share of certifications, 2025 Q1 to 2026 Q3 (percentage points)', color: cf.map(s => CC[s[2]]), data: cf.map(s => s[1]) }], legend: [{ name: 'AI skills', color: T.gray800 }, { name: 'Other fields', color: T.gray400 }],
          title: `Change in the fields people get certified in, ${CX}`, sub: 'Share of certifications and course completions in each field: change from 2025 Q1 to 2026 Q3, in percentage points', src: 'Coursera course completions and LinkedIn certifications (partnership data). Values are illustrative.', alt: `Diverging bar chart for ${CX}: change in the share of certifications by field, including AI skills.` },
        noteA: { head: `AI is moving fastest into ${lcs(ch[0].l)}`, text: [`${ch[0].l} gained ${ch[0].d} points of work-related consumer AI activity in ${CX} since 2025 Q1, and ${lcs(ch[1].l)} ${ch[1].d} points. ${A.labels[0]} still has the largest share (${u1[0]}%).`, 'A rising share shows where AI is becoming part of work, which is where curricula need to change first.'] },
        noteB: { head: 'Where learners will meet AI at work', text: ['The activities at the top are where graduates are most likely to meet AI.', `${mhp}% of this occupation’s AI requests in ${CX} are at medium or high proficiency. The Index rates proficiency by occupational topic, not by activity.`] },
        noteC: { head: '', text: [] },
        noteD: { head: '', text: [] },
        fresh,
        profTile: [{ v: mhp + '%', l: `of this occupation’s AI requests in ${CX} are at medium or high proficiency (rated for the occupation as a whole, not by activity)`, s: 'Index: proficiency by occupational topic', k: 'c' }]
      };
    }
  },
  // 4 ---------------------------------------------------------------
  {
    asked: { Digital: 'CAF, IDB, IDB Invest', Education: 'UNICEF' },
    fit: 'combined', g: { cons: 'c', api: 'a', ind: 'b', mod: 'a' }, supp: 'Developers and firm surveys',
    ask: ['In which industries is AI being built into products and workflows through the API, and how does that compare with consumer AI activity at work in the same industries?', 'Do API users build on open-source or proprietary models, and from which regions?', 'How large is the developer base, and what do firm surveys say about firms’ own AI use?'],
    scope: 'The Index sees API token volumes reported by coalition firms, by country and industry. A client can be a large firm, a small business or an individual developer, and the Index cannot tell them apart, so API use measures building with AI, not enterprise adoption.',
    index: [{ k: 'c', t: 'Consumer AI use at work by industry', d: '10 industry groups, work use type' }, { k: 'a', t: 'API token volume by industry', d: 'share of API tokens, 10 industry groups' }, { k: 'a', t: 'Open-source vs proprietary model use', d: 'share of API tokens' }, { k: 'a', t: 'Region of origin of models used', d: 'share of API tokens' }],
    supps: [{ t: 'GitHub Innovation Graph', d: 'developers active in the country, by quarter' }, { t: 'National enterprise ICT surveys', d: 'share of firms using AI, by size and sector, where they exist' }],
    also: [['GitHub Innovation Graph', 'https://github.com/github/innovationgraph', 'developers by economy and quarter; CC0'], ['Cetic.br ICT Enterprises 2024', QX_URL.cetic, 'Brazil: 13% of enterprises with 10+ employees used AI'], ['US Census Bureau BTOS', QX_URL.btos, 'biweekly; 19.8% of US businesses used AI as of 3 May 2026']],
    limits: ['Who the API user is. Tokens are reported by country and industry only: a large firm, a small business and an individual developer look the same.', 'How many firms use AI. Tokens measure volume, so one large client can dominate an industry; only a firm survey counts firms.', 'Country attribution. Tokens are assigned to a country by the reporting firms, so AI built abroad and used in Country X may not be counted here.', 'Consumer activity by industry covers the work use type only, and the live Index hides small cells.'],
    context: ['Guide support for small firms, based on how AI use and productivity vary by sector and firm size.', 'Assess how small businesses use consumer chat tools for business.'],
    build() {
      const D = { c: [24, 20, 11, 15, 12, 6], a: [38, 18, 21, 11, 5, 3] };
      const labels = ['Information and communication', 'Real estate, professional, scientific, technical and administrative', 'Financial and insurance activities', 'Trade, transport, accommodation and food', 'Education', 'Public administration'];
      let ta = 0, ex = 0; for (let i = 1; i < 6; i++) { if (D.a[i] > D.a[ta]) ta = i; }
      for (let i = 0; i < 6; i++) { if (D.c[i] - D.a[i] > D.c[ex] - D.a[ex]) ex = i; }
      const os = 34, na = 71;
      return {
        title: `How does API use differ from consumer AI activity in ${CX}?`,
        chart: { kind: 'bars', horizontal: true, labels, unit: '%', max: qxNice([D.c, D.a], 10, 1.15), series: [{ name: 'Consumer activity at work: % of work-related consumer AI activity', color: 'consumer', data: D.c }, { name: 'API use: % of API tokens', color: 'api', data: D.a }],
          title: `Where consumer AI use and API tokens sit in ${CX}, by industry`, sub: 'Selected industry groups, latest quarter (%)', src: 'Index: consumer AI use by industry (work use type); API token volume by industry. Values are illustrative.', alt: `Horizontal bar chart for ${CX}: consumer AI use at work and API tokens across six industry groups.` },
        note: { head: `API use is concentrated in ${lcs(labels[ta])}`, text: [`${labels[ta]} accounts for ${D.a[ta]}% of API tokens in ${CX}, against ${D.c[ta]}% of consumer AI activity at work.`, `Consumer AI activity runs furthest ahead of API use in ${lcs(labels[ex])} (${D.c[ex]}% against ${D.a[ex]}%): people there use AI directly, while little is built on it through the API.`] },
        tiles: [{ v: os + '%', l: 'of API tokens go to open-source models', s: 'Index: open-source vs proprietary', k: 'a' }, { v: na + '%', l: 'of API tokens go to models of North American origin', s: 'Index: region of origin of models', k: 'a' }, { v: '84,000', l: 'developers active on GitHub in the latest quarter', s: 'GitHub Innovation Graph', k: 's' }, { v: '13%', l: 'of firms with 10 or more employees use AI (only where a national survey asks)', s: 'National enterprise ICT survey', k: 's' }]
      };
    }
  },
  // 6 ---------------------------------------------------------------
  {
    asked: { Digital: 'UNDP, ADB', Education: 'UNICEF, IDB, World Bank', Labor: 'EBRD' },
    fit: 'combined', g: { cons: 'c', ind: 'c', lang: 'c' }, supp: 'Language data',
    ask: ['In which languages do people use AI?', 'How does the language of AI activity at work differ by industry, for example agriculture against health?', 'Where inside the country is AI used in regional languages?'],
    scope: 'Training-data availability is shown as context: it helps explain why a language’s share of AI activity is low, but it is not a measure of use.',
    index: [{ k: 'c', t: 'Consumer AI activity by language', d: 'share of consumer AI activity in each language' }, { k: 'c', t: 'Consumer AI activity by language and industry', d: 'work use type, 10 industry groups; needs a new Index cut (part b)' }, { k: 'c', t: 'Consumer AI activity by language and district', d: 'needs a new Index cut (part c)' }],
    supps: [{ t: 'Low-resource language index (World Bank)', d: 'availability of training data for AI models, by language; in development' }],
    also: [['DHS: native language of respondent', QX_URL.dhslang, 'example variable, Togo MIS 2017'], ['Afrobarometer: language spoken at home', QX_URL.afrolang, 'example variable, Eswatini 2021'], ['CLEAR Global language data', QX_URL.clear, 'compiles census, DHS and Afrobarometer; about 40 countries']],
    limits: ['Language detection. Language is identified automatically, and detection is weakest for low-resource languages and mixed-language messages, so their shares may be undercounted.', 'Activity is not people: heavy users count many times, so a language’s share of activity is not its share of users.', 'New cuts. The Index page reports language by country only; parts b and c show what language by industry and by district would add. Industry covers the work use type only.', 'Small districts. Cells below the minimum amount of activity are hidden, and these are often where regional languages dominate.', QX_SELECT],
    context: ['Prioritize local-language models where there are gaps in use and performance by language.', 'Inform language and inclusion policy, for example by building indigenous-language materials for teachers.'],
    build() {
      const L = ['National language', 'English', 'Regional language A', 'Regional language B', 'Other languages'], LC = [NAVY, RAMP[3], RAMP[2], RAMP[1], T.gray400];
      const c = [74, 14, 7, 2, 3], lr = [55, 98, 12, 4];
      const IN = [['Agriculture, forestry and fishing', [38, 4, 44, 12, 2]], ['Trade, transport, accommodation and food', [72, 8, 15, 4, 1]], ['Public administration', [80, 10, 8, 1, 1]], ['Education', [70, 18, 9, 2, 1]], ['Real estate, professional, scientific, technical and administrative', [66, 26, 6, 1, 1]], ['Financial and insurance activities', [68, 28, 3, 0, 1]], ['Human health and social work', [52, 40, 5, 1, 2]], ['Information and communication', [55, 42, 2, 0, 1]]];
      const loc = IN.map(x => x[1][2] + x[1][3]), en = IN.map(x => x[1][1]);
      const li = loc.indexOf(Math.max.apply(null, loc)), ei2 = en.indexOf(Math.max.apply(null, en));
      const M = QX_D1.map((d, i) => ({ n: d.n, r: d.r, c: d.c, s: QX_LM.s[i], l: QX_LM.l[i] })), hi = M.filter(d => d.s != null && d.s >= 40), hid = M.filter(d => d.s == null);
      const nm = a => { const ids = a.map(d => d.n.replace('District ', '')); return a.length === 1 ? a[0].n : 'Districts ' + ids.slice(0, -1).join(', ') + ' and ' + ids[ids.length - 1]; };
      return {
        title: `Which languages do people in ${CX} use with AI, and how does that differ by industry and across the country?`,
        subA: 'Language of consumer AI activity',
        chart: { kind: 'bars', horizontal: true, rowH: 42, labels: L, unit: '%', max: qxNice([c], 10, 1.2), series: [{ name: 'Share of consumer AI activity (%)', color: 'consumer', data: c }],
          title: `Language of consumer AI activity in ${CX}`, sub: 'Share of consumer AI activity (%), latest quarter', src: 'Index: consumer AI activity by language. Values are illustrative.', alt: `Bar chart for ${CX}: share of consumer AI activity in each language.` },
        note: { head: `${L[0]} carries most AI activity`, text: [`${c[0]}% of AI activity in ${CX} is in the national language and ${c[1]}% in English; regional languages together account for ${c[2] + c[3]}%.`, 'Where a census or DHS records home language, compare these shares with the share of people who speak each language at home.'] },
        subB: 'By industry: language of work-related consumer AI activity, if the Index reports language by industry',
        chart2: { kind: 'bars', horizontal: true, stacked: true, labels: IN.map(x => x[0]), unit: '%', max: 100, noEnd: true, series: L.map((l, k) => ({ name: l, color: LC[k], data: IN.map(x => x[1][k]) })),
          title: `Language of work-related consumer AI activity in ${CX}, by industry`, sub: 'Share of each industry’s work-related consumer AI activity (%); each bar adds to 100', src: 'Index: consumer AI activity by language and industry, work use type (needs a new Index cut). Values are illustrative.', alt: `Stacked bar chart for ${CX}: language mix of work-related consumer AI activity in eight industries.` },
        note2: { head: `${IN[li][0]} runs most in regional languages; ${lcs(IN[ei2][0])} most in English`, text: [`In ${lcs(IN[li][0])}, ${loc[li]}% of work-related consumer AI activity is in regional languages, against ${loc[ei2]}% in ${lcs(IN[ei2][0])}, where English accounts for ${en[ei2]}%. In health, English accounts for ${en[6]}%.`, 'Legal work sits inside professional services in the Index’s ten industry groups; the Legal occupational topic would isolate it.'] },
        tilesHd: 'Barrier: training data available for each language',
        tiles: L.slice(0, 4).map((l, i) => ({ v: String(lr[i]), l: `${l}: training data availability score (0 to 100)`, s: 'World Bank low-resource language index (in development)', k: 's' })),
        lmap: { map: M, src: 'Index: consumer AI activity by language and district (needs a new Index cut). Values are illustrative.',
          note: { head: `Regional languages carry 40% or more of AI activity in ${hi.length} districts`, text: [`In ${nm(hi)}, 40% or more of AI activity is in a regional language: Regional language A in the north and west, Regional language B in the south.`, `${nm(hid)} ${hid.length > 1 ? 'are' : 'is'} hidden for too little activity; small rural districts are often where regional languages dominate.`] } }
      };
    }
  },
  // 7 ---------------------------------------------------------------
  {
    asked: { Labor: 'OECD, IDB, IDB Invest, World Bank' },
    fit: 'combined', g: { use: 'c', act: 'c' }, supp: 'Labour and firm surveys',
    ask: ['How much work-related consumer AI activity goes to running a business: marketing, customers, planning, finance, pricing and paperwork?', 'Which of these activities are growing fastest?', 'What do labour and firm surveys say about how many people work for themselves, and how many firms of each size use AI?'],
    scope: 'These activities are done in firms of every size. The Index cannot tell a sole trader from a large firm, so this shows how AI supports running a business, not SME adoption.',
    index: [{ k: 'c', t: 'Use type: Work', d: 'work-related consumer AI activity' }, { k: 'c', t: 'Business-running work activities (O*NET IWAs)', d: 'e.g. Develop marketing or promotional materials; Respond to customer problems or inquiries; Calculate financial data. Annual by country' }],
    supps: [{ t: 'ILOSTAT', d: 'status in employment: own-account and contributing family workers' }, { t: 'National enterprise ICT surveys', d: 'share of firms using AI, by size class, where they exist' }],
    also: [['Cetic.br ICT Enterprises 2024', QX_URL.cetic, 'Brazil: AI use of 10%, 29% and 38% among small, medium and large enterprises'], ['US Census Bureau BTOS', QX_URL.btos, 'AI use by firm size and sector, biweekly']],
    limits: ['Firm size. The Index does not observe it, so business-running activity cannot be attributed to small firms.', 'Activity is not people: heavy users count many times, and employees of large firms do these activities too.', 'Timing. Enterprise surveys are irregular and labour force surveys lag; they are baselines, not quarterly series.', QX_MIN],
    context: ['Guide support for small firms, based on how AI use and productivity vary by sector and firm size.', 'Inform SME policy in Latin America, where SME adoption is a key question.', 'Pilot for micro-entrepreneurs.'],
    build() {
      const A = [['Develop marketing or promotional materials', 2.1, 3.0], ['Respond to customer problems or inquiries', 1.8, 2.4], ['Advise others on business or operational matters', 1.2, 1.7], ['Analyze market or industry conditions', 1.0, 1.3], ['Develop business or marketing plans', 0.9, 1.4], ['Calculate financial data', 0.6, 0.8], ['Develop financial or business plans', 0.5, 0.6], ['Analyze business or financial data', 0.4, 0.6]];
      const t0 = r1(A.reduce((s, x) => s + x[1], 0)), t1 = r1(A.reduce((s, x) => s + x[2], 0));
      const g = A.map(x => Math.round(100 * (x[2] / x[1] - 1))), gi = g.indexOf(Math.max.apply(null, g)), own = 27;
      return {
        title: `How is AI used to run businesses in ${CX}?`,
        chart: { kind: 'bars', horizontal: true, labels: A.map(x => x[0]), unit: '%', max: qxNice([A.map(x => x[2])], 1, 1.2), series: [{ name: 'Year to 2025 Q4', color: RAMP[1], data: A.map(x => x[1]) }, { name: 'Year to 2026 Q3', color: 'consumer', data: A.map(x => x[2]) }],
          title: `Business-running activities in work-related consumer AI activity in ${CX}`, sub: 'Share of work-related consumer AI activity (%), by O*NET intermediate work activity; four quarters pooled', src: 'Index: work use type, O*NET intermediate work activities. Values are illustrative.', alt: `Horizontal bar chart for ${CX}: eight business-running work activities, share of work-related consumer AI activity in the years to 2025 Q4 and 2026 Q3.` },
        note: { head: `Business-running activities are ${t1}% of work-related consumer AI activity`, text: [`Together these eight activities went from ${t0}% to ${t1}% of work-related consumer AI activity in ${CX}, comparing the years to 2025 Q4 and 2026 Q3. Marketing materials and customer inquiries are the largest; “${A[gi][0]}” grew fastest (+${g[gi]}%).`, 'This covers firms of every size; it is not a measure of SMEs.'] },
        tiles: [{ v: own + '%', l: 'of employed people are own-account or contributing family workers', s: 'ILOSTAT, status in employment, latest year', k: 's' }, { v: '10% / 38%', l: 'of small / large firms use AI (only where a national enterprise survey asks)', s: 'National enterprise ICT survey', k: 's' }]
      };
    }
  },
  // 8 ---------------------------------------------------------------
  {
    asked: { Digital: 'EBRD, CAF', Education: 'World Bank, ADB, IDB, AfDB', Labor: 'UNDP, IMF' },
    fit: 'combined', g: { cons: 'c', api: 'a', use: 'c', act: 'c', ind: 'b' }, supp: 'Digital government',
    ask: ['How much API use is classified to public administration, and is it growing?', 'What is work-related consumer AI activity in public administration about?', 'How much do people use AI to deal with forms, permits and public information?'],
    scope: 'Parts a and b use the Index’s public administration industry, which classifies activity by what it is about, not by who the user is. Part c is a proxy: the Index does not yet identify activity in which a person is dealing with a government service.',
    index: [{ k: 'a', t: 'API token volume by industry', d: 'public administration' }, { k: 'c', t: 'Consumer AI activity at work by industry and work activity', d: 'public administration' }, { k: 'c', t: 'Personal consumer AI activity by work activity', d: 'paperwork and rules activities (proxy, part c); by region, too rare to report by country' }, { k: 'b', t: 'Regional and world aggregates', d: 'the same measures, for comparison' }],
    supps: [{ t: 'UN E-Government Survey', d: 'E-Government Development Index: how far services are online; biennial' }, { t: 'World Bank GovTech Maturity Index', d: 'government digital systems and services; 2025 update' }, { t: 'Worldwide Bureaucracy Indicators', d: 'public sector employment' }],
    also: [['UN E-Government Survey 2024', QX_URL.egdi, 'E-Government Development Index'], ['GovTech Maturity Index 2025', QX_URL.gtmi, 'World Bank'], ['Worldwide Bureaucracy Indicators', QX_URL.wwbi, 'World Bank data catalog']],
    limits: ['Who builds for government. Services built by contractors may be counted under information and communication or professional services, not public administration.', 'Citizen-facing or internal. API tokens cannot separate services for the public from back-office use.', 'People dealing with government. Part c is a proxy: the paperwork activity also covers private contracts, and most information-seeking falls under a broad “Getting information” activity. A direct measure needs a new Index classifier.', 'Who the user is. Industry is assigned from what the activity is about, so part b is not a measure of civil servants: it can include contractors, consultants and citizens doing administrative work, and public teachers and health workers fall under their own industries.', QX_MIN],
    use: ['If public administration’s share of API tokens is rising that might indicate an increase on AI usage in the public sector.', 'Use the activity mix in public administration to target guidance and approved tools for government staff at the tasks where AI is already used, such as record-keeping or communicating with the public.'],
    build() {
      const ap = trend('q8a', 18, 31).map(v => r1(v / 10)), ar = trend('q8r', 15, 22).map(v => r1(v / 10)), aw = trend('q8w', 26, 34).map(v => r1(v / 10)), L = ap.length - 1;
      const PA = [['Documenting/recording information', 22], ['Communicating with people outside the organization', 18], ['Getting information', 16], ['Interpreting the meaning of information for others', 12], ['Evaluating information to determine compliance with standards', 9], ['Analyzing data or information', 8]];
      const pp = trend('q8p', 21, 34).map(v => r1(v / 10)), pr = trend('q8q', 9, 12).map(v => r1(v / 10));
      return {
        title: `How is AI being used in and for public services in ${CX}?`,
        subA: 'Building on AI: public administration’s share of API tokens',
        chart: { kind: 'line', labels: QUARTERS, unit: '%', ymin: 0, yl: 'Share of API tokens (%)', series: [{ name: CX, color: 'api', data: ap }, { name: 'Regional average', color: '#f2b38f', data: ar, dash: true }, { name: 'World average', color: T.gray400, data: aw, dash: true }],
          title: `Public administration: share of API tokens, ${CX}`, sub: 'By quarter (%), against regional and world aggregates', src: 'Index: API token volume by industry; regional and world aggregates. Values are illustrative.', alt: `Line chart: public administration’s share of API tokens in ${CX}, the region and the world, by quarter.` },
        note: { head: ap[L] > ap[0] ? 'API use in public administration is rising' : 'API use in public administration is not rising', text: [`Public administration’s share of API tokens in ${CX} went from ${ap[0]}% to ${ap[L]}%, against ${ar[L]}% for the region and ${aw[L]}% for the world in the latest quarter.`, 'Tokens do not show whether these are services for the public or internal systems.'] },
        subB: 'What work-related consumer AI activity in public administration is about',
        chart2: { kind: 'bars', horizontal: true, labels: PA.map(x => x[0]), unit: '%', max: qxNice([PA.map(x => x[1])], 5, 1.2), series: [{ name: 'Share of work-related consumer AI activity classified to public administration (%)', color: 'consumer', data: PA.map(x => x[1]) }],
          title: `Work-related consumer AI activity in public administration in ${CX}, by work activity`, sub: 'Share of work-related consumer AI activity classified to public administration (%), six largest O*NET general work activities', src: 'Index: work-related consumer AI activity by industry and work activity. Values are illustrative.', alt: `Bar chart for ${CX}: six work activities by share of work-related consumer AI activity classified to public administration.` },
        note2: { head: 'Record-keeping and outside communication lead', text: [`${PA[0][0]} and ${lcs(PA[1][0])} account for ${PA[0][1] + PA[1][1]}% of work-related consumer AI activity classified to public administration in ${CX}.`, 'Industry is assigned from what the activity is about, so this describes public-administration work, not civil servants as such.'] },
        subC: 'Personal consumer AI activity related to government: a regional proxy',
        chart3: { kind: 'line', labels: QUARTERS, unit: '%', ymin: 0, yl: 'Share of personal consumer AI activity (%)', series: [{ name: 'Prepare documentation for contracts, applications, or permits', color: 'consumer', data: pp }, { name: 'Explain regulations, policies, or procedures', color: RAMP[2], data: pr, dash: true }],
          title: `Paperwork and rules in personal consumer AI activity, ${CX}’s region`, sub: 'Share of personal consumer AI activity (%), by quarter, all countries in the region pooled', src: 'Index: personal consumer AI activity by work activity (proxy), regional aggregate; too rare to report by country. Values are illustrative.', alt: `Line chart for ${CX}’s region: two paperwork-related activities as a share of personal consumer AI activity, by quarter.` },
        note3: { head: pp[L] > pp[0] ? 'Consumer AI activity for applications and permits is growing' : 'Consumer AI activity for applications and permits is flat', text: [`Across ${CX}’s region, preparing documentation for contracts, applications or permits went from ${pp[0]}% to ${pp[L]}% of personal consumer AI activity. Too few such consumer AI interactions are sampled to report it for ${CX} alone.`, 'This mixes government forms with private contracts. A new Index classifier for activity involving a government service would measure it directly.'] },
        tiles: [{ v: '0.62', l: 'E-Government Development Index score (0 to 1)', s: 'UN E-Government Survey, latest edition', k: 's' }, { v: 'Group B', l: 'GovTech Maturity Index group (A highest, D lowest)', s: 'World Bank GovTech Maturity Index 2025', k: 's' }, { v: '14%', l: 'of paid employment is in the public sector', s: 'Worldwide Bureaucracy Indicators', k: 's' }]
      };
    }
  },
  // 9 ---------------------------------------------------------------
  {
    asked: { Labor: 'IMF, IDB, IDB Invest, OECD' },
    fit: 'combined', g: { use: 'c', occ: 'c' }, supp: 'Exposure and employment',
    ask: ['Which occupations in Country X are most exposed to generative AI?', 'Is AI activity at work concentrated in the most exposed occupations, or are some exposed occupations barely using it?', 'How many workers are in the occupations the ILO rates most exposed?'],
    scope: 'Exposure measures what generative AI could do in an occupation, not what is happening. Each Index occupational topic is defined as a set of ISCO-08 codes, the classification the ILO scores, so each topic gets an exposure score averaged from its occupations and weighted by employment.',
    index: [{ k: 'c', t: 'Use type: Work', d: 'work-related consumer AI activity' }, { k: 'c', t: 'Occupational topic', d: '15 topics, each defined as a set of ISCO-08 codes' }],
    supps: [{ t: 'ILO generative AI exposure index (2025)', d: 'exposure score for each ISCO-08 occupation, from task-level ratings' }, { t: 'ILOSTAT and labour force survey microdata', d: 'employment by occupation (2-digit, and 3- or 4-digit where needed), to weight scores and size the workforce' }],
    also: [['ILO Working Paper 140', QX_URL.ilo140, 'Generative AI and jobs: a refined global index of occupational exposure, 2025']],
    limits: ['What will happen. Exposure is potential, not a forecast, and high AI activity is not evidence of job loss or productivity gain.', 'Activity is not people: heavy users count many times, so a large share of AI activity can come from a few intensive users.', 'Content, not workers. ILO exposure describes the tasks of workers in an occupation; the Index assigns a topic from what the activity is about, not who the user is. The comparison is occupational content against occupational exposure.', 'Weights. Most topics can be weighted with ILOSTAT’s 2-digit tables, but Legal, Social science and Writing are defined at 3 or 4 digits and need labour force survey microdata.', 'Broad topics. Six topics are whole ISCO major groups, so one average can hide very different jobs, such as cashiers and cooks in Service and sales.', QX_SELECT],
    use: ['Size retraining and transition programs against employment in the ILO’s highest exposure gradients (ILOSTAT).'],
    build() {
      const O = ['Management', 'Science and engineering', 'Health', 'Teaching', 'Business and administration', 'Information and communications technology', 'Legal', 'Social science, counselling, and religion', 'Writing, translation, and the arts', 'Clerical support', 'Service and sales', 'Skilled agricultural, forestry, and fishery', 'Craft and related trades', 'Plant and machine operations and assembly', 'Elementary tasks'];
      const SH = ['Management', 'Science and eng.', 'Health', 'Teaching', 'Business and admin.', 'ICT', 'Legal', 'Social sci., counselling', 'Writing and arts', 'Clerical support', 'Service and sales', 'Agriculture', 'Craft and trades', 'Plant operators', ''];
      const ex = [0.40, 0.42, 0.30, 0.38, 0.50, 0.55, 0.45, 0.33, 0.52, 0.62, 0.25, 0.08, 0.13, 0.10, 0.06], use = [10, 11, 4, 5, 16, 17, 4, 2.5, 8, 6, 5, 2, 3, 1.5, 0.8], emp = [4, 5, 5, 4, 8, 2, 0.5, 1, 1, 9, 21, 18, 11, 6, 5];
      const col = i => MCOL.consumer;
      return {
        title: `Are the occupations most exposed to AI in ${CX} actually using it?`,
        chart: { kind: 'scatter', h: 440, title: `Exposure to generative AI against consumer AI activity at work in ${CX}, by occupation`, sub: 'Each circle is an occupation; its size shows its share of employment. Larger occupations tend to have more AI activity simply because more people work in them.', src: 'ILO generative AI exposure index (2025), averaged to Index topics with ILOSTAT employment weights; Index: work use type, occupational topics. Values are illustrative.', alt: `Scatter plot for ${CX}: ILO exposure score against share of work-related consumer AI activity for the 15 occupational topics, sized by employment.`,
          xl: 'ILO exposure score (0 to 1)', yl: 'Share of work-related consumer AI activity (%)', xmin: 0, xmax: 0.7, tip: p => ` ${p.n}: exposure ${p.x}, ${p.y}% of consumer AI activity, ${p.e}% of employment`,
          pts: O.map((o, i) => ({ x: ex[i], y: use[i], n: o, s: SH[i], e: emp[i], c: col(i), r: 5 + Math.sqrt(emp[i]) * 3, al: i === 10 ? 'L' : i === 11 ? 'T' : '' })),
          legend: [{ name: 'Occupational topic (circle size: share of employment)', color: MCOL.consumer }],
          labels: O, unit: '', series: [{ name: 'ILO exposure score', data: ex }, { name: 'Share of work-related consumer AI activity (%)', data: use }, { name: 'Share of employment (%)', data: emp }] },
        note: { head: '', text: [] },
        tiles: [{ v: '7%', l: 'of employment is in occupations in the ILO’s highest exposure gradient', s: 'ILO generative AI exposure index (2025), ILOSTAT', k: 's' }]
      };
    }
  }
];

let qxSel = 0, qxCharts = [], qxOcc = 0, qxReg = 0;
// illustrative Admin 1 regions for the language question: c = share of AI activity, h = main language spoken (%), languages in the question's order
const QX_REG6 = [
  { n: 'Capital region', c: [78, 18, 3, 0, 1], h: [80, 5, 10, 2, 3] },
  { n: 'Northern region', c: [62, 8, 22, 4, 4], h: [38, 1, 48, 9, 4] },
  { n: 'Central region', c: [80, 11, 5, 1, 3], h: [76, 2, 15, 4, 3] },
  { n: 'Southern region', c: [70, 9, 4, 13, 4], h: [52, 1, 9, 34, 4] },
  { n: 'Coastal region', c: [76, 16, 4, 1, 3], h: [70, 4, 20, 3, 3] }
];
const qxCol = k => k === 'consumer' ? MCOL.consumer : k === 'api' ? MCOL.api : k === 'supp' ? T.gray400 : k;
function qxSq(k, s) {
  const bg = k === 'c' ? MCOL.consumer : k === 'a' ? MCOL.api : k === 's' ? T.gray400 : `linear-gradient(90deg, ${MCOL.consumer} 50%, ${MCOL.api} 50%)`;
  return `<span class="qx-sq" style="width:${s || 14}px;height:${s || 14}px;background:${bg};"></span>`;
}
function qxFitChip(f) {
  const g = f === 'direct' ? `background:${NAVY};` : f === 'combined' ? `background:linear-gradient(90deg, ${NAVY} 50%, #fff 50%);` : 'background:#fff;';
  return `<span class="qx-fit" title="${esc(QX_FIT[f][1])}"><span class="qx-fit-g" style="${g}"></span>${QX_FIT[f][0]}</span>`;
}
// shows the value at the end of each bar, or the total on top of a stacked column
const qxEndLabels = { id: 'qxEnd', afterDatasetsDraw(ch, a, o) {
  if (o.off) return; const ctx = ch.ctx; ctx.save(); ctx.font = '600 13px ' + Chart.defaults.font.family; ctx.fillStyle = INK;
  ch.data.datasets.forEach((ds, i) => { const meta = ch.getDatasetMeta(i); if (meta.hidden) return;
    if (o.stacked && i !== ch.data.datasets.length - 1) return;
    meta.data.forEach((bar, j) => { let v = ds.data[j]; if (v == null) return; if (o.stacked) v = ch.data.datasets.reduce((sm, d2) => sm + (d2.data[j] || 0), 0); const t = (o.signed && v > 0 ? '+' : '') + r1(v) + o.unit;
      if (o.horiz) { ctx.textBaseline = 'middle'; if (v < 0) { ctx.textAlign = 'right'; ctx.fillText(t, bar.x - 5, bar.y); } else { ctx.textAlign = 'left'; ctx.fillText(t, bar.x + 5, bar.y); } } else { ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText(t, bar.x, bar.y - 4); } }); });
  ctx.restore(); } };
// shows the value at the end of each line
const qxLast = { id: 'qxLast', afterDatasetsDraw(ch, a, o) {
  const ctx = ch.ctx; ctx.save(); ctx.font = '600 12px ' + Chart.defaults.font.family; ctx.fillStyle = INK; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  const pts = ch.data.datasets.map((ds, i) => { const m = ch.getDatasetMeta(i), p = m.data[m.data.length - 1]; return { x: p.x, y: p.y, t: ds.data[ds.data.length - 1] + o.unit }; }).sort((p, q) => p.y - q.y);
  for (let i = 1; i < pts.length; i++) if (pts[i].y - pts[i - 1].y < 14) pts[i].y = pts[i - 1].y + 14;
  pts.forEach(p => ctx.fillText(p.t, p.x + 8, p.y));
  ctx.restore(); } };
function qxLineCfg(c, narrow) {
  return { type: 'line', plugins: [qxLast],
    data: { labels: c.labels.map(l => narrow ? l.split(' ') : l), datasets: c.series.map(s => ({ label: s.name, data: s.data, borderColor: qxCol(s.color), backgroundColor: qxCol(s.color), borderWidth: 3, pointRadius: 3.5, pointHoverRadius: 6, tension: 0, borderDash: s.dash ? [7, 5] : [] })) },
    options: { layout: { padding: { right: 46, top: 8 } }, interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: false }, qxLast: { unit: c.unit }, tooltip: { callbacks: { title: t => flat(t[0].label).replace(/,/g, ' '), label: t => ` ${t.dataset.label}: ${t.parsed.y}${c.unit}` } } },
      scales: { y: { beginAtZero: c.ymin === 0, min: c.ymin, title: { display: !!c.yl, text: c.yl, font: { weight: '600' } }, ticks: { callback: v => v + c.unit } }, x: { grid: { display: false }, ticks: { autoSkip: false, maxRotation: 0, minRotation: 0, font: { size: narrow ? 10 : 13 } } } } } };
}
function qxBarCfg(c, narrow) {
  const hz = !!c.horizontal, st = !!c.stacked, tick = v => v + (c.tick != null ? c.tick : c.unit);
  const lab = l => narrow && /^\d{4} Q\d$/.test(l) ? l.split(' ') : wrap(l, narrow ? (hz ? 15 : 11) : (hz ? 26 : 16));
  return { type: 'bar', plugins: [qxEndLabels],
    data: { labels: c.labels.map(lab), datasets: c.series.map(s => ({ label: s.name, data: s.data, backgroundColor: Array.isArray(s.color) ? s.color.map(qxCol) : qxCol(s.color), borderRadius: 0, maxBarThickness: c.rowH ? 22 : hz ? (st ? 26 : 16) : 44, categoryPercentage: st ? 0.7 : 0.78, barPercentage: 0.92 })) },
    options: { indexAxis: hz ? 'y' : 'x', layout: { padding: hz ? { right: 34 } : { top: 20 } },
      plugins: { legend: { display: false }, qxEnd: { unit: c.unit, horiz: hz, stacked: st, signed: !!c.signed, off: !!c.noEnd }, tooltip: { callbacks: { title: t => flat(t[0].label).replace(/,/g, ' '), label: t => ` ${t.dataset.label}: ${t.parsed[hz ? 'x' : 'y']}${c.unit}` } } },
      scales: hz ? { x: { stacked: st, beginAtZero: true, min: c.min, max: c.max, ticks: { callback: tick } }, y: { stacked: st, grid: { display: false }, ticks: { autoSkip: false, font: { size: narrow ? 12 : 14 } } } }
                 : { y: { stacked: st, beginAtZero: true, max: c.max, ticks: { callback: tick } }, x: { stacked: st, grid: { display: false }, ticks: { autoSkip: false, maxRotation: 0, minRotation: 0, font: { size: narrow ? 10 : 13 } } } } } };
}
const qxPtLabels = { id: 'qxPtLab', afterDatasetsDraw(ch, a, o) {
  if (!o.on) return; const ctx = ch.ctx, m = ch.getDatasetMeta(0); ctx.save(); ctx.font = '600 12px ' + Chart.defaults.font.family; ctx.fillStyle = INK; ctx.textBaseline = 'middle';
  m.data.forEach((el, i) => { const p = ch.data.datasets[0].data[i], r = p.r || 6; if (p.al === 'T') { ctx.textAlign = 'right'; ctx.fillText(p.s || '', el.x + 4, el.y - r - 8); return; } ctx.textAlign = p.al === 'L' || el.x > ch.chartArea.right - 110 ? 'right' : 'left'; ctx.fillText(p.s || '', el.x + (ctx.textAlign === 'right' ? -r - 4 : r + 4), el.y); });
  ctx.restore(); } };
function qxScatCfg(c, narrow) {
  const sized = c.pts.some(p => p.r);
  return { type: 'scatter', plugins: [qxPtLabels],
    data: { datasets: [{ label: c.title, data: c.pts, pointBackgroundColor: c.pts.map(p => p.c), pointBorderColor: sized ? '#fff' : INK, pointBorderWidth: sized ? 1.5 : 0.75, pointRadius: sized ? c.pts.map(p => narrow ? p.r * 0.7 : p.r) : (narrow ? 5 : 6.5), pointHoverRadius: sized ? c.pts.map(p => p.r + 2) : 8 }] },
    options: { layout: { padding: { top: 8, right: 12 } },
      plugins: { legend: { display: false }, qxPtLab: { on: sized && !narrow }, tooltip: { callbacks: { label: t => c.tip ? c.tip(t.raw) : ` ${t.raw.n}: ${t.raw.x} Mbps, ${t.raw.y} per 100 people` } } },
      scales: { x: { beginAtZero: c.xmin == null, min: c.xmin, max: c.xmax, title: { display: true, text: c.xl, font: { weight: '600' } } }, y: { beginAtZero: true, title: { display: true, text: c.yl, font: { weight: '600' } } } } } };
}
// hex map of illustrative districts, coloured by speed band x AI-use band
function qxHexMap(sub) {
  const R = 25, W = Math.sqrt(3) * R, pad = 4;
  const pos = d => [pad + W / 2 + W * (d.c + (d.r % 2 ? 0.5 : 0)), pad + R + 1.5 * R * d.r];
  const hex = (x, y) => [0, 1, 2, 3, 4, 5].map(k => { const t = Math.PI / 180 * (60 * k - 30); return (x + R * Math.cos(t)).toFixed(1) + ',' + (y + R * Math.sin(t)).toFixed(1); }).join(' ');
  const vw = pad * 2 + W * 6.5, vh = pad * 2 + R * 2 + 1.5 * R * 5;
  const cells = sub.map.map(d => { const [x, y] = pos(d), k = sub.cls(d), fill = k[1] == null ? '#fff' : QX_BIV[k[1]][k[0]], dark = k[1] === 2 || (k[1] === 1 && k[0] === 2);
    const lab = d.n === 'Capital District' ? 'Cap.' : d.n.replace('District ', '');
    return `<g><title>${esc(d.n)}: ${d.s} Mbps; ${d.a == null ? 'AI use hidden (too little activity)' : d.a + ' AI users per 100 working-age people'}</title><polygon points="${hex(x, y)}" fill="${fill}" stroke="${k[1] == null ? T.gray400 : '#fff'}" stroke-width="${k[1] == null ? 1.25 : 2}" ${k[1] == null ? 'stroke-dasharray="3 2"' : ''}/><text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="600" fill="${dark ? '#fff' : INK}">${lab}</text></g>`; }).join('');
  const svg = `<svg viewBox="0 0 ${vw.toFixed(0)} ${vh.toFixed(0)}" style="width:100%;max-width:340px;height:auto;display:block;" role="img" aria-label="Hex map of ${CX}: ${sub.map.length} districts coloured by connection speed band and AI use band.">${cells}</svg>`;
  const sw = (bg, extra) => `<span style="display:inline-block;width:18px;height:18px;background:${bg};${extra || ''}"></span>`;
  const grid = [2, 1, 0].map(ai => `<div style="display:flex;gap:2px;">${[0, 1, 2].map(sp => sw(QX_BIV[ai][sp])).join('')}</div>`).join('');
  const key = `<div style="display:flex;gap:1rem;align-items:flex-end;flex-wrap:wrap;font-size:0.8125rem;color:${T.gray600 || '#555'};margin-top:0.75rem;">
    <div style="display:flex;gap:0.5rem;align-items:center;"><div style="writing-mode:vertical-rl;transform:rotate(180deg);font-weight:600;">More AI use &rarr;</div><div><div style="display:flex;flex-direction:column;gap:2px;">${grid}</div><div style="font-weight:600;margin-top:0.25rem;">Faster &rarr;</div></div></div>
    <div style="line-height:1.5;">Speed: under 10, 10&ndash;25, over 25 Mbps<br>AI users: under 6, 6&ndash;10, over 10 per 100 working-age people<br>${sw('#fff', 'border:1.25px dashed ' + T.gray400 + ';vertical-align:middle;margin-right:0.35rem;')}Hidden: too little activity</div></div>`;
  return svg + key;
}
function qxLangMap(m) {
  const R = 25, W = Math.sqrt(3) * R, pad = 4, BN = [10, 25, 40], BC = ['#eef2fa', RAMP[0], RAMP[2], NAVY];
  const band = s => s == null ? -1 : s < BN[0] ? 0 : s < BN[1] ? 1 : s < BN[2] ? 2 : 3;
  const pos = d => [pad + W / 2 + W * (d.c + (d.r % 2 ? 0.5 : 0)), pad + R + 1.5 * R * d.r];
  const hex = (x, y) => [0, 1, 2, 3, 4, 5].map(k => { const t = Math.PI / 180 * (60 * k - 30); return (x + R * Math.cos(t)).toFixed(1) + ',' + (y + R * Math.sin(t)).toFixed(1); }).join(' ');
  const vw = pad * 2 + W * 6.5, vh = pad * 2 + R * 2 + 1.5 * R * 5;
  const cells = m.map.map(d => { const [x, y] = pos(d), b = band(d.s), lab = d.n === 'Capital District' ? 'Cap.' : d.n.replace('District ', '');
    return `<g><title>${esc(d.n)}: ${d.s == null ? 'hidden (too little activity)' : d.s + '% of AI activity in regional languages, mainly Regional language ' + d.l}</title><polygon points="${hex(x, y)}" fill="${b < 0 ? '#fff' : BC[b]}" stroke="${b < 0 ? T.gray400 : '#fff'}" stroke-width="${b < 0 ? 1.25 : 2}" ${b < 0 ? 'stroke-dasharray="3 2"' : ''}/><text x="${x.toFixed(1)}" y="${(y - 1).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="600" fill="${b >= 2 ? '#fff' : INK}">${lab}</text>${b < 0 ? '' : `<text x="${x.toFixed(1)}" y="${(y + 11).toFixed(1)}" text-anchor="middle" font-size="9.5" fill="${b >= 2 ? '#fff' : INK}">${d.l}</text>`}</g>`; }).join('');
  const sw = (bg, ex) => `<span style="display:inline-block;width:16px;height:16px;background:${bg};vertical-align:middle;margin-right:0.35rem;${ex || ''}"></span>`;
  const key = `<div class="qx-leg" style="margin-top:0.75rem;"><span>${sw(BC[0], 'border:1px solid ' + T.gray200 + ';')}Under 10%</span><span>${sw(BC[1])}10–25%</span><span>${sw(BC[2])}25–40%</span><span>${sw(BC[3])}40% or more</span><span>${sw('#fff', 'border:1.25px dashed ' + T.gray400 + ';')}Hidden: too little activity</span></div><p class="qx-csrc" style="margin-top:0.35rem;">Letter in each district: its main regional language (A or B).</p>`;
  const rows = m.map.map(d => `<tr><td style="${sTd}">${esc(d.n)}</td><td style="${sTdEnd}">${d.s == null ? 'hidden' : d.s + '%'}</td><td style="${sTdEnd}">${d.s == null ? '' : 'Regional language ' + d.l}</td></tr>`).join('');
  const tbl = `<details class="qx-det"><summary>Show the values</summary><table style="${sTableBase}"><thead><tr><th style="${sTh}">District</th><th style="${sThEnd}">AI activity in regional languages</th><th style="${sThEnd}">Main regional language</th></tr></thead><tbody>${rows}</tbody></table></details>`;
  return `<div class="qx-chartbox"><div class="qx-ct">Share of AI activity in regional languages in ${CX}, by district</div><div class="qx-cs">Latest quarter. Districts drawn as equal hexagons.</div>
    <svg viewBox="0 0 ${vw.toFixed(0)} ${vh.toFixed(0)}" style="width:100%;max-width:440px;height:auto;display:block;margin-top:0.75rem;" role="img" aria-label="Hex map of ${CX}: share of AI activity in regional languages by district.">${cells}</svg>${key}<p class="qx-csrc"><b>Source:</b> ${esc(m.src)}</p>${tbl}</div>`;
}
function qxSubnat(sub) {
  const rows = sub.map.map(d => `<tr><td style="${sTd}">${esc(d.n)}</td><td style="${sTdEnd}">${d.s}</td><td style="${sTdEnd}">${d.a == null ? 'hidden' : d.a}</td><td style="${sTdEnd}">${d.p}</td></tr>`).join('');
  const tbl = `<details class="qx-det"><summary>Show the values</summary><table style="${sTableBase}"><thead><tr><th style="${sTh}">District</th><th style="${sThEnd}">Median mobile download (Mbps)</th><th style="${sThEnd}">AI users per 100 working-age people</th><th style="${sThEnd}">Population (thousands)</th></tr></thead><tbody>${rows}</tbody></table></details>`;
  return `
      <div class="qx-sub"><span class="qx-subn">b</span>Where inside ${CX}: a district view, if Admin 2 Index data become available</div>
      <div class="qx-answer"><div class="qx-chartbox"><div class="qx-ct">Connection speed and AI use in ${CX}, by district</div><div class="qx-cs">Ookla speed tiles aggregated to Admin 2 districts, overlaid on Index AI use per 100 people. Latest quarter. Districts drawn as equal hexagons.</div>
        <div style="display:flex;flex-wrap:wrap;gap:1.5rem;align-items:flex-start;margin-top:0.75rem;"><div style="flex:1 1 300px;min-width:0;">${qxHexMap(sub)}</div>
        <div style="flex:1.3 1 300px;min-width:0;"><div class="qx-cv" style="height:320px;"><canvas id="qx-canvas3" role="img" aria-label="${esc(sub.scat.alt)}"></canvas></div></div></div><p class="qx-csrc"><b>Source:</b> ${esc(sub.scat.src)}</p>${tbl}</div>${qxRead(sub.note)}</div>
      <div class="qx-join"><b>How the data line up.</b> <span><b>Ookla to districts:</b> tiles are assigned to Admin 2 boundaries and averaged, weighted by population from WorldPop or the census rather than by number of tests.</span> <span><b>Index to districts:</b> requires the Index to report consumer use by Admin 2, with the same minimum-activity rule, so small districts drop out.</span> <span><b>Denominator:</b> Admin 2 population from the census or WorldPop.</span></div>`;
}
function qxTable(c) {
  const head = `<th style="${sTh}"></th>` + c.series.map(s => `<th style="${sThEnd}">${esc(s.name)}</th>`).join('');
  const rows = c.labels.map((l, i) => `<tr><td style="${sTd}">${esc(l)}</td>${c.series.map(s => `<td style="${sTdEnd}">${s.data[i] == null ? 'n/a' : s.data[i] + c.unit}</td>`).join('')}</tr>`).join('');
  return `<table style="${sTableBase}"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
}
const qxLinks = ls => ls.map(l => `<a href="${l[1]}" target="_blank" rel="noopener">${esc(l[0])}</a>`).join(' &middot; ');
const qxHeight = c => c.h ? c.h : c.rowH ? c.labels.length * c.rowH + 60 : c.kind === 'line' || !c.horizontal ? 340 : Math.max(280, c.labels.length * (c.stacked ? 54 : 58) + 60);
function qxChartBox(c, id, extra) {
  const leg = `<div class="qx-leg">${(c.legend || c.series).map(s => `<span><span class="qx-sq" style="width:12px;height:12px;background:${qxCol(s.color)};"></span>${esc(s.name)}</span>`).join('')}</div>`;
  const tbl = `<details class="qx-det"><summary>Show the values</summary>${qxTable(c)}</details>`;
  return `<div class="qx-chartbox"><div class="qx-ct">${esc(c.title)}</div><div class="qx-cs">${esc(c.sub)}</div>${extra || ''}<div class="qx-cv" style="height:${qxHeight(c)}px;"><canvas id="${id}" role="img" aria-label="${esc(c.alt)}"></canvas></div>${leg}${c.src ? `<p class="qx-csrc"><b>Source:</b> ${esc(c.src)}</p>` : ''}${tbl}</div>`;
}
const qxRead = n => '' && `<div class="qx-read"><h4>${esc(n.head)}</h4>${n.text.map(t => `<p>${esc(t)}</p>`).join('')}</div>`;
function qxTiles(ts, hd) {
  if (!ts || !ts.length) return '';
  return `<h5 class="qx-tl">${esc(hd || 'More context for ' + CX)}</h5><div class="qx-tiles">${ts.map(t => `<div><div class="qx-big">${esc(t.v)}</div><p>${esc(t.l)}</p><span class="qx-tsrc">${qxSq(t.k, 10)}${esc(t.s)}<em>Illustrative</em></span></div>`).join('')}</div>`;
}
function qxBody(i) {
  const q = QX[i], b = q.build(), w = q.worked ? QX_W3 : null;
  const asked = Object.keys(q.asked).map(k => `<span><b>${esc(k)}</b></span>`).join('');
  const li = (sq, t, d) => `<li class="qx-li">${sq}<span><span class="qx-lt">${esc(t)}</span>${d ? `<span class="qx-ld">${esc(d)}</span>` : ''}</span></li>`;
  const idx = q.index.map(x => li(qxSq(x.k, 14), x.t, x.d)).join('');
  const sup = w ? w.cards.map(d => `<li class="qx-dc"><div class="qx-dch">${qxSq('s', 14)}<b>${esc(d.n)}</b><span class="qx-tag">${esc(d.tag)}</span></div><p>${esc(d.m)}</p>${d.w ? `<p class="qx-wo"><b>Note:</b> ${esc(d.w)}</p>` : ''}<div class="qx-lk">${qxLinks(d.links)}</div></li>`).join('')
    : q.supps.map(x => li(qxSq('s', 14), x.t, x.d)).join('');
  const al = w ? w.also : q.also;
  const also = false ? `<p class="qx-nu"><b>Also available:</b> ${al.map(a => `<a href="${a[1]}" target="_blank" rel="noopener">${esc(a[0])}</a> (${esc(a[2])})`).join('; ')}.</p>` : '';
  let step3;
  if (w) {
    const pick = `<div class="qx-tg"><label class="qx-tgl" for="qx-occsel">Occupation</label><select id="qx-occsel" class="qx-occsel" data-qx-occsel>${w.B.map((o, k) => `<option value="${k}"${k === qxOcc ? ' selected' : ''}>${esc(o.id)}</option>`).join('')}</select></div>`;
    step3 = `
      <div class="qx-sub"><span class="qx-subn">a</span>Where AI is moving into work fastest</div>
      <div class="qx-answer">${qxChartBox(b.A, 'qx-canvas')}${qxRead(b.noteA)}</div>
      <div class="qx-sub"><span class="qx-subn">b</span>What to teach, and at what level</div>
      <div class="qx-answer">${qxChartBox(b.B, 'qx-canvas2', pick)}${qxRead(b.noteB)}</div>${qxTiles(b.profTile, 'Proficiency')}
      <div class="qx-sub"><span class="qx-subn">c</span>Which skills employers request less, more, and for the first time</div>
      <div class="qx-answer">${qxChartBox(b.C, 'qx-canvas5', `<div class="qx-new"><b>New in postings since 2025 Q1:</b> ${b.fresh.map(f => `<span>${esc(f)}</span>`).join('')}</div>`)}${qxRead(b.noteC)}</div>
      <div class="qx-sub"><span class="qx-subn">d</span>Which fields people are getting certified in</div>
      <div class="qx-answer">${qxChartBox(b.D, 'qx-canvas6')}${qxRead(b.noteD)}</div>
`;
  } else {
    step3 = b.chart2 ? `<div class="qx-sub"><span class="qx-subn">a</span>${esc(b.subA)}</div><div class="qx-answer">${qxChartBox(b.chart, 'qx-canvas')}${qxRead(b.note)}</div><div class="qx-sub"><span class="qx-subn">b</span>${esc(b.subB)}</div><div class="qx-answer">${qxChartBox(b.chart2, 'qx-canvas2')}${qxRead(b.note2)}</div>${b.chart3 ? `<div class="qx-sub"><span class="qx-subn">c</span>${esc(b.subC)}</div><div class="qx-answer">${qxChartBox(b.chart3, 'qx-canvas8')}${qxRead(b.note3)}</div>` : ''}${qxTiles(b.tiles, b.tilesHd)}${b.lmap ? `<div class="qx-sub"><span class="qx-subn">c</span>Where consumer AI activity uses regional languages, if the Index reports language by district</div><div class="qx-answer">${qxLangMap(b.lmap)}${qxRead(b.lmap.note)}</div>` : ''}`
      : b.sub ? `<div class="qx-sub"><span class="qx-subn">a</span>Where the gap is: from population to AI use</div><div class="qx-answer">${qxChartBox(b.chart, 'qx-canvas')}${qxRead(b.note)}</div>${qxTiles(b.tiles)}${qxSubnat(b.sub)}`
      : `<div class="qx-answer">${qxChartBox(b.chart, 'qx-canvas')}${qxRead(b.note)}</div>${qxTiles(b.tiles)}`;
  }
  const src = w ? `<section class="qx-step"><details class="qx-fact"><summary>Data sources and notes</summary>
      <h5 class="qx-fh">How the data line up</h5><ul>${w.joins.map(j => `<li><span><b>${esc(j[0])}:</b> ${esc(j[1])}</span></li>`).join('')}</ul>
      <h5 class="qx-fh">Sources</h5><ul>${w.sources.map(f => `<li><span>${esc(f[0])} ${qxLinks(f[1])}</span></li>`).join('')}</ul></details></section>` : '';
  return `
  <article class="qx-card">
    <div class="qx-qhead">
      <div class="qx-kick"><span>Question ${i + 1} of ${QX.length}</span>${qxFitChip(q.fit)}</div>
    </div>
    <section class="qx-step"><div class="qx-sh"><span class="qx-num">1</span><h3>Questions identified by stakeholders</h3></div>
      <h2 class="qx-h2">${esc(b.title)}</h2>
      <div class="qx-asked"><span class="qx-askl">Asked by</span>${asked}</div></section>
    <section class="qx-step"><div class="qx-sh"><span class="qx-num">2</span><h3>Investments and decisions these questions are useful for</h3></div>
      <h4 class="qx-context-h">Context and potential impact</h4><ul class="qx-bul">${(q.context || q.use || b.use).map(u => `<li>${esc(u)}</li>`).join('')}</ul></section>
    <section class="qx-step"><div class="qx-sh"><span class="qx-num">3</span><h3>Data we can combine</h3></div>
      <div class="qx-combine">
        <div class="qx-panel qx-p-idx"><h4>From the Index</h4><ul class="qx-ul">${idx}</ul></div>
        <div class="qx-plus" aria-hidden="true">+</div>
        <div class="qx-panel qx-p-sup"><h4>Supplemental data</h4><ul class="qx-ul">${sup}</ul></div>
      </div>${also}</section>
    <section class="qx-step"><div class="qx-sh"><span class="qx-num">4</span><h3>What the data can answer</h3></div>
      <ul class="qx-asks">${q.ask.map(a => `<li>${esc(a)}</li>`).join('')}</ul>
      <div class="qx-outputhead"><h4>Illustrative output for ${esc(CX)}</h4><span class="qx-ill">Illustrative</span></div>${step3}</section>${src}
    <div class="qx-nav">
      <button type="button" class="qx-navbtn" data-qx-go="-1"><i class="loop loop-angle-left" aria-hidden="true"></i> Previous question</button>
      <span class="qx-fitnote">${esc(QX_FIT[q.fit][0])}: ${esc(QX_FIT[q.fit][1])}</span>
      <button type="button" class="qx-navbtn" data-qx-go="1">Next question <i class="loop loop-angle-right" aria-hidden="true"></i></button>
    </div>
  </article>`;
}
// accordion: one row per question; the open question's answer sits directly beneath its row
function qxRender(root) {
  const cols = QX_COLS.map(c => `<div class="qx-ch qx-hide-sm">${c[1]}</div>`).join('');
  const rows = QX.map((q, i) => {
    const open = i === qxSel, who = Object.keys(q.asked).join(', ');
    const cells = QX_COLS.map(c => {
      const v = q.g[c[0]];
      return `<div class="qx-cell qx-hide-sm">${v ? qxSq(v, 16) + '<span class="qx-sr">Used</span>' : '<span class="qx-dot" aria-hidden="true"></span><span class="qx-sr">Not used</span>'}</div>`;
    }).join('');
    return `<div class="qx-item" id="qx-item-${i}">
      <button type="button" class="qx-row" data-qx="${i}" aria-expanded="${open}" aria-controls="qx-body-${i}">
        <div class="qx-rt"><span class="qx-rn">${i + 1}</span><span class="qx-rtx"><span class="qx-rtitle">${esc(q.build().title)}</span><span class="qx-rsub">Asked by ${esc(who)}</span><span class="qx-rsub">${qxFitChip(q.fit)}</span></span><span class="qx-chev" aria-hidden="true"></span></div>
        ${cells}<div class="qx-cell qx-supp qx-hide-sm">${qxSq('s', 12)}<span>${esc(q.supp)}</span></div></button>
      ${open ? `<div class="qx-body" id="qx-body-${i}">${qxBody(i)}</div>` : ''}
    </div>`;
  }).join('');
  root.querySelector('#qx-matrix').innerHTML = `
    <div class="qx-grid qx-hide-sm qx-mh"><div></div><div class="qx-gh" style="grid-column:span 2;">Headline measures</div><div class="qx-gh" style="grid-column:span 7;">Ways to slice the data</div><div class="qx-gh">Supplemental</div></div>
    <div class="qx-grid qx-hide-sm qx-mh2"><div class="qx-ch" style="text-align:left;padding-left:2.5rem;">Question</div>${cols}<div class="qx-ch">Outside data</div></div>
    ${rows}`;
  qxCharts.forEach(ch => ch.destroy()); qxCharts = [];
  if (qxSel < 0) return;
  const q = QX[qxSel], b = q.build();
  const mk = (id, cc) => { const cv = root.querySelector('#' + id); if (!cv) return; const narrow = cv.parentElement.clientWidth < 520; qxCharts.push(new Chart(cv, cc.kind === 'line' ? qxLineCfg(cc, narrow) : cc.kind === 'scatter' ? qxScatCfg(cc, narrow) : qxBarCfg(cc, narrow))); };
  if (q.worked) { mk('qx-canvas', b.A); mk('qx-canvas2', b.B); mk('qx-canvas5', b.C); mk('qx-canvas6', b.D); } else { mk('qx-canvas', b.chart); if (b.sub) mk('qx-canvas3', b.sub.scat); if (b.chart2) mk('qx-canvas2', b.chart2); if (b.reg) mk('qx-canvas7', b.reg.chart); if (b.chart3) mk('qx-canvas8', b.chart3); }
}
function qxOpen(root, i) {
  qxSel = i; qxRender(root);
  if (i >= 0) { const el = root.querySelector('#qx-item-' + i); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
}
function initQx(root) {
  root.querySelector('#qx-matrix').addEventListener('click', ev => {
    const t = ev.target.closest('[data-qx-occ]');
    if (t) { qxOcc = +t.dataset.qxOcc; qxRender(root); const nb = root.querySelector('[data-qx-occ="' + qxOcc + '"]'); if (nb) nb.focus(); return; }
    const g = ev.target.closest('[data-qx-go]');
    if (g) { qxOpen(root, (qxSel + (+g.dataset.qxGo) + QX.length) % QX.length); return; }
    const b = ev.target.closest('[data-qx]'); if (!b) return;
    const i = +b.dataset.qx;
    if (i === qxSel) { qxSel = -1; qxRender(root); const nb = root.querySelector('[data-qx="' + i + '"]'); if (nb) nb.focus(); } else { qxOpen(root, i); const nb = root.querySelector('[data-qx="' + i + '"]'); if (nb) nb.focus({ preventScroll: true }); }
  });
  root.querySelector('#qx-matrix').addEventListener('change', ev => {
    const r = ev.target.closest('[data-qx-regsel]');
    if (r) { qxReg = +r.value; qxRender(root); const nr = root.querySelector('#qx-regsel'); if (nr) nr.focus(); return; }
    const s = ev.target.closest('[data-qx-occsel]'); if (!s) return;
    qxOcc = +s.value; qxRender(root); const ns = root.querySelector('#qx-occsel'); if (ns) ns.focus();
  });
  qxRender(root);
}

function chartDefaults() {
  Chart.defaults.font.family = "'Open Sans', system-ui, Arial, sans-serif";
  Chart.defaults.font.size = 13;
  Chart.defaults.color = INK;
  Chart.defaults.borderColor = T.gray100;
  Chart.defaults.maintainAspectRatio = false;
  Chart.defaults.plugins.legend.position = 'bottom';
  Chart.defaults.plugins.legend.labels.boxWidth = 12;
  Chart.defaults.plugins.legend.labels.boxHeight = 12;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) Chart.defaults.animation = false;
}

function init(root) {
  if (root.querySelector('#qx-root')) { chartDefaults(); initQx(root); return; }   // the reimagined Questions page
  const selInd = root.querySelector('#sel-ind'), selNorm = root.querySelector('#sel-norm'), selCor = root.querySelector('#sel-cor'), selNormCmp = root.querySelector('#sel-norm-cmp');
  const MAIN = !!root.querySelector('#world-map');   // the Questions page has no map, comparisons or country sections
  if (MAIN) {
  selCor.innerHTML = COR.map(c => `<option value="${c.id}">${esc(c.label)}</option>`).join('');
  selNormCmp.innerHTML = selNorm.innerHTML;

  features = topojson.feature(WORLD, WORLD.objects.countries).features.filter(f => !SKIP.includes(f.properties.name));
  countries = features.map(f => f.properties.name).filter(n => !NO_DATA.includes(n));

  const mapEl = root.querySelector('#map'), tip = root.querySelector('#map-tip');
  svg = d3.select(mapEl).append('svg').attr('viewBox', '0 0 960 480').attr('role', 'img').style('width', '100%').style('height', '100%').style('display', 'block').attr('aria-label', 'World map of the selected indicator. The same values are in the .csv download.');
  projection = d3.geoNaturalEarth1().fitExtent([[8, 8], [952, 472]], { type: 'FeatureCollection', features });
  path = d3.geoPath(projection);
  paths = svg.selectAll('path').data(features).join('path').attr('d', path)
    .attr('fill', NODATA).attr('stroke', '#fff').attr('stroke-width', 0.5)
    .style('cursor', d => PROFILE[d.properties.name] ? 'pointer' : 'default')
  const profFeats = features.filter(f => PROFILE[f.properties.name]);
  [['#fff', 4], [HILITE, 1.75]].forEach(([col, w]) => svg.append('g').attr('pointer-events', 'none').selectAll('path').data(profFeats).join('path').attr('d', path).attr('fill', 'none').attr('stroke', col).attr('stroke-width', w).attr('stroke-linejoin', 'round'));
  paths.on('mousemove', (ev, d) => {
    const n = d.properties.name, decile = mapState.deciles && mapState.deciles[mapState.ind][n];
    tip.innerHTML = `<strong>${esc(n)}</strong><br>` + (decile == null ? 'No data' :
      `${esc(IND[mapState.ind])}: decile ${decile}` +
      (PROFILE[n] ? '<br><em>Click to open the country profile</em>' : ''));
    const r = mapEl.getBoundingClientRect();
    tip.style.display = 'block';
    tip.style.left = Math.min(ev.clientX - r.left + 12, r.width - 200) + 'px';
    tip.style.top = (ev.clientY - r.top + 12) + 'px';
  }).on('mouseleave', (ev) => { tip.style.display = 'none'; d3.select(ev.currentTarget).attr('stroke', '#fff').attr('stroke-width', 0.5); })
    .on('mouseenter', (ev) => { d3.select(ev.currentTarget).attr('stroke', NAVY).attr('stroke-width', 1.25); })
    .on('click', (ev, d) => {
      const code = PROFILE[d.properties.name];
      if (!code) return;
      root.querySelector('#sel-country').value = code;
      renderCountry(root);
      root.querySelector('#country-indicators').scrollIntoView({ behavior: 'smooth' });
    });

  }

  buildChartCards(root);

  const selCountry = root.querySelector('#sel-country'), selQ = root.querySelector('#sel-q');
  selQ.innerHTML = QUARTERS.map((q, i) => `<option value="${i}">${q}</option>`).join('');
  selQ.value = QUARTERS.length - 1;

  if (MAIN) {
  selInd.addEventListener('change', () => renderMap(root));
  selCor.addEventListener('change', () => renderComparisons(root));
  // normalization is shared by the map and the Comparisons section: the two selectors stay in step
  [[selNorm, selNormCmp], [selNormCmp, selNorm]].forEach(([from, to]) => from.addEventListener('change', () => { to.value = from.value; renderMap(root); renderComparisons(root); }));
  }
  [selCountry, selQ].forEach(s => s.addEventListener('change', () => renderCountry(root)));
  // the Jobs and skills question carries its own country and quarter selectors, kept in step with these
  const labCountry = root.querySelector('#sel-country-lab'), labQ = root.querySelector('#sel-q-lab');
  if (labCountry && labQ) {
  labCountry.innerHTML = selCountry.innerHTML; labQ.innerHTML = selQ.innerHTML;
  [[labCountry, selCountry], [labQ, selQ]].forEach(([from, to]) => from.addEventListener('change', () => { to.value = from.value; renderCountry(root); }));
  }
  if (MAIN) {
  const waHost = root.querySelector('#wa-tree');
  waHost.addEventListener('click', ev => {
    const b = ev.target.closest('.wa-tile'); if (!b) return;
    waSel = b.dataset.name; waFocus = waSel; waLayout(root);
  });
  new ResizeObserver(() => { if (waHost.clientWidth && waHost.clientWidth !== waW) waLayout(root); }).observe(waHost);
  const waBtn = root.querySelector('#wa-table-btn'), waTab = root.querySelector('#wa-table');
  waBtn.addEventListener('click', () => { const on = waTab.style.display === 'none'; waTab.style.display = on ? 'block' : 'none'; waBtn.setAttribute('aria-expanded', String(on)); waBtn.textContent = on ? 'Hide table' : 'Table'; });
  root.querySelector('#sel-occ-topic').addEventListener('change', ev => { occSel = ev.target.value; const code = selCountry.value; renderOccActivities(root, code, sortDesc(TOPICS, shares(code + selQ.value + 'topic', TOPICS, TOPIC_W, C[code].tilt))[0]); tblSync(root, '#occ-table', OCC_TABS); });
  [['#wa-table', WA_TABS], ['#occ-table', OCC_TABS]].forEach(([host, map]) => Object.keys(map).forEach(id => new MutationObserver(() => tblSync(root, host, map)).observe(root.querySelector('#' + id), { attributes: true, attributeFilter: ['aria-selected'] })));
  [['occ', 'Table']].forEach(([id]) => {
    const b = root.querySelector('#' + id + '-table-btn'), t = root.querySelector('#' + id + '-table');
    b.addEventListener('click', () => { const on = t.style.display === 'none'; t.style.display = on ? 'block' : 'none'; b.setAttribute('aria-expanded', String(on)); b.textContent = on ? 'Hide table' : 'Table'; });
  });
  [['ind10-growth', 'Growth index table'], ['ind10-rank', 'Rank index table']].forEach(([id]) => {
    const b = root.querySelector('#' + id + '-table-btn'), t = root.querySelector('#' + id + '-table');
    b.addEventListener('click', () => { const on = t.style.display === 'none'; t.style.display = on ? 'block' : 'none'; b.setAttribute('aria-expanded', String(on)); b.textContent = on ? 'Hide table' : 'Table'; });
  });
  { const b = root.querySelector('#indc-table-btn'), t = root.querySelector('#indc-table');
    b.addEventListener('click', () => { const on = t.style.display === 'none'; t.style.display = on ? 'block' : 'none'; b.setAttribute('aria-expanded', String(on)); b.textContent = on ? 'Hide table' : 'Table'; });
    root.querySelector('#sel-ict-view').addEventListener('change', () => { const code = selCountry.value; renderIndustryCross(root, code + selQ.value, C[code], IND10C_W); }); }
  const selBenchInd = root.querySelector('#sel-ind-bench');
  selBenchInd.innerHTML = BENCH_INDUSTRIES.map((n, i) => `<option value="${i}">${esc(n)}</option>`).join('');
  selBenchInd.addEventListener('change', () => { const code = selCountry.value; renderBenchmark(root, code, C[code], +selQ.value); });
  }

  chartDefaults();

  initModal(root);
  initTabs(root);
  initQuestionFrames(root);

  if (MAIN) { renderMap(root); renderComparisons(root); }
  renderCountry(root);
}

window.initAIAdoptionDashboard = init;
})();
