// Screen index is hidden by default; add ?screens to the URL to show it (design review)
const params = new URLSearchParams(location.search);
if (params.has('screens')) document.body.classList.add('show-screens');

const screens = [...document.querySelectorAll('.screen')];
const phone = document.getElementById('app');
const jump = document.getElementById('jump');

/* ---------- language ----------
   Chosen on the first screens and kept in memory only, so every later screen follows it.
   (Nothing is stored in the browser, matching "Nothing is stored".)  ?lang=en|zh-Hans|zh-Hant preselects. */
const LANGS = ['en', 'zh-Hans', 'zh-Hant'];
const COL = { 'zh-Hans': 0, 'zh-Hant': 1 };
let lang = 'en';

function t(key, n) {
  const entry = window.I18N[key];
  const text = lang === 'en' || !entry ? key : entry[COL[lang]];
  return n == null ? text : text.replace('%n', n);
}

// collect static text once; dynamic text (data-k) is re-rendered from its key instead,
// and per-stop content (data-dyn) is rebuilt by renderStop()
const textNodes = [];
const walker = document.createTreeWalker(phone, NodeFilter.SHOW_TEXT, {
  acceptNode: (n) => n.nodeValue.trim() && !n.parentElement.closest('[data-k],[data-dyn]')
    ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
});
while (walker.nextNode()) {
  const n = walker.currentNode;
  const [, lead, en, trail] = n.nodeValue.match(/^(\s*)([\s\S]*?)(\s*)$/);
  textNodes.push({ n, lead, en, trail });
}
const ariaEls = [...phone.querySelectorAll('[aria-label]')]
  .filter((el) => window.I18N[el.getAttribute('aria-label')])
  .map((el) => ({ el, en: el.getAttribute('aria-label') }));
const altEls = [...phone.querySelectorAll('img[alt]')]
  .filter((el) => window.I18N[el.getAttribute('alt')])
  .map((el) => ({ el, en: el.getAttribute('alt') }));

const renderDyn = (el) => { el.textContent = t(el.dataset.k, el.dataset.n); };
function setDyn(el, key, n) { el.dataset.k = key; if (n != null) el.dataset.n = n; renderDyn(el); }

function setLang(l) {
  if (!LANGS.includes(l)) return;
  lang = l;
  document.documentElement.lang = l;
  textNodes.forEach(({ n, lead, en, trail }) => { n.nodeValue = lead + t(en) + trail; });
  document.querySelectorAll('[data-k]').forEach(renderDyn);
  ariaEls.forEach(({ el, en }) => el.setAttribute('aria-label', t(en)));
  altEls.forEach(({ el, en }) => { el.alt = t(en); });
  document.querySelectorAll('[data-set-lang]').forEach((a) => a.classList.toggle('on', a.dataset.setLang === l));
  renderStop(cur);
  renderStopList();
  labelStamps();
  buildJump();
  updateTitle();
}

/* ---------- stops: screens 1, 4, 5, 6, 7 show the current stop; 10 lists them all ---------- */
const STOPS = window.STOPS;
const $ = (id) => document.getElementById(id);
let cur = 3; // the stop shown when a link has no stop number (#/1, #/5 …)
let shownStop = null;

function setImg(slot, src, alt) {
  slot.textContent = '';
  if (!src) return; // no photo yet: the empty, labelled image slot stays
  const img = document.createElement('img');
  img.src = src;
  img.alt = t(alt);
  slot.appendChild(img);
}
function setCredit(el, credit) {
  el.hidden = !credit;
  el.textContent = credit ? t(credit) : '';
}
function setParas(box, paras) {
  box.textContent = '';
  paras.forEach((p) => {
    const el = document.createElement('p');
    el.textContent = t(p);
    box.appendChild(el);
  });
}

