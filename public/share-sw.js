self.skipWaiting()

const paths = ['/file/upload', '/p2p']

self.addEventListener('fetch', e => {
    const { request } = e
    const { pathname } = new URL(request.url);
    if (request.method === 'POST') {
        if (!paths.includes(pathname)) return
        e.respondWith(Response.redirect(`${pathname}?share = true`))  // important to tackle cannot post url error
        e.waitUntil(async function () {
            const client = await self.clients.get(e.resultingClientId);
            const data = await e.request.formData();
            const files = data.getAll('files');
            if (files.length) setTimeout(() => client.postMessage({ files }), 1000);
        }());
    }
});