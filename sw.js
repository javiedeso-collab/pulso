const CACHE = 'pulso-v1';
const NUCLEO = ['./', 'manifest.webmanifest', 'iconos/icon-192.png', 'iconos/icon-512.png'];

self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(NUCLEO)));
  self.skipWaiting();
});

self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys().then(claves => Promise.all(
      claves.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// El dashboard se actualiza cada semana: red primero (para tener siempre lo
// último), y si no hay conexión se sirve la última copia guardada.
self.addEventListener('fetch', ev => {
  if (ev.request.method !== 'GET') return;
  ev.respondWith(
    fetch(ev.request)
      .then(resp => {
        const copia = resp.clone();
        caches.open(CACHE).then(c => c.put(ev.request, copia));
        return resp;
      })
      .catch(() => caches.match(ev.request))
  );
});