function renderStop(n) {
  const s = STOPS[n];
  const next = (n % 8) + 1;
  const sources = s.full.sources;

  // 01 entry (QR landing)
  setImg($('s1-hero'), s.img, s.alt);
  setCredit($('s1-credit'), s.credit);
  $('s1-no').textContent = t('STOP %n OF 8', n);
  $('s1-title').textContent = t(s.title);
  $('s1-meta').textContent = t(s.meta);
  $('s1-quick').href = `#/5/${n}`;
  $('s1-full').href = `#/6/${n}`;

  // 04 depth choice
  $('s4-name').textContent = t(s.name);
  $('s4-no').textContent = t('Stop %n of 8', n);
  $('s4-qt').textContent = t(s.quick.title);
  $('s4-ft').textContent = t(s.full.title);
  $('s4-quick').href = `#/5/${n}`;
  $('s4-full').href = `#/6/${n}`;

  // 05 quick look
  setImg($('s5-hero'), s.img, s.alt);
  setCredit($('s5-credit'), s.credit);
  $('s5-title').textContent = t(s.quick.title);
  setParas($('s5-text'), s.quick.text);
  $('s5-find').textContent = t(s.quick.find);
  $('reveal').textContent = t(s.quick.answer || 'Nice spotting! Tap “Full Story” if you’d like the background.');
  if (n !== shownStop) { // a different stop starts with the answer hidden again
    $('reveal').hidden = true;
    setDyn($('found'), 'I found it');
  }
  $('s5-next').textContent = t('Next stop · %n', t(STOPS[next].name));
  $('s5-next').href = `#/1/${next}`;
  $('s5-back').href = `#/1/${n}`;
  $('s5-switch').href = `#/6/${n}`;

  // 06 full story
  setImg($('s6-hero'), s.img, s.alt);
  setCredit($('s6-credit'), s.credit);
  $('s6-title').textContent = t(s.full.title);
  setParas($('s6-text'), s.full.text);
  $('s6-quote').textContent = t(s.full.quote);
  $('s6-src-n').textContent = t('%n sources', sources.length);
  $('s6-src-list').textContent = [...new Set(sources.map((x) => x.name))].join(' · ');
  $('s6-src').href = `#/7/${n}`;
  $('s6-back').href = `#/1/${n}`;
  $('s6-ar').hidden = n !== 3; // AR exists for stop 3 only so far

  // 07 sources (links open in a new tab; a print source has no link)
  $('s7-back').href = `#/6/${n}`;
  const list = $('s7-list');
  list.textContent = '';
  sources.forEach((x) => {
    const el = document.createElement(x.url ? 'a' : 'div');
    el.className = 'card item';
    if (x.url) { el.href = x.url; el.target = '_blank'; el.rel = 'noopener'; }
    el.innerHTML = '<i class="src-badge" aria-hidden="true"></i><div><b></b><small></small></div>';
    el.querySelector('.src-badge').textContent = x.abbr;
    el.querySelector('b').textContent = x.name;
    el.querySelector('small').textContent = t(x.desc);
    list.appendChild(el);
  });

  shownStop = n;
}

// 10 all stops: photo when there is one, otherwise a drawing of the stop
function renderStopList() {
  const box = $('s10-list');
  box.textContent = '';
  Object.entries(STOPS).forEach(([n, s]) => {
    const a = document.createElement('a');
    a.className = 'card item';
    a.href = `#/1/${n}`;
    a.innerHTML = `<i class="ph thumb" data-slot="stop-thumb-${n}"><img alt=""></i><div><b></b><small></small></div>`;
    a.querySelector('img').src = s.img || `img/stop-art-${n}.svg`;
    a.querySelector('b').textContent = `${n} · ${t(s.name)}`;
    a.querySelector('small').textContent = t(s.line);
    box.appendChild(a);
  });
}

document.querySelectorAll('[data-set-lang]').forEach((a) =>
  a.addEventListener('click', (e) => { e.preventDefault(); setLang(a.dataset.setLang); }));
// language screen: choosing a language sets it, then the link continues to the intro
document.querySelectorAll('.lang').forEach((a) =>
  a.addEventListener('click', () => setLang(a.dataset.lang)));

