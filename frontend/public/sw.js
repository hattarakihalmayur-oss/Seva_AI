/**
 * BharatSeva AI — Service Worker
 *
 * Strategy: Network-first for API calls, Cache-first for static assets.
 * Provides offline support and improved performance for returning visitors.
 */

const CACHE_NAME = 'bharatseva-v1.0.0';
const STATIC_ASSETS_CACHE = 'bharatseva-static-v1.0.0';

// Assets to pre-cache on installation (app shell)
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
];

// ──────────────────────────────────────────────────────────────────────────────
// INSTALL: Pre-cache app shell
// ──────────────────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_ASSETS_CACHE).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  // Skip waiting so new service worker activates immediately
  self.skipWaiting();
});

// ──────────────────────────────────────────────────────────────────────────────
// ACTIVATE: Clean up old caches
// ──────────────────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== STATIC_ASSETS_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// ──────────────────────────────────────────────────────────────────────────────
// FETCH: Routing strategy
// ──────────────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API calls (network-only — never serve stale government data)
  if (url.pathname.startsWith('/api')) return;

  // Skip cross-origin requests (Google Fonts etc — let browser handle)
  if (url.origin !== self.location.origin) return;

  // For navigation requests (HTML pages) — network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful HTML responses
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => {
          // Offline fallback — serve cached index.html (SPA shell)
          return caches.match('/index.html');
        })
    );
    return;
  }

  // For static assets (JS, CSS, images, fonts) — cache-first
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).then((networkResponse) => {
        // Only cache successful responses
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(STATIC_ASSETS_CACHE).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      });
    })
  );
});
