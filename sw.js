// Service Worker for xdilla PWA
const CACHE_NAME = 'xdilla-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    '/joblogo.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching files');
                return cache.addAll(urlsToCache);
            })
    );
    // Force activation
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Take control immediately
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                if (response) {
                    console.log('[SW] Serving from cache:', event.request.url);
                    return response;
                }
                
                console.log('[SW] Fetching from network:', event.request.url);
                return fetch(event.request).catch(() => {
                    // If network fails and no cache, return offline page
                    if (event.request.destination === 'document') {
                        return caches.match('/index.html');
                    }
                });
            })
    );
});

// Handle background sync for when app comes back online
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('[SW] Background sync triggered');
        // Here you could sync data when online
    }
});

// Handle push notifications (if needed in future)
self.addEventListener('push', (event) => {
    console.log('[SW] Push received');
    // Handle push notifications
});
