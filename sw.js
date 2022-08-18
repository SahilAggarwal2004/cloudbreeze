/* eslint-disable no-restricted-globals */
import { clientsClaim } from 'workbox-core'
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute, setDefaultHandler } from 'workbox-routing'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { ExpirationPlugin } from 'workbox-expiration'
import { offlineFallback } from 'workbox-recipes'
import { nanoid } from 'nanoid'

clientsClaim() // This should be at the top of the service worker
self.skipWaiting()

const revision = nanoid()
const urlsToCache = (self.__WB_MANIFEST || []).concat([
    { url: '/', revision },
    { url: '/about', revision },
    { url: '/account', revision },
    { url: '/account/history', revision },
    { url: '/account/signup', revision },
    { url: '/account/login', revision },
    { url: '/account/forgot', revision },
    { url: '/file/upload', revision },
    { url: '/file/download', revision }
])
precacheAndRoute(urlsToCache)

setDefaultHandler(new NetworkFirst())
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
            setTimeout(() => client.postMessage({ files }), 1000);
        }());
        return;
    }
});