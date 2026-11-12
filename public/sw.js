
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)

  if (request.method !== 'GET') return
  if (url.origin !== self.location.origin) return

  const scopePath = new URL(self.registration.scope).pathname

  if (!url.pathname.startsWith(scopePath)) return

  event.respondWith(fetch(request))
})
