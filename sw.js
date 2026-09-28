const CACHE_NAME = "cctv-shell-v17";
const APP_ROOT = new URL("./", self.location.href);
const OFFLINE_URL = new URL("offline.html", APP_ROOT).toString();
const LOGIN_URL = new URL("pages/login.html", APP_ROOT).toString();
const INDEX_URL = new URL("index.html", APP_ROOT).toString();
const APP_SHELL = [
  "",
  "index.html",
  "offline.html",
  "manifest.json",
  "pages/login.html",
  "pages/dashboard/dashboard.html",
  "pages/pekerjaan/pekerjaan.html",
  "pages/pekerjaan/pekerjaan-form.html",
  "pages/pekerjaan/pekerjaan-detail.html",
  "pages/berita-acara/berita-acara.html",
  "pages/berita-acara/berita-acara-detail.html",
  "pages/laporan/laporan.html",
  "pages/master/divisi.html",
  "pages/master/personel.html",
  "pages/master/kendaraan.html",
  "assets/css/app.css",
  "assets/js/core/app.js",
  "assets/js/core/storage.js",
  "assets/js/core/auth.js",
  "assets/js/modules/dashboard/dashboard.js",
  "assets/js/modules/pekerjaan/pekerjaan.js",
  "assets/js/modules/berita-acara/berita-acara.js?v=4",
  "assets/js/modules/laporan/laporan.js",
  "assets/js/modules/master/master.js",
  "data/users.js",
  "data/divisi.js",
  "data/berita-acara.js",
  "data/pekerjaan.js",
  "data/cameras.js",
  "assets/icons/cctv-icon.svg"
].map((path) => new URL(path, APP_ROOT).toString());

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
        .catch(async () =>
          (await caches.match(OFFLINE_URL)) ||
          (await caches.match(LOGIN_URL)) ||
          caches.match(INDEX_URL)
        )
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
