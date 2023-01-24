/* eslint-disable no-restricted-globals */
import { clientsClaim } from 'workbox-core'
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute, setDefaultHandler } from 'workbox-routing'
import { CacheFirst, NetworkFirst, NetworkOnly, StaleWhileRevalidate } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { offlineFallback } from 'workbox-recipes'
import { pages } from '../constants'

clientsClaim() // This should be at the top of the service worker
self.skipWaiting()

const urlsToCache = self.__WB_MANIFEST.filter(({ url }) => !(url.startsWith('/_next/server') || url.startsWith('/icons') || url === '/manifest.json'))

precacheAndRoute(urlsToCache)
setDefaultHandler(new StaleWhileRevalidate())
offlineFallback({ pageFallback: '/_offline' });

registerRoute(({ url: { pathname } }) => (pathname.startsWith('/file') || pathname.startsWith('/p2p')) && !pages.includes(pathname), new NetworkOnly())

registerRoute(({ url }) => url.pathname === '/manifest.json', new NetworkFirst({
    cacheName: 'manifest',
    plugins: [new CacheableResponsePlugin({ statuses: [200] })]
}))

registerRoute(({ request }) => request.destination === 'image', new CacheFirst({
    cacheName: 'images',
    plugins: [new CacheableResponsePlugin({ statuses: [200] })]
}))

self.addEventListener('fetch', event => {
    const { request } = event
    const { pathname, searchParams } = new URL(request.url);
    if (request.method === 'POST' && pathname === '/file' && searchParams.has('share')) {
        event.respondWith(Response.redirect('/file/upload?share=true'))  // important to tackle cannot post url error
        event.waitUntil(async function () {
            const client = await self.clients.get(event.resultingClientId);
            const data = await event.request.formData();
            const files = data.getAll('files');
            if (files.length) setTimeout(() => client.postMessage({ files }), 500);
        }());
    }
});
