self.addEventListener('install', event => {
  // 모든 캐시 제거 후 새 버전 즉시 적용
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => caches.open('luwain-cache')
        .then(cache => cache.addAll(['/', '/index.html']))
      )
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // 이전 버전 클라이언트 즉시 교체
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open('luwain-cache').then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
