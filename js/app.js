import { EXERCISES, STATS, INTERESTS, FORMATS, CATALOG, TITLES, ACHIEVEMENTS } from './data.js';

// ---------- Stockage ----------
const KEY = 'remise-en-forme:v1';

const freshState = () => ({
  profile: null, // { name, level: 0|1|2, interests: [], formats: [] }
  xp: 0,
  stats: { force: 0, endurance: 0, souplesse: 0, savoir: 0 },
  daily: { date: null, challenges: [] },
  cultureDaily: { date: null, ids: [] }, // suggestions fixées pour la journée
  weekly: { week: null, quests: [] },
  library: {}, // id -> 'todo' | 'done'
  hidden: [], // suggestions écartées
  achievements: [],
  streak: { count: 0, last: null, best: 0 },
  counters: { challenges: 0, fullDays: 0, exo: {}, done: { livre: 0, doc: 0, film: 0 }, cultureMinutes: 0, quests: 0 },
  log: [], // { t, kind, label, xp, stat, exo, amount }
  settings: { reminders: ['08:00', '12:30', '18:30'], notifications: false, lastFired: {} },
});

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return freshState();
    const s = JSON.parse(raw);
    const base = freshState();
    return { ...base, ...s, stats: { ...base.stats, ...s.stats }, counters: { ...base.counters, ...s.counters, done: { ...base.counters.done, ...(s.counters?.done || {}) } }, settings: { ...base.settings, ...s.settings } };
  } catch {
    return freshState();
  }
}

let state = load();
const save = () => {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  shareStatus();
};

// Le service worker n'a pas accès au localStorage : on lui laisse l'état du jour dans un cache dédié
function shareStatus() {
  if (!('caches' in window)) return;
  const status = { date: state.daily.date, allDone: allDoneToday() };
  caches.open('remise-en-forme-status')
    .then(c => c.put('status.json', new Response(JSON.stringify(status), { headers: { 'Content-Type': 'application/json' } })))
    .catch(() => {});
}

// ---------- Utilitaires ----------
const $ = sel => document.querySelector(sel);
const esc = str => String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const weekKey = (d = new Date()) => {
  const x = new Date(d); x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); // lundi
  return dayKey(x);
};
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

// Générateur pseudo-aléatoire déterministe (mêmes défis toute la journée)
function seeded(seedStr) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) { h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
}
const shuffle = (arr, rnd = Math.random) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// ---------- Niveaux ----------
const xpToReach = lvl => Math.round(100 * Math.pow(lvl - 1, 1.6)); // XP totale pour atteindre lvl
function levelInfo(xp = state.xp) {
  let lvl = 1;
  while (xp >= xpToReach(lvl + 1)) lvl++;
  const cur = xpToReach(lvl), next = xpToReach(lvl + 1);
  return { lvl, into: xp - cur, need: next - cur, pct: Math.min(100, ((xp - cur) / (next - cur)) * 100) };
}
const titleFor = lvl => [...TITLES].reverse().find(t => lvl >= t.level).title;

// ---------- Gain d'XP ----------
function gain(xp, stat, label, extra = {}) {
  const before = levelInfo().lvl;
  state.xp += xp;
  if (stat) state.stats[stat] += xp;
  state.log.unshift({ t: Date.now(), xp, stat, label, ...extra });
  state.log = state.log.slice(0, 500);
  touchStreak();
  toast(`+${xp} XP${stat ? ' · ' + STATS[stat].icon + ' ' + STATS[stat].name : ''}`, label);
  checkQuests();
  const after = levelInfo().lvl;
  if (after > before) levelUp(after);
  checkAchievements();
  save();
}

function touchStreak() {
  const today = dayKey();
  const s = state.streak;
  if (s.last === today) return;
  s.count = s.last && daysBetween(s.last, today) === 1 ? s.count + 1 : 1;
  s.last = today;
  s.best = Math.max(s.best, s.count);
}
function currentStreak() {
  const s = state.streak;
  if (!s.last) return 0;
  return daysBetween(s.last, dayKey()) <= 1 ? s.count : 0;
}

// ---------- Défis du jour ----------
const fitness = () => state.profile?.level ?? 0;
function scaledAmount(ex) {
  const lvl = levelInfo().lvl;
  const mult = 1 + Math.min(lvl - 1, 30) * 0.04; // +4 % par niveau, plafonné
  const raw = ex.base[fitness()] * mult;
  return ex.unit === 'min' || raw < 20 ? Math.round(raw) : Math.round(raw / 5) * 5;
}
const xpFor = (ex, amount) => Math.max(5, Math.round(amount * ex.xp));

function ensureDaily() {
  const today = dayKey();
  if (state.daily.date === today) return;
  const rnd = seeded(today + (state.profile?.name || ''));
  const byStat = s => shuffle(EXERCISES.filter(e => e.stat === s), rnd);
  // Un défi de force, un d'endurance, un au hasard (souvent souplesse)
  const picks = [byStat('force')[0], byStat('endurance')[0]];
  const rest = shuffle(EXERCISES.filter(e => !picks.includes(e)), rnd);
  picks.push(rnd() < 0.5 ? byStat('souplesse')[0] : rest[0]);
  state.daily = {
    date: today,
    challenges: picks.map(ex => { const amount = scaledAmount(ex); return { exo: ex.id, amount, xp: xpFor(ex, amount), done: false }; }),
  };
  save();
}

