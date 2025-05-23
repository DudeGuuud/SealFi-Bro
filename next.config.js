/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  webpack: (config) => {
    // Handle Phaser.js
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    // Ignore node modules that might cause issues
    config.externals = config.externals || [];
    
    return config;
  },
  experimental: {
    esmExternals: false,
  },
}

module.exports = nextConfig
