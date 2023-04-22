/** @type {import('next').NextConfig} */

const revision = `${Date.now()}`

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  additionalManifestEntries: [
    { url: '/account', revision },
    { url: '/file/upload', revision },
    { url: '/file/download', revision },
    { url: '/p2p', revision },
    { url: '/account/history?filter=upload', revision },
    { url: '/account/history?filter=download', revision },
    { url: '/account/signup', revision },
    { url: '/account/login', revision },
    { url: '/account/forgot', revision },
    { url: '/_next/image?url=%2Flogo.png&w=96&q=75', revision },
    { url: '/_next/image?url=%2Fimages%2Faccount.webp&w=256&q=100', revision },
    { url: '/_next/image?url=%2Fimages%2Farrow.png&w=64&q=100', revision },
    { url: '/_next/image?url=%2Fimages%2Fcloud.webp&w=256&q=100', revision },
    { url: '/_next/image?url=%2Fimages%2Fp2p.webp&w=256&q=100', revision }
  ],
  runtimeCaching: [
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'CacheFirst',
      options: { cacheName: 'static-font-assets' }
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'CacheFirst',
      options: { cacheName: 'static-image-assets' }
    },
    {
      urlPattern: /\/_next\/image\?url=.+$/i,
      handler: 'CacheFirst',
      options: { cacheName: 'next-image' }
    },
    {
      urlPattern: /\.(?:mp3|wav|ogg)$/i,
      handler: 'CacheFirst',
      options: {
        rangeRequests: true,
        cacheName: 'static-audio-assets'
      }
    },
    {
      urlPattern: /\.(?:mp4)$/i,
      handler: 'CacheFirst',
      options: {
        rangeRequests: true,
        cacheName: 'static-video-assets'
      }
    },
    {
      urlPattern: /\.(?:js)$/i,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'js-assets' }
    },
    {
      urlPattern: /\.(?:css|less)$/i,
      handler: 'CacheFirst',
      options: { cacheName: 'static-style-assets' }
    },
    {
      urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'next-data' }
    },
    {
      urlPattern: /\.(?:json|xml|csv)$/i,
      handler: 'NetworkFirst',
      options: { cacheName: 'static-data-assets' }
    },
    {
      urlPattern: () => true,
      handler: 'NetworkOnly',
      options: { cacheName: 'others' }
    }
  ]
})

const nextConfig = {
  experimental: { nextScriptWorkers: true }
}

module.exports = withPWA(nextConfig)
