var CACHE = 'lectura-articole-v24';
var FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
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

self.addEventListener('fetch', function(e) {
  // Ignoră cererile externe (API-uri, TTS audio, traducere, proxy-uri)
  if (
    e.request.url.includes('google') ||
    e.request.url.includes('r.jina.ai') ||
    e.request.url.includes('piped') ||
    e.request.url.includes('allorigins') ||
    e.request.url.includes('codetabs') ||
    e.request.url.includes('corsproxy') ||
    e.request.url.includes('lingva') ||
    e.request.url.includes('puter.com')
  ) {
    return;
  }

  // Network-First pentru navigare, HTML și manifest.json ca să primească imediat actualizările
  if (
    e.request.mode === 'navigate' ||
    e.request.url.endsWith('manifest.json') ||
    e.request.url.endsWith('index.html') ||
    e.request.url.endsWith('/')
  ) {
    e.respondWith(
      fetch(new Request(e.request.url, { cache: 'no-store' })).then(function(resp) {
        if (resp && resp.status === 200) {
          var clone = resp.clone();
          caches.open(CACHE).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return resp;
      }).catch(function() {
        return caches.match(e.request, { ignoreSearch: true }).then(function(cached) {
          return cached || caches.match('./index.html');
        });
      })
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(resp) {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          var clone = resp.clone();
          caches.open(CACHE).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return resp;
      });
    }).catch(function() {
      return caches.match('./index.html');
    })
  );
});
