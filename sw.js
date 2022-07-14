/* eslint-disable no-restricted-globals */
import { clientsClaim } from 'workbox-core'
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { ExpirationPlugin } from 'workbox-expiration'

clientsClaim() // This should be at the top of the service worker
self.skipWaiting()

precacheAndRoute(self.__WB_MANIFEST)

registerRoute(({ url }) => url.pathname.includes('/file'), new CacheFirst({
    cacheName: 'files',
    plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({ maxAgeSeconds: 10 * 60 })
    ]
}))

// Accepting files
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    if (event.request.method === 'POST' && url.pathname === '/' && url.searchParams.has('share-target')) {
        event.respondWith(Response.redirect('/?receiving-file-share=1'));

        event.waitUntil(async function () {
            const client = await self.clients.get(event.resultingClientId);
            const data = await event.request.formData();
            const files = data.get('files');
            client.postMessage({ files });
        }());
        return;
    }

});