function completeChallenge(i) {
  const c = state.daily.challenges[i];
  if (!c || c.done) return;
  const ex = EXERCISES.find(e => e.id === c.exo);
  c.done = true;
  state.counters.challenges++;
  state.counters.exo[ex.id] = (state.counters.exo[ex.id] || 0) + c.amount;
  let xp = c.xp;
  const all = state.daily.challenges.every(x => x.done);
  if (all) { state.counters.fullDays++; xp += 50; }
  gain(xp, ex.stat, `${ex.name} : ${c.amount} ${ex.unit}${all ? ' · bonus journée complète +50' : ''}`, { kind: 'exo', exo: ex.id, amount: c.amount });
  render();
}

function logFree(exoId, amount) {
  const ex = EXERCISES.find(e => e.id === exoId);
  amount = Math.max(1, Math.min(10000, Math.round(amount)));
  state.counters.exo[ex.id] = (state.counters.exo[ex.id] || 0) + amount;
  gain(xpFor(ex, amount), ex.stat, `Activité libre · ${ex.name} : ${amount} ${ex.unit}`, { kind: 'exo', exo: ex.id, amount });
  render();
}

// ---------- Quêtes hebdo ----------
const QUEST_POOL = [
  { id: 'pompes', make: lvl => ({ label: `Faire ${[60, 120, 200][lvl]} pompes`, target: [60, 120, 200][lvl], metric: 'exo:pompes' }) },
  { id: 'squats', make: lvl => ({ label: `Faire ${[100, 200, 300][lvl]} squats`, target: [100, 200, 300][lvl], metric: 'exo:squats' }) },
  { id: 'jours', make: () => ({ label: 'Être actif 5 jours cette semaine', target: 5, metric: 'activeDays' }) },
  { id: 'defis', make: () => ({ label: 'Valider 12 défis du jour', target: 12, metric: 'challenges' }) },
  { id: 'oeuvre', make: () => ({ label: 'Terminer un livre, un film ou un documentaire', target: 1, metric: 'works' }) },
  { id: 'lecture', make: () => ({ label: 'Lire ou regarder 120 minutes', target: 120, metric: 'minutes' }) },
  { id: 'gainage', make: lvl => ({ label: `Cumuler ${[3, 5, 8][lvl]} min de gainage`, target: [180, 300, 480][lvl], metric: 'exo:gainage', unit: 's' }) },
];

function ensureWeekly() {
  const wk = weekKey();
  if (state.weekly.week === wk) return;
  const rnd = seeded('w' + wk);
  const fit = shuffle(QUEST_POOL.filter(q => !['oeuvre', 'lecture'].includes(q.id)), rnd).slice(0, 2);
  const cult = shuffle(QUEST_POOL.filter(q => ['oeuvre', 'lecture'].includes(q.id)), rnd)[0];
  state.weekly = { week: wk, quests: [...fit, cult].map(q => ({ id: q.id, ...q.make(fitness()), xp: 200, done: false })) };
  save();
}

function questProgress(q) {
  const since = new Date(state.weekly.week + 'T00:00:00').getTime();
  const logs = state.log.filter(l => l.t >= since);
  if (q.metric.startsWith('exo:')) { const id = q.metric.slice(4); return logs.filter(l => l.exo === id).reduce((a, l) => a + l.amount, 0); }
  if (q.metric === 'activeDays') return new Set(logs.map(l => dayKey(new Date(l.t)))).size;
  if (q.metric === 'challenges') return logs.filter(l => l.kind === 'exo' && !l.label.startsWith('Activité libre')).length;
  if (q.metric === 'works') return logs.filter(l => l.kind === 'work').length;
  if (q.metric === 'minutes') return logs.filter(l => l.kind === 'minutes').reduce((a, l) => a + l.amount, 0);
  return 0;
}

function checkQuests() {
  for (const q of state.weekly.quests) {
    if (!q.done && questProgress(q) >= q.target) {
      q.done = true;
      state.counters.quests++;
      state.xp += q.xp;
      state.log.unshift({ t: Date.now(), xp: q.xp, label: `Quête accomplie : ${q.label}`, kind: 'quest' });
      setTimeout(() => toast(`📜 Quête accomplie ! +${q.xp} XP`, q.label, 'gold'), 900);
    }
  }
}

// ---------- Succès ----------
function checkAchievements() {
  const lvl = levelInfo().lvl;
  for (const a of ACHIEVEMENTS) {
    if (!state.achievements.includes(a.id) && a.check(state, lvl)) {
      state.achievements.push(a.id);
      setTimeout(() => toast(`🏆 Succès débloqué : ${a.name}`, a.desc, 'gold'), 1400);
    }
  }
}

