// Service worker : fonctionnement hors ligne + notifications
const CACHE = 'remise-en-forme-v2';
const STATUS_CACHE = 'remise-en-forme-status';
const ASSETS = ['./', 'index.html', 'css/style.css', 'js/app.js', 'js/data.js', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== STATUS_CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Réseau d'abord (pour recevoir les mises à jour), cache si hors ligne
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (all.length) { all[0].focus(); all[0].postMessage('open-defis'); return; }
    return self.clients.openWindow('./?tab=defis');
  })());
});

// Android (appli installée) : rappel en arrière-plan quand le système le permet
self.addEventListener('periodicsync', e => {
  if (e.tag !== 'defi-du-jour') return;
  const h = new Date().getHours();
  if (h < 8 || h > 21) return;
  e.waitUntil(notifyIfNeeded());
});

// Pas de rappel si les 3 défis du jour sont déjà validés
async function notifyIfNeeded() {
  try {
    const res = await (await caches.open(STATUS_CACHE)).match('status.json');
    if (res) {
      const s = await res.json();
      const d = new Date();
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (s.date === today && s.allDone) return;
    }
  } catch {}
  return self.registration.showNotification('⚔️ Un défi t\'attend !', {
    body: 'Ouvre l\'appli pour découvrir tes défis du jour et gagner de l\'XP.',
    icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'defi',
  });
}
