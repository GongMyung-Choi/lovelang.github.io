// service-worker.js
const CACHE_NAME = 'luwain-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles/common.css',
  '/scripts/config.js',
  '/scripts/memory_core.js',
  '/scripts/memory_policies.js',
  // 필요시 추가: 각 폴더/파일들
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResp => {
      if (cachedResp) return cachedResp;
      return fetch(event.request).then(networkResp => {
        // 선택적으로 캐싱
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResp.clone());
          return networkResp;
        });
      });
    })
  );
});