// ---------- Culture ----------
// Suggestions du jour : choisies une fois par jour, pas remplacées quand on en traite une
function dailySuggestions() {
  const today = dayKey();
  if (state.cultureDaily?.date !== today) {
    const formats = state.profile.formats.length ? state.profile.formats : FORMATS.map(f => f.id);
    const ids = formats.flatMap(f => suggestions(f).slice(0, 2).map(i => i.id));
    state.cultureDaily = { date: today, ids };
    save();
  }
  return state.cultureDaily.ids
    .map(id => CATALOG.find(i => i.id === id))
    .filter(i => i && !state.library[i.id] && !state.hidden.includes(i.id));
}

function suggestions(type) {
  const ints = state.profile?.interests || [];
  const score = item => item.tags.filter(t => ints.includes(t)).length;
  return CATALOG
    .filter(i => (!type || i.type === type) && !state.library[i.id] && !state.hidden.includes(i.id))
    .map(i => ({ i, s: score(i) + seeded(i.id + dayKey())() * 0.9 }))
    .filter(x => x.s >= 1 || ints.length === 0)
    .sort((a, b) => b.s - a.s)
    .map(x => x.i);
}

function setWork(id, status) {
  const item = CATALOG.find(i => i.id === id);
  if (!item) return;
  if (status === 'hide') { state.hidden.push(id); save(); render(); return; }
  if (status === 'done' && state.library[id] !== 'done') {
    state.library[id] = 'done';
    state.counters.done[item.type]++;
    const f = FORMATS.find(f => f.id === item.type);
    gain(f.xp, 'savoir', `${f.icon} Terminé : ${item.title}`, { kind: 'work' });
  } else if (status === 'todo') {
    state.library[id] = 'todo';
    save();
    toast('Ajouté à ta liste', item.title);
  } else if (status === 'remove') {
    delete state.library[id];
    save();
  }
  render();
}

function logMinutes(min) {
  min = Math.max(1, Math.min(600, Math.round(min)));
  state.counters.cultureMinutes += min;
  gain(Math.round(min), 'savoir', `Lecture / visionnage : ${min} min`, { kind: 'minutes', amount: min });
  render();
}

// ---------- Notifications & rappels ----------
async function swReg() {
  if (!('serviceWorker' in navigator)) return null;
  try { return await navigator.serviceWorker.ready; } catch { return null; }
}

async function notify(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const reg = await swReg();
  const opts = { body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'defi', renotify: true, vibrate: [100, 50, 100] };
  if (reg) reg.showNotification(title, opts); else new Notification(title, opts);
}

async function enableNotifications() {
  if (!('Notification' in window)) { toast('Notifications non disponibles', 'Sur iPhone, installe d\'abord l\'appli sur l\'écran d\'accueil.'); return; }
  const p = await Notification.requestPermission();
  state.settings.notifications = p === 'granted';
  save();
  if (p === 'granted') {
    notify('Notifications activées 🎉', 'Tu recevras tes défis aux heures choisies.');
    registerPeriodic();
  } else toast('Notifications refusées', 'Tu peux les réactiver dans les réglages du navigateur.');
  render();
}

async function registerPeriodic() {
  const reg = await swReg();
  if (!reg || !('periodicSync' in reg)) return;
  try {
    const st = await navigator.permissions.query({ name: 'periodic-background-sync' });
    if (st.state === 'granted') await reg.periodicSync.register('defi-du-jour', { minInterval: 6 * 60 * 60 * 1000 });
  } catch {}
}

function nextChallengeText() {
  ensureDaily();
  const c = state.daily.challenges.find(x => !x.done);
  if (!c) return 'Tous tes défis sont validés aujourd\'hui. Une séance libre pour le bonus ?';
  const ex = EXERCISES.find(e => e.id === c.exo);
  return `${ex.icon} ${ex.name} : ${c.amount} ${ex.unit} → +${c.xp} XP`;
}

function allDoneToday() {
  return state.daily.date === dayKey() && state.daily.challenges.length > 0 && state.daily.challenges.every(c => c.done);
}

function reminderTick() {
  if (!state.settings.notifications || !state.profile) return;
  if (allDoneToday()) return; // défis du jour terminés : pas de rappel
  const now = new Date();
  const hm = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const today = dayKey();
  for (const r of state.settings.reminders) {
    const key = today + ' ' + r;
    if (hm === r && !state.settings.lastFired[key]) {
      state.settings.lastFired = { [key]: true };
      save();
      notify('⚔️ Un défi t\'attend !', nextChallengeText());
    }
  }
}

function googleCalendarLink(time) {
  const [h, m] = time.split(':');
  const d = new Date(); d.setDate(d.getDate() + 1);
  const start = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${h}${m}00`;
  const endDate = new Date(d); endDate.setHours(+h, +m + 10);
  const end = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: '⚔️ Défi Remise en forme',
    details: `Ouvre l'appli pour voir ton défi du moment : ${location.origin + location.pathname}`,
    dates: `${start}/${end}`,
    recur: 'RRULE:FREQ=DAILY',
  });
  return 'https://calendar.google.com/calendar/render?' + params.toString();
}

