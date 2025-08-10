// Service Worker for Dr's Palate
// Version: 2.0.0 - Updated 2025-08-10

const CACHE_NAME = 'drspalate-v2';
const OFFLINE_URL = '/offline.html';
// Only include files that actually exist in the project
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo.png',
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
        // Cache each file individually to prevent failing the entire cache if one file is missing
        return Promise.all(
          PRECACHE_URLS.map(url => {
            return cache.add(url).catch(err => {
              console.warn(`[Service Worker] Failed to cache ${url}:`, err);
              // Don't fail the entire installation if a single file fails to cache
              return Promise.resolve();
            });
          })
        );
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
  // Skip non-GET requests and chrome-extension URLs
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Skip cross-origin requests that we don't control
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(OFFLINE_URL, { ignoreSearch: true }))
    );
    return;
  }

  // For all GET requests, try cache first, then network
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true })
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        
        // Otherwise, fetch from network
        return fetch(event.request)
          .then(networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone the response for caching
            const responseToCache = networkResponse.clone();

            // Cache the response for future use
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch(() => {
            // If network fails, handle different types of requests
            if (event.request.destination === 'image') {
              // For images, return a transparent pixel
              return new Response(
                'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
                { headers: { 'Content-Type': 'image/gif' } }
              );
            } else if (event.request.destination === 'font') {
              // For fonts, return a transparent font
              return new Response(
                'AAEAAAASAQAABAAgR0RFRgAAAAEAAAAyHk1MAAAAGgAAAMwAAAAB3RJTUUH5AoKByQJ8i5kFQAAABlJREFUOMtjYBgFo2AUjIJRMApGwSgYBaNgFAwCAEwEAwA1vQH6AAAAAElFTkSuQmCC',
                { headers: { 'Content-Type': 'font/woff2' } }
              );
            } else if (event.request.destination === 'style' || event.request.destination === 'script') {
              // For CSS/JS, return empty responses
              return new Response('', { 
                headers: { 'Content-Type': event.request.destination === 'style' ? 'text/css' : 'application/javascript' } 
              });
            }
            
            // For all other requests, return the offline page
            return caches.match(OFFLINE_URL);
          });
      })
  );
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
