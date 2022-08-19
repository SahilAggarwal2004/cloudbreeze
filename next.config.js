/** @type {import('next').NextConfig} */

const withWorkbox = require('next-with-workbox')

const nextConfig = {}

module.exports = withWorkbox({
  workbox: {
    dest: 'public',
    swSrc: './sw.js'
  },
  ...nextConfig
})