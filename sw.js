const CACHE_NAME = "cctv-shell-v1";
const OFFLINE_URL = "/offline.html";
const APP_SHELL = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/pages/login.html",
  "/pages/dashboard.html",
  "/pages/pekerjaan.html",
  "/pages/pekerjaan-form.html",
  "/pages/pekerjaan-detail.html",
  "/pages/approval.html",
  "/pages/approval-detail.html",
  "/pages/berita-acara.html",
  "/pages/berita-acara-detail.html",
  "/pages/laporan.html",
  "/pages/divisi.html",
  "/pages/personel.html",
  "/pages/kendaraan.html",
  "/pages/tools.html",
  "/assets/css/app.css",
  "/assets/js/app.js",
  "/assets/js/auth.js",
  "/assets/js/dashboard.js",
  "/assets/js/pekerjaan.js",
  "/assets/js/approval.js",
  "/assets/js/berita-acara.js",
  "/assets/js/laporan.js",
  "/assets/js/monitoring-template.js",
  "/data/cameras.js",
  "/data/users.js",
  "/data/divisi.js",
  "/data/berita-acara.js",
  "/data/pekerjaan.js",
  "/assets/icons/cctv-icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(OFFLINE_URL) || caches.match("/pages/login.html") || caches.match("/index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === "opaque") {
            return response;
          }

          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(OFFLINE_URL));
    })
  );
});
