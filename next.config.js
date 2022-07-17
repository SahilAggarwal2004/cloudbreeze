/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')

const nextConfig = {
  reactStrictMode: true
}

module.exports = withPWA({
  pwa: {
    dest: 'public',
    swSrc: './sw.js'
  },
  ...nextConfig
})