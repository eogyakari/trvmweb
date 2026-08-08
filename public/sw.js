// TRVM service worker — installable PWA + light offline fallback.
const CACHE = 'trvm-v1'
const OFFLINE_URLS = ['/en', '/id', '/sw', '/icon-192.png', '/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(OFFLINE_URLS)).catch(() => {}))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  const url = new URL(req.url)

  // Only handle same-origin GET navigations/assets. Skip API, Supabase, and
  // anything cross-origin (YouTube, fonts, analytics) — let those go to network.
  if (req.method !== 'GET' || url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api')) return

  // Network-first: always try fresh, fall back to cache when offline.
  event.respondWith(
    fetch(req)
      .then((res) => {
        // cache a copy of successful page/asset responses
        const copy = res.clone()
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {})
        return res
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('/en')))
  )
})
