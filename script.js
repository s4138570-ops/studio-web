// Screen index is hidden by default; add ?screens to the URL to show it (design review)
if (new URLSearchParams(location.search).has('screens')) document.body.classList.add('show-screens');

const screens = [...document.querySelectorAll('.screen')];
const phone = document.getElementById('app');
const jump = document.getElementById('jump');

// screen index (shown beside the phone on wide viewports)
screens.forEach((s) => {
  const n = s.dataset.screen;
  const li = document.createElement('li');
  li.innerHTML = `<a href="#/${n}" data-n="${n}">${n.padStart(2, '0')} · ${s.dataset.title}</a>`;
  jump.appendChild(li);
});

// hash router: #/1 … #/14
function route() {
  const n = (location.hash.match(/^#\/(\d+)$/) || [])[1] || '1';
  const target = screens.find((s) => s.dataset.screen === n) || screens[0];
  screens.forEach((s) => s.classList.toggle('active', s === target));
  jump.querySelectorAll('a').forEach((a) => a.classList.toggle('on', a.dataset.n === target.dataset.screen));
  phone.scrollTop = 0;
  window.scrollTo(0, 0);
  document.title = `${target.dataset.title.replace(/&amp;/g, '&')} · Chinatown Walk Melbourne`;
}
window.addEventListener('hashchange', route);
route();

// 02 language (only English copy exists in the wireframe; choice is kept for later i18n)
document.querySelectorAll('.lang').forEach((a) =>
  a.addEventListener('click', () => { document.documentElement.lang = a.dataset.lang; }));

// 05 "I found it"
document.getElementById('found').addEventListener('click', (e) => {
  document.getElementById('reveal').hidden = false;
  e.currentTarget.textContent = 'Found it ✓';
});

// 11 countdown to 8pm tonight + reminder toggle
const h = document.getElementById('c-h'), m = document.getElementById('c-m'), s = document.getElementById('c-s');
function tick() {
  const t = new Date(); t.setHours(20, 0, 0, 0);
  let d = Math.max(0, t - Date.now());
  h.textContent = String(Math.floor(d / 36e5)).padStart(2, '0');
  m.textContent = String(Math.floor(d / 6e4) % 60).padStart(2, '0');
  s.textContent = String(Math.floor(d / 1e3) % 60).padStart(2, '0');
}
tick(); setInterval(tick, 1000);
const remind = document.getElementById('remind');
remind.addEventListener('click', () => {
  const on = remind.classList.toggle('done');
  remind.textContent = on ? 'Reminder set ✓' : 'Remind me';
});

// 12 stamps: 8 slots, first 3 collected, tap to toggle
const stamps = document.getElementById('stamps');
const count = document.getElementById('stamp-count');
for (let i = 0; i < 8; i++) {
  const b = document.createElement('button');
  b.setAttribute('aria-label', `Stop ${i + 1}`);
  if (i < 3) b.className = 'on';
  stamps.appendChild(b);
}
stamps.addEventListener('click', (e) => {
  if (e.target.tagName !== 'BUTTON') return;
  e.target.classList.toggle('on');
  count.textContent = `${stamps.querySelectorAll('.on').length} collected`;
});

// 13 save / share (nothing is uploaded)
const note = document.getElementById('home-note');
document.getElementById('save').addEventListener('click', () => { note.textContent = 'Saved to your device.'; });
document.getElementById('share').addEventListener('click', async () => {
  const data = { title: 'Your Chinatown', url: location.href };
  try { navigator.share ? await navigator.share(data) : (await navigator.clipboard.writeText(data.url), note.textContent = 'Link copied.'); }
  catch { /* user cancelled */ }
});
