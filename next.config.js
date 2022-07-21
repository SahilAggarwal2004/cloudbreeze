/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')

const nextConfig = {
  reactStrictMode: false
}

module.exports = withPWA({
  pwa: {
    dest: 'public',
    swSrc: './sw.js',
    reloadOnOnline: false
  },
  ...nextConfig
})