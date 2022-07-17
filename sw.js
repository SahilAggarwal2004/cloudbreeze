/* eslint-disable no-restricted-globals */
import { clientsClaim } from 'workbox-core'
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute, setDefaultHandler } from 'workbox-routing'
import { CacheFirst, NetworkOnly } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { ExpirationPlugin } from 'workbox-expiration'
import { offlineFallback } from 'workbox-recipes'

clientsClaim() // This should be at the top of the service worker
self.skipWaiting()

precacheAndRoute(self.__WB_MANIFEST)

setDefaultHandler(new NetworkOnly())
offlineFallback({ pageFallback: '/_offline' });

registerRoute(({ request }) => request.destination === 'image', new CacheFirst({
    cacheName: 'images',
    plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({ maxAgeSeconds: 30 * 24 * 60 * 60 })
    ]
}))

registerRoute(({ url }) => url.pathname.startsWith('/file'), new CacheFirst({
    cacheName: 'files',
    plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({ maxAgeSeconds: 15 * 60 })
    ]
}))

self.addEventListener('fetch', (event) => {
    const { request } = event
    const url = new URL(request.url);
    if (request.method === 'POST' && url.pathname === '/' && url.searchParams.has('share')) {
        event.respondWith(Response.redirect('/')); // important to tackle cannot post '/' error
        event.waitUntil(async function () {
            const client = await self.clients.get(event.resultingClientId);
            const data = await event.request.formData();
            const files = data.getAll('files');
            setTimeout(() => client.postMessage({ files }), 1000);
        }());
        return;
    }
});