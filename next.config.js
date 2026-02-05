/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disabled to prevent double render of MapContainer
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb'
    }
  }
};

module.exports = nextConfig;
