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

// collect static text once; dynamic text (data-k) is re-rendered from its key instead
const textNodes = [];
const walker = document.createTreeWalker(phone, NodeFilter.SHOW_TEXT, {
  acceptNode: (n) => n.nodeValue.trim() && !n.parentElement.closest('[data-k]')
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

const renderDyn = (el) => { el.textContent = t(el.dataset.k, el.dataset.n); };
function setDyn(el, key, n) { el.dataset.k = key; if (n != null) el.dataset.n = n; renderDyn(el); }

function setLang(l) {
  if (!LANGS.includes(l)) return;
  lang = l;
  document.documentElement.lang = l;
  textNodes.forEach(({ n, lead, en, trail }) => { n.nodeValue = lead + t(en) + trail; });
  document.querySelectorAll('[data-k]').forEach(renderDyn);
  ariaEls.forEach(({ el, en }) => el.setAttribute('aria-label', t(en)));
  document.querySelectorAll('[data-set-lang]').forEach((a) => a.classList.toggle('on', a.dataset.setLang === l));
  buildJump();
  updateTitle();
}

document.querySelectorAll('[data-set-lang]').forEach((a) =>
  a.addEventListener('click', (e) => { e.preventDefault(); setLang(a.dataset.setLang); }));
// language screen: choosing a language sets it, then the link continues to the intro
document.querySelectorAll('.lang').forEach((a) =>
  a.addEventListener('click', () => setLang(a.dataset.lang)));

/* ---------- router: #/1 … #/14 ---------- */
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
function current() {
  const n = (location.hash.match(/^#\/(\d+)$/) || [])[1] || '1';
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

/* ---------- 12 stamps: 8 slots, first 3 collected, tap to toggle ---------- */
const stamps = document.getElementById('stamps');
const count = document.getElementById('stamp-count');
for (let i = 0; i < 8; i++) {
  const b = document.createElement('button');
  b.setAttribute('aria-label', `Stop ${i + 1}`);
  b.innerHTML = `<img src="img/stamp-${i + 1}.svg" alt="">`;
  if (i < 3) b.className = 'on';
  stamps.appendChild(b);
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
