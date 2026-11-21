var CACHE = 'lectura-articole-v31';
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

function fetchWithTimeout(req, ms) {
  return new Promise(function(resolve, reject) {
    var done = false;
    var timer = setTimeout(function() {
      if (!done) {
        done = true;
        reject(new Error('sw_net_timeout'));
      }
    }, ms);
    fetch(new Request(req.url, { cache: 'no-store' })).then(function(resp) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve(resp);
    }).catch(function(err) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      reject(err);
    });
  });
}

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

  // X295: La Share Target (?url= / ?text= / ?title=) servim INSTANT din cache (<5ms) ca să nu înghețe pe iconul aplicației
  var isShareNav = e.request.mode === 'navigate' && /[?&](?:url|text|title)=/i.test(e.request.url);
  if (isShareNav) {
    e.respondWith(
      caches.match('./index.html').then(function(cachedIdx) {
        if (cachedIdx) return cachedIdx;
        return caches.match(e.request, { ignoreSearch: true }).then(function(cachedAny) {
          if (cachedAny) return cachedAny;
          return fetchWithTimeout(e.request, 2500).then(function(resp) {
            if (resp && resp.status === 200) {
              var cl = resp.clone();
              caches.open(CACHE).then(function(cache) { cache.put('./index.html', cl); });
            }
            return resp;
          });
        });
      }).catch(function() {
        return caches.match('./index.html') || caches.match(e.request, { ignoreSearch: true });
      })
    );
    return;
  }

  // Network-First cu timeout scurt (2.5s) pentru navigare normală, HTML și manifest.json
  if (
    e.request.mode === 'navigate' ||
    e.request.url.endsWith('manifest.json') ||
    e.request.url.endsWith('index.html') ||
    e.request.url.endsWith('/')
  ) {
    e.respondWith(
      fetchWithTimeout(e.request, 2500).then(function(resp) {
        if (resp && resp.status === 200) {
          var clone = resp.clone();
          var cacheKey = e.request.mode === 'navigate' ? './index.html' : e.request;
          caches.open(CACHE).then(function(cache) {
            cache.put(cacheKey, clone);
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
