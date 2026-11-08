// BLOCK CLUB offline shell: isolate caches per app path on a shared origin (GitHub Pages).
const VERSION = '1.0.1';
const APP_URLS = ['./', './index.html', './styles.css', './engine.mjs', './app.mjs',
  './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png', './apple-icon.png'];
const ROOT = self.registration.scope;
const PREFIX = `blockclub:${new URL(ROOT).pathname}:`;
const CACHE = `${PREFIX}${VERSION}`;
const ALLOWED = new Set(APP_URLS.map(path => new URL(path, ROOT).href));

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE)
    .then(cache => cache.addAll(APP_URLS.map(path => new URL(path, ROOT).href)))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(name => name.startsWith(PREFIX) && name !== CACHE).map(name => caches.delete(name))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(new URL(ROOT).pathname)) return;

  if (request.mode === 'navigate') {
    // Network-first navigation discovers updates; offline falls back to a fully cached shell.
    event.respondWith(fetch(request).catch(async () =>
      (await caches.match(new URL('./index.html', ROOT).href)) || Response.error()));
    return;
  }
  if (!ALLOWED.has(url.href)) return; // Never cache unrelated paths or user data.
  event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
});
