// Service Worker for Vasaros Kampelis
// Version 1.0.0

const CACHE_VERSION = 'vasaros-kampelis-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Assets to cache immediately on install
// Note: Hashed JS/CSS in /assets/ are injected at build time by inject-sw-assets.js
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/robots.txt'
];

// Cache size limits
const CACHE_LIMITS = {
  images: 60,
  dynamic: 50
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => (name.startsWith('christmas-shop-') || name.startsWith('vasaros-kampelis-')) && name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== IMAGE_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Chrome extensions and other non-http(s) requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Navigation requests (document): Network First, fallback to cached /index.html for offline SPA
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Bypass XML (sitemaps) - we don't cache them
  if (/\.xml($|\?)/i.test(url.pathname)) {
    return;
  }

  // Handle different types of requests with appropriate strategies
  if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else if (isApiRequest(url)) {
    event.respondWith(handleApiRequest(request));
  } else if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

// Check if request is for an image
function isImageRequest(request) {
  return request.destination === 'image' || 
         /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(request.url);
}

// Check if request is for our /api/ (don't intercept external APIs like googleapis)
function isApiRequest(url) {
  return url.pathname.startsWith('/api/');
}

// Check if request is for a static asset
function isStaticAsset(request) {
  return request.destination === 'script' ||
         request.destination === 'style' ||
         request.destination === 'font' ||
         /\.(js|css|woff|woff2|ttf|otf)$/i.test(request.url);
}

// Handle image requests - Cache First strategy with size limit
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(IMAGE_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Clone the response before caching
      const responseToCache = networkResponse.clone();
      
      // Cache the image and manage cache size
      cache.put(request, responseToCache).then(() => {
        limitCacheSize(IMAGE_CACHE, CACHE_LIMITS.images);
      });
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Image request failed:', error);
    // Return a fallback image or empty response
    return new Response('', { status: 404, statusText: 'Not Found' });
  }
}

// Handle API requests - Network First with timeout
async function handleApiRequest(request) {
  try {
    // Try network first with timeout
    const networkResponse = await fetchWithTimeout(request, 5000);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network request failed, trying cache:', error);
    
    // Fall back to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return error response
    return new Response(
      JSON.stringify({ error: 'Network request failed and no cache available' }),
      { 
        status: 503, 
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static assets - Cache First with network fallback
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      // Return cached version and update cache in background
      fetchAndUpdateCache(request, STATIC_CACHE);
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Static asset request failed:', error);
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('', { status: 404 });
  }
}

// Handle dynamic requests - Network First with cache fallback
async function handleDynamicRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone()).then(() => {
        limitCacheSize(DYNAMIC_CACHE, CACHE_LIMITS.dynamic);
      });
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page or error
    return new Response(
      '<html><body><h1>Offline</h1><p>Please check your internet connection.</p></body></html>',
      { 
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Helper: Fetch with timeout
function fetchWithTimeout(request, timeout) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
}

// Helper: Fetch and update cache in background (clone before caching - response is a stream)
async function fetchAndUpdateCache(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
  } catch (error) {
    // Silently fail - cached version is already being served
  }
}

// Handle navigation requests: Network First, fallback to cached /index.html for offline SPA
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cached = await caches.match('/index.html');
    if (cached) {
      return cached;
    }
    return new Response(
      '<html><body><h1>Offline</h1><p>Patikrinkite interneto ryšį.</p></body></html>',
      { status: 503, statusText: 'Service Unavailable', headers: { 'Content-Type': 'text/html' } }
    );
  }
}

// Helper: Limit cache size
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    // Delete oldest items (FIFO)
    const itemsToDelete = keys.length - maxItems;
    for (let i = 0; i < itemsToDelete; i++) {
      await cache.delete(keys[i]);
    }
  }
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        return self.clients.claim();
      })
    );
  }
});

// Log service worker registration
console.log('[SW] Service Worker loaded');
