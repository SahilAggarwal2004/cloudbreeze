/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')

const nextConfig = {
  reactStrictMode: true,
  fastRefresh: false
}

module.exports = withPWA({
  pwa: { dest: 'public' },
  ...nextConfig
})
