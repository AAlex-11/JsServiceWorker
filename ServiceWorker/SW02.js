const CACHE_NAME = 'my-cache-v1';

// Install event: Pre-cache resources
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Opened cache:', CACHE_NAME);
                return cache.addAll([
                    '/',
                    'ServiceWorker.html',
                    'Logo-1.png',
                    'SW03.js',
                    'SW01.js'
                ]);
            })
            .then(() => {
                console.log('[Service Worker] All resources pre-cached successfully');
            })
            .catch(error => {
                console.error('[Service Worker] Failed to pre-cache resources:', error);
            })
    );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
            .then(() => {
                console.log('[Service Worker] Activation complete. Ready to handle fetches.');
            })
    );
});

// Fetch event: Trace requests and serve cached resources
self.addEventListener('fetch', (event) => {
    const url = event.request.url;
    const method = event.request.method;

    // Log the request details
    console.log(`[Service Worker] Fetching: ${method} ${url}`);

    // Try to serve from cache first
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    // Cache hit: Serve from cache
                    console.log(`[Service Worker] Cache hit: ${url}`);
                    return response;
                } else {
                    // Cache miss: Fetch from network
                    console.log(`[Service Worker] Cache miss: ${url}`);
                    return fetch(event.request)
                        .then(networkResponse => {
                            // Cache the new response for future requests
                            return caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, networkResponse.clone());
                                    console.log(`[Service Worker] Cached new resource: ${url}`);
                                    return networkResponse;
                                });
                        })
                        .catch(error => {
                            // Handle fetch errors (e.g., offline fallback)
                            console.error(`[Service Worker] Fetch error for ${url}:`, error);
                            return new Response('Offline fallback page', {
                                headers: { 'Content-Type': 'text/plain' }
                            });
                        });
                }
            })
    );
});