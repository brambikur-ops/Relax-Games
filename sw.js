/* Relax Games offline worker. Bump VERSION when files change so phones refresh their saved copy. */
var VERSION = 'relax-games-v1';
var FILES = ['./', 'index.html', 'clover.html', 'fall.html', 'aspen.html', 'fonts.css',
  'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png',
  'thumbs/clover.jpg', 'thumbs/fall.jpg', 'thumbs/aspen.jpg',
  'fonts/cormorant-garamond-latin-400-italic.woff2', 'fonts/cormorant-garamond-latin-500-italic.woff2',
  'fonts/karla-latin-400-normal.woff2', 'fonts/karla-latin-500-normal.woff2'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
/* Serve the saved copy right away, and refresh it quietly when online. */
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(VERSION).then(function (c) {
    return c.match(e.request, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(e.request).then(function (r) {
        if (r && r.ok && new URL(e.request.url).origin === location.origin) c.put(e.request, r.clone());
        return r;
      }).catch(function () { return hit; });
      return hit || net;
    });
  }));
});
