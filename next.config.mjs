/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile CommonJS packages
  transpilePackages: ['nerdamer'],

  // Vercel-optimised image handling
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Remove console logs in production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Security headers (also set in vercel.json for CDN layer)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