function downloadICS() {
  const d = new Date(); d.setDate(d.getDate() + 1);
  const date = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const url = location.origin + location.pathname;
  const events = state.settings.reminders.map((r, i) => {
    const [h, m] = r.split(':');
    return [
      'BEGIN:VEVENT',
      `UID:remise-en-forme-${i}-${r.replace(':', '')}@local`,
      `DTSTAMP:${date}T000000`,
      `DTSTART:${date}T${h}${m}00`,
      'DURATION:PT10M',
      'RRULE:FREQ=DAILY',
      'SUMMARY:⚔️ Défi Remise en forme',
      `DESCRIPTION:Ouvre l'appli pour voir ton défi du moment : ${url}`,
      `URL:${url}`,
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Un défi t\'attend !', 'TRIGGER:PT0M', 'END:VALARM',
      'END:VEVENT',
    ].join('\r\n');
  });
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Remise en forme//FR', 'CALSCALE:GREGORIAN', ...events, 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  a.download = 'rappels-remise-en-forme.ics';
  a.click();
}

// ---------- Sauvegarde ----------
function exportData() {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));
  a.download = `remise-en-forme-sauvegarde-${dayKey()}.json`;
  a.click();
}
function importData(file) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const s = JSON.parse(r.result);
      if (typeof s.xp !== 'number') throw new Error();
      localStorage.setItem(KEY, JSON.stringify(s));
      state = load();
      toast('Sauvegarde restaurée', `Niveau ${levelInfo().lvl}`);
      render();
    } catch { toast('Fichier invalide', 'Choisis un fichier de sauvegarde exporté par l\'appli.'); }
  };
  r.readAsText(file);
}

// ---------- Interface ----------
let tab = 'hero';
let cultureFilter = '';
let onboardStep = 0;
let draft = { name: '', level: 0, interests: [], formats: ['livre', 'doc', 'film'], reminders: ['08:00', '12:30', '18:30'] };

function toast(title, body = '', variant = '') {
  const el = document.createElement('div');
  el.className = 'toast ' + variant;
  el.innerHTML = `<strong>${esc(title)}</strong>${body ? `<span>${esc(body)}</span>` : ''}`;
  const box = $('#toasts');
  box.appendChild(el);
  while (box.children.length > 3) box.firstChild.remove();
  setTimeout(() => el.classList.add('out'), 3200);
  setTimeout(() => el.remove(), 3700);
}

function levelUp(lvl) {
  const el = document.createElement('div');
  el.className = 'levelup';
  el.innerHTML = `<div class="levelup-card"><div class="burst">⬆️</div><h2>Niveau ${lvl} !</h2><p>Tu es désormais <strong>${titleFor(lvl)}</strong>.</p><p class="muted">Tes défis deviennent un peu plus costauds.</p><button class="btn primary">Continuer</button></div>`;
  el.querySelector('button').onclick = () => el.remove();
  document.body.appendChild(el);
  notify(`⬆️ Niveau ${lvl} atteint !`, `Tu es désormais ${titleFor(lvl)}.`);
}

function bar(pct, color = 'var(--accent)') {
  return `<div class="bar"><div class="bar-fill" style="width:${pct.toFixed(1)}%;background:${color}"></div></div>`;
}

function viewOnboarding() {
  const steps = [
    () => `
      <div class="onb-hero">⚔️</div>
      <h1>Bienvenue, aventurier</h1>
      <p class="lead">Chaque pompe, chaque page lue et chaque documentaire regardé te rapporte de l'expérience. Monte en niveau, débloque des succès et retrouve la forme.</p>
      <label class="field">Comment veux-tu qu'on t'appelle ?
        <input id="onb-name" maxlength="24" placeholder="Ton pseudo de héros" value="${esc(draft.name)}" autocomplete="nickname">
      </label>
      <button class="btn primary block" data-action="onb-next">Commencer</button>`,
    () => `
      <h2>Ta forme actuelle</h2>
      <p class="muted">Sois honnête : les défis s'adaptent et augmentent avec ton niveau.</p>
      ${['Je reprends de zéro (ou presque)', 'Je bouge un peu de temps en temps', 'Je suis déjà en assez bonne forme'].map((l, i) => `
        <button class="choice ${draft.level === i ? 'on' : ''}" data-action="onb-level" data-v="${i}">
          <span class="choice-icon">${['🌱', '🌿', '🌳'][i]}</span><span>${l}<small>${['Ex. : 8 pompes, 15 squats', 'Ex. : 15 pompes, 25 squats', 'Ex. : 25 pompes, 40 squats'][i]}</small></span>
        </button>`).join('')}
      <button class="btn primary block" data-action="onb-next">Suivant</button>`,
    () => `
      <h2>Tes centres d'intérêt</h2>
      <p class="muted">Choisis-en au moins trois pour des suggestions de livres, films et documentaires à ton goût.</p>
      <div class="chips">${INTERESTS.map(i => `<button class="chip ${draft.interests.includes(i.id) ? 'on' : ''}" data-action="onb-int" data-v="${i.id}">${i.icon} ${i.label}</button>`).join('')}</div>
      <h3>Ce que tu préfères</h3>
      <div class="chips">${FORMATS.map(f => `<button class="chip ${draft.formats.includes(f.id) ? 'on' : ''}" data-action="onb-fmt" data-v="${f.id}">${f.icon} ${f.label}</button>`).join('')}</div>
      <button class="btn primary block" data-action="onb-next" ${draft.interests.length < 3 ? 'disabled' : ''}>Suivant (${draft.interests.length}/3 min.)</button>`,
    () => `
      <h2>Tes rappels de défis</h2>
      <p class="muted">À quelles heures veux-tu qu'on te lance un défi ? Tu pourras les changer plus tard.</p>
      ${draft.reminders.map((r, i) => `<label class="field inline">Rappel ${i + 1}<input type="time" data-reminder="${i}" value="${r}"></label>`).join('')}
      <button class="btn primary block" data-action="onb-finish">Créer mon héros</button>`,
  ];
  return `<div class="onb"><div class="dots">${steps.map((_, i) => `<span class="${i <= onboardStep ? 'on' : ''}"></span>`).join('')}</div>${steps[onboardStep]()}</div>`;
}

