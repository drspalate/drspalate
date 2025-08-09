// Service Worker for Dr's Palate
// Version: 1.0.0

const CACHE_NAME = 'drspalate-v1';
const OFFLINE_URL = '/offline.html';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/safari-pinned-tab.svg',
  // Fonts
  '/fonts/poppins-v20-latin-regular.woff2',
  '/fonts/open-sans-v34-latin-regular.woff2',
  // Critical CSS and JS
  '/styles/global.css',
  '/styles/critical.css',
  '/scripts/main.js',
  // Images
  '/images/logo.svg',
  '/images/hero-bg-400.jpg',
  '/images/hero-bg-800.jpg',
  '/images/hero-bg-1200.jpg',
  '/images/hero-bg-1600.jpg',
  '/images/og-image.jpg',
  '/images/twitter-card.jpg',
  // Fallback pages
  OFFLINE_URL
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, falling back to network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle navigation requests with network-first strategy
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response to cache it
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseToCache));
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request)
            .then(response => {
              // If not in cache, show offline page
              if (!response) {
                return caches.match(OFFLINE_URL);
              }
              return response;
            });
        })
    );
  } else {
    // For other requests, use cache-first strategy
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Return cached response if found
          if (response) {
            return response;
          }
          // Otherwise, fetch from network and cache the response
          return fetch(event.request)
            .then(response => {
              // Check if we received a valid response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              // Clone the response to cache it
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseToCache));
              return response;
            });
        })
    );
  }
});

// Handle background sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-form-data') {
    console.log('[Service Worker] Background sync for form data');
    // TODO: Implement background sync for form submissions
  }
});

// Handle push notifications
self.addEventListener('push', event => {
  console.log('[Service Worker] Push received');
  
  const title = 'Dr\'s Palate';
  const options = {
    body: event.data?.text() || 'New update from Dr\'s Palate',
    icon: '/images/icon-192x192.png',
    badge: '/images/badge-72x72.png'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification click received');
  
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(clientList => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});
