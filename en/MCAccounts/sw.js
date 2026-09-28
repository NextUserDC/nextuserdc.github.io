const CACHE_NAME = 'mcaccounts-v3';
const STATIC_ASSETS = [
    './',
    './index.html',
    '/MCAccounts/style.css',
    '/MCAccounts/script.js',
    '/MCAccounts/logo.ico'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter(k => k.startsWith('mcaccounts-') && k !== CACHE_NAME)
                    .map(k => caches.delete(k))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    const fetchAndCache = () => fetch(request).then((response) => {
        if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(request, clone));
        }
        return response;
    });

    // Cache-first for the main database (16.9 MB, too expensive to refresh in the background)
    if (url.pathname.includes('db_indexed.json')) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetchAndCache();
            })
        );
        return;
    }

    // Stale-while-revalidate for everything else: serve the cached copy
    // immediately while the network refreshes the cache in the background.
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) {
                fetchAndCache().catch(() => {});
                return cached;
            }
            return fetchAndCache();
        })
    );
});
