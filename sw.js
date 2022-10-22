/* eslint-disable no-restricted-globals */
import { clientsClaim } from 'workbox-core'
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute, setDefaultHandler } from 'workbox-routing'
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { ExpirationPlugin } from 'workbox-expiration'
import { offlineFallback } from 'workbox-recipes'

clientsClaim() // This should be at the top of the service worker
self.skipWaiting()

const urlsToCache = self.__WB_MANIFEST.concat({ url: '/manifest.json', revision: `${Date.now()}` }).filter(({ url }) => !url.includes('middleware'))
precacheAndRoute(urlsToCache)

setDefaultHandler(new StaleWhileRevalidate())
offlineFallback({ pageFallback: '/_offline' });

registerRoute(({ request }) => request.destination === 'image', new CacheFirst({
    cacheName: 'images',
    plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({ maxAgeSeconds: 30 * 24 * 60 * 60 })
    ]
}))

self.addEventListener('fetch', (event) => {
    const { request } = event
    const url = new URL(request.url);
    if (request.method === 'POST' && url.pathname === '/file/upload' && url.searchParams.has('share')) {
        event.respondWith(Response.redirect('/file/upload')); // important to tackle cannot post '/file/upload' error
        event.waitUntil(async function () {
            const client = await self.clients.get(event.resultingClientId);
            const data = await event.request.formData();
            const files = data.getAll('files');
            if (files.length) setTimeout(() => client.postMessage({ files }), 1000);
        }());
        return;
    }
});