function viewHero() {
  const li = levelInfo();
  const p = state.profile;
  const maxStat = Math.max(100, ...Object.values(state.stats));
  ensureDaily();
  const doneToday = state.daily.challenges.filter(c => c.done).length;
  return `
    <section class="card hero-card">
      <div class="avatar">${['🌱', '🛡️', '⚔️', '👑'][Math.min(3, Math.floor(li.lvl / 6))]}</div>
      <div class="hero-info">
        <h1>${esc(p.name)}</h1>
        <div class="title">Niveau ${li.lvl} · ${titleFor(li.lvl)}</div>
        ${bar(li.pct)}
        <div class="muted small">${li.into} / ${li.need} XP pour le niveau ${li.lvl + 1} · ${state.xp} XP au total</div>
      </div>
    </section>
    <section class="grid3">
      <div class="card stat-mini"><div class="big">🔥 ${currentStreak()}</div><div class="muted small">jours d'affilée</div></div>
      <div class="card stat-mini"><div class="big">${doneToday}/3</div><div class="muted small">défis du jour</div></div>
      <div class="card stat-mini"><div class="big">🏆 ${state.achievements.length}</div><div class="muted small">succès</div></div>
    </section>
    <section class="card">
      <h2>Caractéristiques</h2>
      ${Object.entries(STATS).map(([k, s]) => `
        <div class="stat-row"><span>${s.icon} ${s.name}</span><span class="muted">${state.stats[k]}</span></div>
        ${bar((state.stats[k] / maxStat) * 100, s.color)}`).join('')}
    </section>
    <section class="card cta" data-action="tab" data-v="defis">
      <div><h2>Prochain défi</h2><p>${esc(nextChallengeText())}</p></div><span class="chev">›</span>
    </section>
    ${state.settings.notifications ? '' : `<section class="card notice"><p>🔔 Active les notifications pour recevoir tes défis dans la journée.</p><button class="btn primary" data-action="tab" data-v="reglages">Configurer les rappels</button></section>`}
    <section class="card">
      <h2>Journal</h2>
      ${state.log.length ? `<ul class="log">${state.log.slice(0, 8).map(l => `<li><span>${esc(l.label)}</span><span class="xp">+${l.xp}</span></li>`).join('')}</ul>` : '<p class="muted">Ton aventure commence ici. Valide ton premier défi !</p>'}
    </section>`;
}

function viewDefis() {
  ensureDaily();
  const all = state.daily.challenges.every(c => c.done);
  return `
    <h1 class="page-title">Défis du jour</h1>
    <p class="muted">Valide les 3 défis pour un bonus de <strong>+50 XP</strong>. Ils changent chaque jour et grandissent avec ton niveau.</p>
    ${state.daily.challenges.map((c, i) => {
      const ex = EXERCISES.find(e => e.id === c.exo);
      return `
      <article class="card challenge ${c.done ? 'done' : ''}">
        <div class="ch-icon">${ex.icon}</div>
        <div class="ch-body">
          <h3>${ex.name}</h3>
          <div class="ch-amount">${c.amount} <small>${ex.unit}</small></div>
          <p class="muted small">${esc(ex.tip)}</p>
          <div class="tags"><span class="tag" style="--c:${STATS[ex.stat].color}">${STATS[ex.stat].icon} ${STATS[ex.stat].name}</span><span class="tag xp">+${c.xp} XP</span></div>
        </div>
        ${c.done ? '<div class="check">✓</div>' : `<button class="btn primary" data-action="complete" data-v="${i}">Fait !</button>`}
      </article>`;
    }).join('')}
    ${all ? '<div class="card notice gold"><p>🎉 Journée complète ! Reviens demain pour de nouveaux défis, ou fais une séance libre.</p></div>' : ''}
    <section class="card">
      <h2>Séance libre</h2>
      <p class="muted small">Tu as fait plus ? Note-le, tout effort compte.</p>
      <div class="row">
        <select id="free-exo">${EXERCISES.map(e => `<option value="${e.id}">${e.icon} ${e.name} (${e.unit})</option>`).join('')}</select>
        <input id="free-amount" type="number" inputmode="numeric" min="1" placeholder="Qté">
        <button class="btn" data-action="free">Ajouter</button>
      </div>
    </section>
    <section class="card">
      <h2>Mes records</h2>
      ${Object.keys(state.counters.exo).length ? `<ul class="log">${Object.entries(state.counters.exo).sort((a, b) => b[1] - a[1]).map(([id, n]) => { const ex = EXERCISES.find(e => e.id === id); return ex ? `<li><span>${ex.icon} ${ex.name}</span><span class="muted">${n} ${ex.unit} au total</span></li>` : ''; }).join('')}</ul>` : '<p class="muted">Rien encore. À toi de jouer !</p>'}
    </section>`;
}

