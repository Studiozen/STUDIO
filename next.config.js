/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  experimental: {
    // This is the correct way to allow cross-origin requests in development
    // for newer versions of Next.js, which solves the server restart loop.
    allowedDevOrigins: ["https://*.cloudworkstations.dev"],
  },
};

module.exports = nextConfig;
