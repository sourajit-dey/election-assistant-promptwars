/**
 * @file sw.js
 * @description Service Worker for VoteGuide India.
 *              Implements cache-first strategy for static assets
 *              and network-first for HTML documents.
 *              Enables offline capability and PWA installation.
 * @author VoteGuide India
 * @version 1.0.0
 */

const CACHE_NAME = 'voteguide-v2';

/** All static assets to pre-cache on install */
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/components.css',
  '/css/animations.css',
  '/js/utils.js',
  '/js/analytics.js',
  '/js/firebase.js',
  '/js/charts.js',
  '/js/data.js',
  '/js/timeline.js',
  '/js/eligibility.js',
  '/js/glossary.js',
  '/js/main.js',
  '/js/chatbot.js',
  '/js/tests.js',
  '/assets/chakra.svg'
];

/**
 * @description Install event — pre-caches all static assets
 * @param {ExtendableEvent} event - Service worker install event
 * @returns {void}
 */
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

/**
 * @description Activate event — removes outdated cache versions
 * @param {ExtendableEvent} event - Service worker activate event
 * @returns {void}
 */
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then(function(cacheNames) {
        return Promise.all(
          cacheNames
            .filter(function(name) { return name !== CACHE_NAME; })
            .map(function(name) { return caches.delete(name); })
        );
      })
      .then(function() { return self.clients.claim(); })
  );
});

/**
 * @description Fetch event — serves cached content when possible.
 *              HTML: network-first (always get fresh content).
 *              Assets: cache-first (fast loads from cache).
 *              External APIs: always network (never cache).
 * @param {FetchEvent} event - The fetch event
 * @returns {void}
 */
self.addEventListener('fetch', function(event) {
  const url = new URL(event.request.url);

  /* Only handle GET requests */
  if (event.request.method !== 'GET') return;

  /* Never intercept external API calls */
  if (url.origin !== self.location.origin) return;

  /* HTML — network first, fallback to cache */
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then(function(response) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(function() {
          return caches.match('/index.html');
        })
    );
    return;
  }

  /* Static assets — cache first, fallback to network */
  event.respondWith(
    caches.match(event.request)
      .then(function(cached) {
        if (cached) return cached;
        return fetch(event.request)
          .then(function(response) {
            if (!response || response.status !== 200) {
              return response;
            }
            const clone = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, clone);
            });
            return response;
          });
      })
  );
});
