// ============================================================
// AAYURAURA PWA SERVICE WORKER
// Version: aayuraura-pwa-v1.0.0
// ============================================================

const CACHE_NAME = "aayuraura-pwa-v1";
const OFFLINE_URL = "/offline";

// Essential core assets to precache on install
const PRECACHE_ASSETS = [
  "/",
  "/offline",
  "/student/offline",
  "/manifest.json",
  "/logo.png",
  "/logo-emblem.png",
  "/favicon.ico"
];

// 1. Install event: Pre-cache core shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("[Aayuraura PWA] Precache warning:", err);
      });
    })
  );
  self.skipWaiting();
});

// 2. Activate event: Clean up legacy caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Aayuraura PWA] Removing outdated cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch event: Network-first for HTML pages, Stale-while-revalidate for assets
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // A. Bypass non-GET requests immediately
  if (request.method !== "GET") {
    return;
  }

  // B. Bypass backend API routes, AI streaming, and external auth to prevent stale tokens or broken streams
  if (url.pathname.startsWith("/api/") || url.pathname.includes("/v1/")) {
    return;
  }

  // C. HTML Navigation Requests (Network-first with offline fallback)
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Check if requested page is in cache
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fall back to offline page
          const offlinePage = await caches.match(OFFLINE_URL);
          if (offlinePage) {
            return offlinePage;
          }
          return new Response(
            `<!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Aayuraura — Offline</title>
              <style>
                body { font-family: system-ui, sans-serif; background: #0D1511; color: #F1F6F2; padding: 2rem; text-align: center; }
                .card { max-width: 420px; margin: 3rem auto; background: #17211B; border: 1px solid #304036; border-radius: 16px; padding: 2rem; }
                h1 { color: #D49B4B; font-size: 1.5rem; }
                p { color: #A9B9AE; font-size: 0.9rem; line-height: 1.5; }
                a { display: inline-block; margin-top: 1rem; padding: 0.75rem 1.5rem; background: #2F6B4F; color: white; border-radius: 8px; text-decoration: none; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>⚡ Offline Learning Active</h1>
                <p>You are currently disconnected from the internet. You can still access all your saved clinical notes, NCISM classical shlokas, and flashcards in the Offline Hub.</p>
                <a href="/student/offline">Open Offline Learning Hub</a>
              </div>
            </body>
            </html>`,
            { headers: { "Content-Type": "text/html" } }
          );
        })
    );
    return;
  }

  // D. Static Assets (Images, Icons, Fonts, Stylesheets, JS) — Stale-While-Revalidate
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot|ico|css|js)$/);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }
});
