self.skipWaiting()

self.addEventListener('fetch', e => {
    const { request } = e
    const { pathname } = new URL(request.url);
    if (request.method === 'POST' && pathname === '/share') {
        e.respondWith(Response.redirect('/file/upload?share=true'))  // important to tackle cannot post url error
        e.waitUntil(async function () {
            const client = await self.clients.get(e.resultingClientId);
            const data = await e.request.formData();
            const files = data.getAll('files');
            if (files.length) setTimeout(() => client.postMessage({ files }), 1000);
        }());
    }
});