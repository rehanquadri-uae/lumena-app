/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // removes "X-Powered-By: Next.js"
  images: {
    domains: [], // add domains here if you fetch images externally
  },

};

module.exports = nextConfig;
