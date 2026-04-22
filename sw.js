//v52
var CACHE = 'projectboard-v52';
var FILES = [
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(FILES);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch handler complet — necesar pentru instalare PWA
// Share target NU e interceptat — URL ajunge direct la handleIncomingShare()
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).then(function(resp) {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          var clone = resp.clone();
    

      caches.open(CACHE).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return resp;
      });
    }).catch(function() {
      return caches.match('/index.html');
    })
  );
});



