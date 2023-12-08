import withSerwistInit from "@serwist/next";

const pages = ['/', '/account', '/account/forgot', '/account/history', '/account/login', '/account/signup', '/file/upload', '/file/download', '/p2p']
const images = ['account.webp', 'upload.webp', 'download.webp', 'p2p.webp', 'arrow.png', 'logo.webp'].map(image => `/images/${image}`)
const revision = `${Date.now()}`

const withSerwist = withSerwistInit({
  swSrc: 'src/sw.js',
  swDest: 'public/sw.js',
  exclude: [/public\/sw.js/],
  disable: process.env.NODE_ENV === 'development',
  reloadOnOnline: false,
  additionalPrecacheEntries: pages.concat(images).map(url => ({ url, revision }))
  // fallbacks
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    nextScriptWorkers: true,
    optimizePackageImports: ['']
  }
}

export default withSerwist(nextConfig)