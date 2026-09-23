// Minimal service worker: exists only to satisfy PWA installability
// criteria and to show a friendly offline page for navigations when the
// network is unreachable. Deliberately does NOT cache API responses,
// Server Actions, or Next.js build assets — this app is auth-gated and
// mostly server-rendered, so stale-while-revalidate caching of app data
// would risk showing another user's cached page or serving a stale build.
const OFFLINE_URL = "/offline.html";
const CACHE_NAME = "agrimitra-shell-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(OFFLINE_URL).then((res) => res ?? Response.error())),
  );
});
