// TRVM service worker — installable PWA + offline devotion reading.
// Strategy:
//  - Devotion pages you've opened are saved to a persistent cache and re-served
//    when you're offline (network-first: fresh when online, cached when not).
//  - Other pages use the same network-first with cache fallback.
//  - API and Supabase calls are never cached (always live).
//  - When fully offline and nothing is cached for a request, show /offline.

const SHELL_CACHE = 'trvm-shell-v2'
const PAGE_CACHE = 'trvm-pages-v2'
const DEVO_CACHE = 'trvm-devotions-v2'   // persistent: read devotions live here

const SHELL = ['/en', '/id', '/sw', '/offline', '/icon-192.png', '/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((c) => c.addAll(SHELL)).catch(() => {}))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  const keep = new Set([SHELL_CACHE, PAGE_CACHE, DEVO_CACHE])
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k))))
  )
  self.clients.claim()
})

function isDevotion(url) {
  // matches /en/devotions/<slug>, /id/devotions/<slug>, /sw/devotions/<slug>
  return /^\/(en|id|sw)\/devotions\/[^/]+$/.test(url.pathname)
}

self.addEventListener('fetch', (event) => {
  const req = event.request
  const url = new URL(req.url)

  if (req.method !== 'GET' || url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api')) return

  const cacheName = isDevotion(url) ? DEVO_CACHE : PAGE_CACHE

  event.respondWith(
    fetch(req)
      .then((res) => {
        // Save a fresh copy of successful navigations/pages.
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone()
          caches.open(cacheName).then((c) => c.put(req, copy)).catch(() => {})
        }
        return res
      })
      .catch(async () => {
        // Offline: try the exact cached page, then any shell, then offline page.
        const hit = await caches.match(req)
        if (hit) return hit
        if (req.mode === 'navigate') {
          return (await caches.match('/offline')) || (await caches.match('/en'))
        }
        return new Response('', { status: 504 })
      })
  )
})
