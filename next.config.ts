import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Dev-only: allow the machine's LAN hostname(s) so that opening the dev
  // server from another device (or via the LAN IP) does not get HMR resources
  // blocked — a blocked HMR socket can leave the page unhydrated, which makes
  // client-side form handlers (e.g. signup) silently dead. This only affects
  // `next dev`; production builds are unaffected.
  allowedDevOrigins: ['10.229.109.167'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      {
        protocol: 'https',
        hostname: 'rzzpejmibyzununnuhck.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
