const readyClients = new Set();
const pendingMessages = new Map();

self.addEventListener("message", (event) => {
  if (event.data === "ready") {
    const client = event.source;
    readyClients.add(client.id);
    const pending = pendingMessages.get(client.id);
    if (pending) {
      client.postMessage(pending);
      pendingMessages.delete(client.id);
    }
  }
});

self.addEventListener("fetch", (event) => {
  const { request, resultingClientId } = event;
  const { pathname } = new URL(request.url);

  if (request.method === "POST" && pathname === "/share") {
    event.respondWith(Response.redirect("/file/upload?share=true")); // important to tackle cannot post url error
    event.waitUntil(
      (async function () {
        const client = await self.clients.get(resultingClientId);
        if (!client) return;

        const form = await request.formData();
        const title = form.get("title")?.toString() ?? "";
        const text = form.get("text")?.toString() ?? "";
        const url = form.get("url")?.toString() ?? "";
        const files = form.getAll("files");

        const payload = { title, text, url, files };
        if (readyClients.has(client.id)) client.postMessage(payload);
        else pendingMessages.set(client.id, payload);
      })(),
    );
  }
});
