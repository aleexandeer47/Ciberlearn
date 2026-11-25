// Service worker de Unhooked (los nombres de caché conservan el prefijo anterior a propósito).
// - Sin conexión: muestra /offline.html (un solo archivo con sus estilos dentro, para que siempre se vea bien).
// - Archivos estáticos de Next (/_next/static, nombres con hash): se guardan para cargar más rápido.
// - Nunca guarda páginas con datos de la persona, ni respuestas de la API o de formularios.
// - Notificaciones: muestra el recordatorio diario y al tocarlo abre la estafa del día.

const VERSION = "v3";
const STATIC = `ciberlearn-static-${VERSION}`;
const PAGES = `ciberlearn-pages-${VERSION}`;
const OFFLINE = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(PAGES).then((c) => c.add(new Request(OFFLINE, { cache: "reload" }))));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => ![STATIC, PAGES].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Navegación: siempre a la red; si no hay conexión, la página sin conexión
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => caches.match(OFFLINE)));
    return;
  }

  // Estáticos con hash: primero la copia guardada
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(STATIC).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      }),
    );
  }
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {}
  const title = data.title || "Unhooked";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/app-icon?size=192",
      badge: "/app-icon?size=192",
      tag: "diaria",
      data: { url: data.url || "/diaria" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/diaria";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      const open = list.find((c) => new URL(c.url).origin === self.location.origin);
      if (open) return open.navigate(url).then((c) => c && c.focus());
      return self.clients.openWindow(url);
    }),
  );
});
