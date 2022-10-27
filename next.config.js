/** @type {import('next').NextConfig} */

const withWorkbox = require('next-with-workbox')

const nextConfig = { experimental: { nextScriptWorkers: true } }

module.exports = withWorkbox({
  workbox: {
    dest: 'public',
    swSrc: './sw.js'
  },
  ...nextConfig
})