/* ---------- router: #/1 … #/14, optionally with a stop: #/1/7 = entry page of stop 7 ---------- */
const decode = (s) => { const d = document.createElement('textarea'); d.innerHTML = s; return d.value; };
function buildJump() {
  jump.innerHTML = '';
  screens.forEach((s) => {
    const n = s.dataset.screen;
    const li = document.createElement('li');
    li.innerHTML = `<a href="#/${n}" data-n="${n}">${n.padStart(2, '0')} · ${t(decode(s.dataset.title))}</a>`;
    jump.appendChild(li);
  });
  markJump();
}
const parseHash = () => location.hash.match(/^#\/(\d+)(?:\/(\d+))?$/) || [];
function current() {
  const n = parseHash()[1] || '1';
  return screens.find((s) => s.dataset.screen === n) || screens[0];
}
function markJump() {
  const cur = current().dataset.screen;
  jump.querySelectorAll('a').forEach((a) => a.classList.toggle('on', a.dataset.n === cur));
}
function updateTitle() {
  document.title = `${t(decode(current().dataset.title))} · Chinatown Walk Melbourne`;
}
function route() {
  const stop = Number(parseHash()[2]);
  if (STOPS[stop]) cur = stop;
  renderStop(cur);
  const target = current();
  screens.forEach((s) => s.classList.toggle('active', s === target));
  markJump();
  updateTitle();
  phone.scrollTop = 0;
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);

/* ---------- 05 "I found it" ---------- */
const found = document.getElementById('found');
found.addEventListener('click', () => {
  document.getElementById('reveal').hidden = false;
  setDyn(found, 'Found it ✓');
});

/* ---------- 11 countdown to 8pm tonight + reminder ---------- */
const h = document.getElementById('c-h'), m = document.getElementById('c-m'), s = document.getElementById('c-s');
function tick() {
  const t8 = new Date(); t8.setHours(20, 0, 0, 0);
  const d = Math.max(0, t8 - Date.now());
  h.textContent = String(Math.floor(d / 36e5)).padStart(2, '0');
  m.textContent = String(Math.floor(d / 6e4) % 60).padStart(2, '0');
  s.textContent = String(Math.floor(d / 1e3) % 60).padStart(2, '0');
}
tick(); setInterval(tick, 1000);
const remind = document.getElementById('remind');
remind.addEventListener('click', () => {
  const on = remind.classList.toggle('done');
  setDyn(remind, on ? 'Reminder set ✓' : 'Remind me');
});

/* ---------- 12 stamps: the team's stamp art, first 3 collected, tap to toggle ---------- */
// null = stamp not designed yet: shown as an empty slot
const STAMP_ART = ['img/stamp-1.webp', 'img/stamp-2.webp', 'img/stamp-3.webp', 'img/stamp-4.webp', 'img/stamp-5.webp', 'img/stamp-6.webp', 'img/stamp-7.webp'];
const stamps = document.getElementById('stamps');
const count = document.getElementById('stamp-count');
STAMP_ART.forEach((src, i) => {
  const b = document.createElement('button');
  if (src) {
    b.innerHTML = `<img src="${src}" alt="">`;
    if (i < 3) b.className = 'on';
  } else {
    b.className = 'todo';
    b.disabled = true;
  }
  stamps.appendChild(b);
});
function labelStamps() {
  stamps.querySelectorAll('button').forEach((b, i) =>
    b.setAttribute('aria-label', t(b.disabled ? 'Stamp %n, coming soon' : 'Stamp %n', i + 1)));
}
stamps.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  b.classList.toggle('on');
  setDyn(count, '%n collected', stamps.querySelectorAll('.on').length);
});

/* ---------- 13 save / share (nothing is uploaded) ---------- */
const note = document.getElementById('home-note');
document.getElementById('save').addEventListener('click', () => setDyn(note, 'Saved to your device.'));
document.getElementById('share').addEventListener('click', async () => {
  const data = { title: t('Your Chinatown'), url: location.href };
  try {
    if (navigator.share) await navigator.share(data);
    else { await navigator.clipboard.writeText(data.url); setDyn(note, 'Link copied.'); }
  } catch { /* user cancelled */ }
});

/* ---------- start ---------- */
setLang(LANGS.includes(params.get('lang')) ? params.get('lang') : 'en');
route();
