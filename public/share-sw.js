self.skipWaiting()

self.addEventListener('fetch', event => {
    const { request } = event
    const { pathname } = new URL(request.url);
    if (request.method === 'POST' && pathname === '/share') {
        event.respondWith(Response.redirect('/file/upload?share=true'))  // important to tackle cannot post url error
        event.waitUntil(async function () {
            const client = await self.clients.get(event.resultingClientId);
            const data = await event.request.formData();
            const files = data.getAll('files');
            if (files.length) setTimeout(() => client.postMessage({ files }), 500);
        }());
    }
});