function workCard(item, mode) {
  const f = FORMATS.find(f => f.id === item.type);
  const tags = item.tags.map(t => INTERESTS.find(i => i.id === t)).filter(Boolean);
  const actions = mode === 'suggest'
    ? `<button class="btn small" data-action="work" data-v="${item.id}" data-s="todo">+ Ma liste</button><button class="btn small primary" data-action="work" data-v="${item.id}" data-s="done">Déjà fait ✓</button><button class="btn small ghost" data-action="work" data-v="${item.id}" data-s="hide" title="Pas pour moi">✕</button>`
    : mode === 'todo'
      ? `<button class="btn small primary" data-action="work" data-v="${item.id}" data-s="done">Terminé ! +${f.xp} XP</button><button class="btn small ghost" data-action="work" data-v="${item.id}" data-s="remove">Retirer</button>`
      : '';
  return `
    <article class="card work">
      <div class="work-type">${f.icon}</div>
      <div class="work-body">
        <h3>${esc(item.title)}</h3>
        <div class="muted small">${esc(item.by)}</div>
        <p class="small">${esc(item.desc)}</p>
        <div class="tags">${tags.map(t => `<span class="tag">${t.icon} ${t.label}</span>`).join('')}<span class="tag xp">+${f.xp} XP</span></div>
        ${actions ? `<div class="actions">${actions}</div>` : ''}
      </div>
    </article>`;
}

function viewCulture() {
  const formats = state.profile.formats.length ? state.profile.formats : FORMATS.map(f => f.id);
  const todo = CATALOG.filter(i => state.library[i.id] === 'todo');
  const done = CATALOG.filter(i => state.library[i.id] === 'done');
  const sugg = dailySuggestions().filter(i => !cultureFilter || i.type === cultureFilter);
  return `
    <h1 class="page-title">Culture</h1>
    <section class="card">
      <h2>J'ai lu / regardé aujourd'hui</h2>
      <p class="muted small">1 minute = 1 XP de Savoir.</p>
      <div class="row">
        ${[15, 30, 60].map(m => `<button class="btn" data-action="minutes" data-v="${m}">${m} min</button>`).join('')}
        <input id="custom-min" type="number" inputmode="numeric" min="1" max="600" placeholder="Autre">
        <button class="btn" data-action="minutes-custom">OK</button>
      </div>
    </section>
    ${todo.length ? `<h2 class="section">📋 Ma liste (${todo.length})</h2>${todo.map(i => workCard(i, 'todo')).join('')}` : ''}
    <h2 class="section">✨ Suggestions du jour</h2>
    <div class="chips">
      <button class="chip ${!cultureFilter ? 'on' : ''}" data-action="cfilter" data-v="">Tout</button>
      ${FORMATS.map(f => `<button class="chip ${cultureFilter === f.id ? 'on' : ''}" data-action="cfilter" data-v="${f.id}">${f.icon} ${f.label}</button>`).join('')}
    </div>
    ${sugg.length ? sugg.map(i => workCard(i, 'suggest')).join('') : (suggestions(null).length ? '<p class="muted">C\'est tout pour aujourd\'hui. De nouvelles suggestions t\'attendent demain !</p>' : '<p class="muted">Tu as fait le tour des suggestions pour ces centres d\'intérêt ! Ajoute-en d\'autres dans les réglages.</p>')}
    ${done.length ? `<h2 class="section">🏅 Terminés (${done.length})</h2><ul class="log card">${done.map(i => `<li><span>${FORMATS.find(f => f.id === i.type).icon} ${esc(i.title)}</span><span class="muted small">${esc(i.by)}</span></li>`).join('')}</ul>` : ''}`;
}

