/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    allowedDevOrigins: ["https://*.cloudworkstations.dev"],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      }
    ],
  },
};

module.exports = nextConfig;
