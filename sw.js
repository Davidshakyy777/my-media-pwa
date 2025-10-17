const CACHE_NAME = 'media-pwa-v1';
const OFFLINE_URL = 'offline.html';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
  // үлкен медиаларды мұнда қоспаңыз, не қосқыңыз келсе жолдарды қосыңыз
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => {
        if (k !== CACHE_NAME) return caches.delete(k);
      }))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;

  // navigation -> offline fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // media (audio/video) -> cache-first (allows offline playback if cached)
  if (req.destination === 'audio' || req.destination === 'video') {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(networkRes => {
          // dynamically cache media responses if wanted
          return caches.open(CACHE_NAME).then(cache => {
            try { cache.put(req, networkRes.clone()); } catch(e) { /* ignore LARGER-than-cache errors */ }
            return networkRes;
          });
        }).catch(()=> new Response('',{status:503, statusText:'Offline'}));
      })
    );
    return;
  }

  // default network-first, fallback to cache
  event.respondWith(
    fetch(req).then(res => {
      return caches.open(CACHE_NAME).then(cache => {
        cache.put(req, res.clone());
        return res;
      });
    }).catch(() => caches.match(req))
  );
});
