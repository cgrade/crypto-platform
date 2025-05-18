/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  // Force favicon to be served correctly
  webpack: (config) => {
    return config;
  },
  // No external redirects needed
  async redirects() {
    return [];
  },
  // Add custom headers for favicon
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Link',
            value: '/favicon.png; rel=icon',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
