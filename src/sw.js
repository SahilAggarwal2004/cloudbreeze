import { CacheFirst, ExpirationPlugin, NetworkFirst, NetworkOnly, RangeRequestsPlugin, Serwist, StaleWhileRevalidate } from "serwist";

const matcher = ({ request }) => request.destination === "document";

const serwist = new Serwist({
  skipWaiting: true,
  clientsClaim: true,
  importScripts: ["/share-sw.js"],
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: { cleanupOutdatedCaches: true, ignoreURLParametersMatching: [/.*/] },
  fallbacks: { entries: [{ url: "/_offline", matcher }] },
  runtimeCaching: [
    {
      matcher: ({ url }) => url.pathname === "/manifest.json",
      handler: new CacheFirst({
        cacheName: "manifest",
        plugins: [new ExpirationPlugin({ maxAgeSeconds: 60 })],
      }),
    },
    {
      matcher,
      handler: new NetworkOnly(),
    },
    {
      matcher: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: new CacheFirst({ cacheName: "static-font-assets" }),
    },
    {
      matcher: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: new CacheFirst({ cacheName: "static-image-assets" }),
    },
    {
      matcher: /\/_next\/image\?url=.+$/i,
      handler: new CacheFirst({ cacheName: "next-image" }),
    },
    {
      matcher: /\.(?:mp3|wav|ogg)$/i,
      handler: new CacheFirst({ cacheName: "static-audio-assets", plugins: [new RangeRequestsPlugin()] }),
    },
    {
      matcher: /\.(?:mp4)$/i,
      handler: new CacheFirst({ cacheName: "static-video-assets", plugins: [new RangeRequestsPlugin()] }),
    },
    {
      matcher: /\.(?:js)$/i,
      handler: new StaleWhileRevalidate({ cacheName: "js-assets" }),
    },
    {
      matcher: /\.(?:css|less)$/i,
      handler: new CacheFirst({ cacheName: "static-style-assets" }),
    },
    {
      matcher: /\/_next\/data\/.+\/.+\.json$/i,
      handler: new StaleWhileRevalidate({ cacheName: "next-data" }),
    },
    {
      matcher: /\.(?:json|xml|csv)$/i,
      handler: new NetworkFirst({ cacheName: "static-data-assets" }),
    },
  ],
});

serwist.addEventListeners();
