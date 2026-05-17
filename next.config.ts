import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import { env } from "./lib/env";

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${env.API_URL}/:path*`,
      },
    ];
  },
  images: {
    unoptimized: process.env.NEXT_PUBLIC_NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ]
  },
};

export default withNextIntl(nextConfig);
