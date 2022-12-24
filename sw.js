/* eslint-disable no-restricted-globals */
import { clientsClaim } from 'workbox-core'
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute, setDefaultHandler } from 'workbox-routing'
import { CacheFirst, NetworkFirst, NetworkOnly, StaleWhileRevalidate } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { offlineFallback } from 'workbox-recipes'

clientsClaim() // This should be at the top of the service worker
self.skipWaiting()

const uploadPaths = ['/file/upload', '/p2p']
const filePaths = [...uploadPaths, '/file/download']
const urlsToCache = self.__WB_MANIFEST.filter(({ url }) => !url.includes('middleware') && url !== '/manifest.json')

precacheAndRoute(urlsToCache)
setDefaultHandler(new StaleWhileRevalidate())
offlineFallback({ pageFallback: '/_offline' });

registerRoute(({ url }) => url.pathname === '/manifest.json', new NetworkFirst({
    cacheName: 'manifest',
    plugins: [new CacheableResponsePlugin({ statuses: [200] })]
}))

registerRoute(({ url: { pathname } }) => (pathname.startsWith('/file') || pathname.startsWith('/p2p')) && !filePaths.includes(pathname), new NetworkOnly())

registerRoute(({ request }) => request.destination === 'image', new CacheFirst({
    cacheName: 'images',
    plugins: [new CacheableResponsePlugin({ statuses: [200] })]
}))

self.addEventListener('fetch', event => {
    const { request } = event
    const { pathname, searchParams } = new URL(request.url);
    if (request.method === 'POST' && uploadPaths.includes(pathname) && searchParams.has('share')) {
        event.respondWith(Response.redirect(pathname)); // important to tackle cannot post '/file/upload' error
        event.waitUntil(async function () {
            const client = await self.clients.get(event.resultingClientId);
            const data = await event.request.formData();
            const files = data.getAll('files');
            if (files.length) setTimeout(() => client.postMessage({ files }), 1000);
        }());
    }
});
