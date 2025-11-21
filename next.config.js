/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  devIndicators: {
    allowedDevOrigins: [
      'https://6000-firebase-studio-1763653384760.cluster-cbeiita7rbe7iuwhvjs5zww2i4.cloudworkstations.dev',
    ],
  },
};

module.exports = nextConfig;
