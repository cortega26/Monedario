// Monedario service worker — Stale-While-Revalidate for pages, Cache First for assets.
const CACHE = "monedario-v1";
const ASSETS_CACHE = "monedario-assets-v1";
const MAX_PAGES = 50;

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  const activeCaches = [CACHE, ASSETS_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !activeCaches.includes(k))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isStaticAsset(url) {
  const { pathname } = url;
  return (
    pathname.startsWith("/_astro/") ||
    pathname.startsWith("/fonts/") ||
    pathname.startsWith("/images/") ||
    pathname === "/favicon.svg"
  );
}

function isNavigation(request) {
  return (
    request.mode === "navigate" ||
    (request.method === "GET" &&
      /text\/html/.test(request.headers.get("Accept") ?? ""))
  );
}

function shouldSkip(url) {
  return (
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/dev/") ||
    url.pathname.startsWith("/pagefind/")
  );
}

function prune(cache, max) {
  cache.keys().then((keys) => {
    if (keys.length <= max) return;
    const oldest = keys.slice(0, keys.length - max);
    Promise.all(oldest.map((r) => cache.delete(r)));
  });
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || shouldSkip(url)) return;

  // Static assets: Cache First (they have hashes in filenames)
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(ASSETS_CACHE).then((cache) =>
        cache.match(request).then((hit) => {
          if (hit) return hit;
          return fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          });
        }),
      ),
    );
    return;
  }

  // HTML pages: Stale-While-Revalidate
  if (isNavigation(request)) {
    event.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match(request).then((hit) => {
          const revalidate = fetch(request)
            .then((response) => {
              if (response.ok) {
                cache.put(request, response.clone());
                prune(cache, MAX_PAGES);
              }
              return response;
            })
            .catch(() => {}); // offline — the cached response was already returned

          return hit ?? revalidate;
        }),
      ),
    );
    return;
  }

  // Everything else (analytics, pagefind…): Network Only, no intervention needed
});
