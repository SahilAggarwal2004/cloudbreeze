/** @type {import('next').NextConfig} */

const pages = ['/', '/account/forgot', '/account/history', '/account/history?filter=upload', '/account/history?filter=transfer', '/account/history?filter=download', '/account/login', '/account/signup', '/file/upload', '/file/download', '/p2p']
const images = ['/images/account.webp', '/images/cloud.webp', '/images/arrow.png', '/images/p2p.webp']
const revision = `${Date.now()}`

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  cacheStartUrl: false,
  reloadOnOnline: false,
  importScripts: ['/share-sw.js'],
  additionalManifestEntries: pages.concat(images).map(url => ({ url, revision })),
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