function viewQuetes() {
  ensureWeekly();
  const lvl = levelInfo().lvl;
  return `
    <h1 class="page-title">Quêtes & succès</h1>
    <h2 class="section">📜 Quêtes de la semaine</h2>
    <p class="muted small">Nouvelles quêtes chaque lundi. +200 XP chacune.</p>
    ${state.weekly.quests.map(q => {
      const prog = Math.min(q.target, questProgress(q));
      const shown = q.unit === 's' ? `${Math.floor(prog / 60)}/${q.target / 60} min` : `${prog}/${q.target}`;
      return `<article class="card quest ${q.done ? 'done' : ''}"><div class="row-between"><h3>${q.done ? '✅ ' : ''}${esc(q.label)}</h3><span class="tag xp">+${q.xp} XP</span></div>${bar((prog / q.target) * 100, q.done ? 'var(--gold)' : 'var(--accent)')}<div class="muted small">${shown}</div></article>`;
    }).join('')}
    <h2 class="section">🎯 Prochains paliers</h2>
    <div class="card">
      ${TITLES.filter(t => t.level > lvl).slice(0, 3).map(t => `<div class="stat-row"><span>Niveau ${t.level} : <strong>${t.title}</strong></span><span class="muted small">encore ${xpToReach(t.level) - state.xp} XP</span></div>`).join('') || '<p>Tu as atteint le rang ultime. Légendaire !</p>'}
    </div>
    <h2 class="section">🏆 Succès (${state.achievements.length}/${ACHIEVEMENTS.length})</h2>
    <div class="badges">
      ${ACHIEVEMENTS.map(a => { const on = state.achievements.includes(a.id); return `<div class="badge ${on ? 'on' : ''}"><div class="badge-icon">${on ? a.icon : '🔒'}</div><strong>${a.name}</strong><span>${a.desc}</span></div>`; }).join('')}
    </div>`;
}

function viewReglages() {
  const perm = 'Notification' in window ? Notification.permission : 'unsupported';
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  return `
    <h1 class="page-title">Réglages</h1>
    ${standalone ? '' : `<section class="card notice">
      <h2>📲 Installer l'appli</h2>
      <p class="small"><strong>Android (Chrome)</strong> : menu ⋮ puis « Ajouter à l'écran d'accueil » ou « Installer l'application ».<br>
      <strong>iPhone (Safari)</strong> : bouton Partager ⬆️ puis « Sur l'écran d'accueil ». Nécessaire pour les notifications sur iPhone.</p>
      ${deferredInstall ? '<button class="btn primary" data-action="install">Installer maintenant</button>' : ''}
    </section>`}
    <section class="card">
      <h2>🔔 Rappels de défis</h2>
      ${state.settings.reminders.map((r, i) => `<div class="row"><input type="time" data-setreminder="${i}" value="${r}"><button class="btn ghost small" data-action="del-reminder" data-v="${i}">Supprimer</button><a class="btn small" target="_blank" rel="noopener" href="${googleCalendarLink(r)}">+ Google Agenda</a></div>`).join('')}
      ${state.settings.reminders.length < 6 ? '<button class="btn small" data-action="add-reminder">+ Ajouter un rappel</button>' : ''}
      <hr>
      <p class="small">Notifications de l'appli : <strong>${perm === 'granted' && state.settings.notifications ? 'activées ✅' : perm === 'denied' ? 'bloquées dans le navigateur' : perm === 'unsupported' ? 'non disponibles ici' : 'désactivées'}</strong></p>
      ${perm !== 'granted' || !state.settings.notifications ? '<button class="btn primary" data-action="notif">Activer les notifications</button>' : '<button class="btn small" data-action="test-notif">Tester une notification</button>'}
      <p class="muted small">Les notifications de l'appli arrivent quand elle est ouverte ou en arrière-plan. Elles ne se déclenchent pas si tes 3 défis du jour sont déjà validés. Pour des rappels garantis même téléphone en veille, ajoute-les à ton agenda (attention : les rappels d'agenda, eux, sonnent même si tes défis sont faits) : bouton « + Google Agenda » sur chaque rappel, ou <a href="#" data-action="ics">télécharge le fichier agenda (.ics)</a>.</p>
    </section>
    <section class="card">
      <h2>🧭 Profil</h2>
      <label class="field">Pseudo<input id="set-name" maxlength="24" value="${esc(state.profile.name)}"></label>
      <p class="small">Forme de départ</p>
      <div class="chips">${['🌱 Débutant', '🌿 Intermédiaire', '🌳 Avancé'].map((l, i) => `<button class="chip ${state.profile.level === i ? 'on' : ''}" data-action="set-level" data-v="${i}">${l}</button>`).join('')}</div>
      <p class="small">Centres d'intérêt</p>
      <div class="chips">${INTERESTS.map(i => `<button class="chip ${state.profile.interests.includes(i.id) ? 'on' : ''}" data-action="set-int" data-v="${i.id}">${i.icon} ${i.label}</button>`).join('')}</div>
      <p class="small">Formats préférés</p>
      <div class="chips">${FORMATS.map(f => `<button class="chip ${state.profile.formats.includes(f.id) ? 'on' : ''}" data-action="set-fmt" data-v="${f.id}">${f.icon} ${f.label}</button>`).join('')}</div>
    </section>
    <section class="card">
      <h2>💾 Sauvegarde</h2>
      <p class="muted small">Ta progression est enregistrée sur cet appareil. Exporte-la de temps en temps pour ne rien perdre.</p>
      <div class="row">
        <button class="btn" data-action="export">Exporter</button>
        <label class="btn">Importer<input type="file" accept="application/json" id="import-file" hidden></label>
        <button class="btn danger" data-action="reset">Tout effacer</button>
      </div>
    </section>
    <p class="muted small center">Remise en forme · v1.0</p>`;
}

