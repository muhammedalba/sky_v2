import path from "path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { env } from "./lib/env";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["172.20.10.7"],
  // Pin the workspace root to this app: the parent folder also has a
  // package-lock.json (root "run both client+server" convenience script),
  // which otherwise makes Turbopack infer the wrong root and fail to
  // resolve dependencies like tailwindcss.
  turbopack: {
    root: path.resolve(__dirname),
  },
  experimental: {
    // Retry a page whose prerender fails (e.g. a transient API error) instead
    // of failing the whole build on the first error.
    staticGenerationRetryCount: 2,
  },
  /**
   * Reverse Proxy configuration to resolve Third-Party Cookie restrictions.
   *
   * @description
   * In production, the Next.js frontend and NestJS backend operate on separate domains.
   * To prevent browsers from blocking authentication cookies (`access_token` and `is_logged_in`)
   * as cross-origin third-party cookies, this rewrite rule acts as a reverse proxy:
   * 1. Intercepts incoming client requests matching `/api/v1/*`.
   * 2. Proxies the request server-side to the external NestJS backend (`destination`).
   * 3. Receives the backend response along with `Set-Cookie` headers and forwards them to the client.
   * 4. The browser treats the cookies as First-Party (same-origin), successfully persisting them.
   */
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${env.API_URL}/:path*`,
      },
    ];
  },
  images: {
    unoptimized: process.env.NEXT_PUBLIC_NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
