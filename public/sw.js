// God's Eye View - Personal Edition Service Worker
const CACHE_NAME = 'gev-personal-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/logo.svg',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  // Skip API calls and tile requests
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('cesium') ||
      event.request.url.includes('google') ||
      event.request.url.includes('esri')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
