/* eslint-disable no-restricted-globals */
import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute, setDefaultHandler } from 'workbox-routing'
import { CacheFirst, NetworkFirst, NetworkOnly } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { offlineFallback } from 'workbox-recipes'
import { nanoid } from 'nanoid'

skipWaiting() // breaking the order, following next-pwa's order
clientsClaim() // This should be at the top of the service worker

const revision = nanoid();
const urlsToCache = self.__WB_MANIFEST.concat([
    { url: '/', revision },
    { url: '/account', revision },
    { url: '/account/signup', revision },
    { url: '/account/login', revision },
    { url: '/account/forgot', revision },
    { url: '/account/history', revision },
    { url: '/file/upload', revision },
    { url: '/file/download', revision },
    { url: '/about', revision }
]).filter(({ url }) => !url.includes('middleware') && url !== '/manifest.json')
precacheAndRoute(urlsToCache)
cleanupOutdatedCaches()

setDefaultHandler(new CacheFirst())
offlineFallback({ pageFallback: '/_offline' });

registerRoute(({ url }) => url.pathname === '/manifest.json', new NetworkFirst({
    cacheName: 'manifest',
    plugins: [new CacheableResponsePlugin({ statuses: [200] })]
}))

registerRoute(({ url }) => url.pathname.startsWith('/file'), new NetworkOnly())

registerRoute(({ request }) => request.destination === 'image', new CacheFirst({
    cacheName: 'images',
    plugins: [new CacheableResponsePlugin({ statuses: [200] })]
}))

self.addEventListener('fetch', event => {
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
    }
});