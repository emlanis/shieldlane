import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Fix Turbopack workspace root detection
  turbopack: {
    root: '/Users/emlanis/Documents/shieldlane',
  },

  // Add CSP headers to allow wallet extensions (Phantom, Solflare, etc.)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://*.helius-rpc.com https://*.solana.com https://*.magicblock.gg https://*.magicblock.app wss://*.solana.com",
              "frame-src 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
