/* eslint-disable no-restricted-globals */
import { clientsClaim } from 'workbox-core'
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute, setDefaultHandler } from 'workbox-routing'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { ExpirationPlugin } from 'workbox-expiration'

clientsClaim() // This should be at the top of the service worker
self.skipWaiting()

setDefaultHandler(new NetworkFirst())

precacheAndRoute(self.__WB_MANIFEST)

registerRoute(({ url }) => url.pathname.includes('/file'), new CacheFirst({
    cacheName: 'files',
    plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({ maxAgeSeconds: 10 * 60 })
    ]
}))