const TABS = [
  { id: 'hero', label: 'Héros', icon: '🛡️', view: viewHero },
  { id: 'defis', label: 'Défis', icon: '💪', view: viewDefis },
  { id: 'culture', label: 'Culture', icon: '📚', view: viewCulture },
  { id: 'quetes', label: 'Quêtes', icon: '📜', view: viewQuetes },
  { id: 'reglages', label: 'Réglages', icon: '⚙️', view: viewReglages },
];

function render() {
  const app = $('#app');
  if (!state.profile) {
    app.innerHTML = `<main class="view">${viewOnboarding()}</main>`;
    return;
  }
  const t = TABS.find(t => t.id === tab) || TABS[0];
  const scroll = window.scrollY;
  app.innerHTML = `
    <main class="view">${t.view()}</main>
    <nav class="tabbar">${TABS.map(x => `<button class="${x.id === tab ? 'on' : ''}" data-action="tab" data-v="${x.id}"><span>${x.icon}</span>${x.label}</button>`).join('')}</nav>`;
  window.scrollTo(0, scroll);
}

const toggle = (arr, v) => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const { action, v } = el.dataset;
  switch (action) {
    case 'tab': tab = v; render(); window.scrollTo(0, 0); break;
    case 'onb-next':
      if (onboardStep === 0) { draft.name = $('#onb-name').value.trim() || 'Aventurier'; }
      onboardStep++; render(); break;
    case 'onb-level': draft.level = +v; render(); break;
    case 'onb-int': draft.interests = toggle(draft.interests, v); render(); break;
    case 'onb-fmt': draft.formats = toggle(draft.formats, v); render(); break;
    case 'onb-finish':
      state.profile = { name: draft.name, level: draft.level, interests: draft.interests, formats: draft.formats.length ? draft.formats : FORMATS.map(f => f.id) };
      state.settings.reminders = [...new Set(draft.reminders)].sort();
      save(); ensureDaily(); ensureWeekly(); tab = 'hero'; render();
      toast(`Bienvenue, ${draft.name} !`, 'Ton premier défi t\'attend dans l\'onglet Défis.');
      break;
    case 'complete': completeChallenge(+v); break;
    case 'free': { const n = +$('#free-amount').value; if (n > 0) logFree($('#free-exo').value, n); else toast('Indique une quantité'); break; }
    case 'work': setWork(v, el.dataset.s); break;
    case 'cfilter': cultureFilter = v; render(); break;
    case 'minutes': logMinutes(+v); break;
    case 'minutes-custom': { const n = +$('#custom-min').value; if (n > 0) logMinutes(n); else toast('Indique un nombre de minutes'); break; }
    case 'notif': enableNotifications(); break;
    case 'test-notif': notify('⚔️ Un défi t\'attend !', nextChallengeText()); break;
    case 'ics': e.preventDefault(); downloadICS(); break;
    case 'add-reminder': state.settings.reminders.push('20:00'); save(); render(); break;
    case 'del-reminder': state.settings.reminders.splice(+v, 1); save(); render(); break;
    case 'install': deferredInstall?.prompt(); deferredInstall = null; break;
    case 'set-level': state.profile.level = +v; state.daily.date = null; save(); render(); toast('Défis recalculés', 'Tes défis du jour sont adaptés.'); break;
    case 'set-int': state.profile.interests = toggle(state.profile.interests, v); state.cultureDaily = { date: null, ids: [] }; save(); render(); break;
    case 'set-fmt': state.profile.formats = toggle(state.profile.formats, v); state.cultureDaily = { date: null, ids: [] }; save(); render(); break;
    case 'export': exportData(); break;
    case 'reset':
      if (confirm('Effacer toute ta progression ? Cette action est définitive.')) { localStorage.removeItem(KEY); state = freshState(); onboardStep = 0; render(); }
      break;
  }
});

document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.reminder !== undefined) draft.reminders[+t.dataset.reminder] = t.value;
  if (t.dataset.setreminder !== undefined && t.value) { state.settings.reminders[+t.dataset.setreminder] = t.value; save(); }
  if (t.id === 'set-name') { state.profile.name = t.value.trim() || state.profile.name; save(); }
  if (t.id === 'import-file' && t.files[0]) importData(t.files[0]);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'onb-name') $('[data-action="onb-next"]').click();
});

// ---------- Installation & service worker ----------
let deferredInstall = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; if (tab === 'reglages') render(); });

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(() => { if (state.settings.notifications) registerPeriodic(); }).catch(() => {});
  navigator.serviceWorker.addEventListener('message', e => { if (e.data === 'open-defis') { tab = 'defis'; render(); } });
}
if (new URLSearchParams(location.search).get('tab')) tab = new URLSearchParams(location.search).get('tab');

// Nouveau jour pendant que l'appli est ouverte, et rappels
setInterval(() => {
  if (state.profile && state.daily.date !== dayKey()) { ensureDaily(); ensureWeekly(); render(); }
  reminderTick();
}, 20000);
document.addEventListener('visibilitychange', () => { if (!document.hidden && state.profile) { ensureDaily(); ensureWeekly(); render(); } });

if (state.profile) { ensureDaily(); ensureWeekly(); }
render();
