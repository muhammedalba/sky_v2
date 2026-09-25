import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { locales } from "./i18n";
import { env } from "./lib/env";
import { checkUserPermission } from "@/lib/auth";
import { getVerifiedServerUser } from "@/lib/auth.server";
import { isIP } from "node:net";
import {
  clientIpFromChain,
  getTrustedProxies,
  normalizeIp,
} from "@/lib/trusted-proxies";
import { getStoreSettings, DEFAULT_SETTINGS } from "@/shared/api/settings";
import { Permissions } from "@/features/roles/types";
import { User } from "@/types";

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: env.DEFAULT_LOCALE as "en" | "ar",
  localePrefix: "always",
});

// Storefront-only paths the maintenance gate applies to. Admin/auth routes
// guard themselves via <MaintenanceGuard> instead, since login/forgot-password
// must stay reachable during maintenance.
const STORE_PATH_RE =
  /^\/(en|ar)\/(home|products|cart|wishlist|checkout|contact|account|notifications|privacy|terms|request-quote|signup)(\/|$)/;

// Proxy always runs on the Node.js runtime (Next.js 16+), so it shares the
// same Data Cache, Buffer-based JWT decoding, and settings fetch used by the
// server components — no separate Edge-compatible implementation to maintain.
export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)", "/api/v1/:path*"],
};

/**
 * The visitor's IP. Each proxy in front of this server (the local reverse
 * proxy, plus any CDN in TRUSTED_PROXIES) appends its peer to X-Forwarded-For;
 * walking from the right past trusted proxies gives the real client, while
 * client-sent entries further left are ignored.
 */
function getClientIp(request: NextRequest): string {
  const chain = (request.headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  const fromChain = clientIpFromChain(chain, getTrustedProxies());
  if (fromChain) return fromChain;

  // Every hop was a trusted proxy: CDNs that only send a dedicated header
  // (CLIENT_IP_HEADER, e.g. true-client-ip) — trusted only in this case.
  const cdnHeader = process.env.CLIENT_IP_HEADER?.trim();
  const cdnIp = chain.length && cdnHeader ? request.headers.get(cdnHeader) : null;
  if (cdnIp && isIP(normalizeIp(cdnIp))) return normalizeIp(cdnIp);

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Browser calls to /api/v1/* are relayed to the API by the next.config rewrite,
 * so the API only sees this server's IP. Attach the visitor's IP plus the
 * shared internal key so the API rate-limits per visitor. Client-sent values
 * of both headers are always replaced, so they can't be spoofed.
 */
function relayApiRequest(request: NextRequest): NextResponse {
  const headers = new Headers(request.headers);
  headers.delete("x-internal-key");
  headers.delete("x-client-ip");

  const internalKey = process.env.INTERNAL_API_KEY;
  if (internalKey) {
    headers.set("x-internal-key", internalKey);
    headers.set("x-client-ip", getClientIp(request));
  }
  return NextResponse.next({ request: { headers } });
}

async function checkMaintenance(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  if (!STORE_PATH_RE.test(pathname)) return null;

  const settings = (await getStoreSettings()) || DEFAULT_SETTINGS;
  if (settings.maintenanceMode !== true) return null;

  const token = request.cookies.get("access_token")?.value;
  const user = token ? await getVerifiedServerUser(token) : null;
  const canBypassMaintenance = checkUserPermission(user as User, [
    Permissions.UPDATE_SETTINGS,
    Permissions.VIEW_SETTINGS,
    Permissions.ACCESS_DASHBOARD,
  ]);
  if (canBypassMaintenance) return null;

  // Rewrite (not redirect) so the visible URL is unchanged, matching the
  // previous in-place <Maintenance /> rendering behavior.
  const locale = pathname.match(/^\/(en|ar)\//)?.[1] ?? "en";
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}/maintenance`;
  return NextResponse.rewrite(url);
}

// Auth-gated paths, checked here so unauthenticated users get a 307 before
// anything renders. The dashboard layout and account page keep their own
// checks as a second layer — never rely on the proxy alone.
const DASHBOARD_PATH_RE = /^\/(en|ar)\/dashboard(\/|$)/;
const ACCOUNT_PATH_RE = /^\/(en|ar)\/account(\/|$)/;

async function checkAuth(request: NextRequest): Promise<NextResponse | null> {
  const { pathname, search } = request.nextUrl;
  const isDashboard = DASHBOARD_PATH_RE.test(pathname);
  if (!isDashboard && !ACCOUNT_PATH_RE.test(pathname)) return null;

  const locale = pathname.split("/")[1];
  const token = request.cookies.get("access_token")?.value;
  // Accepts expired-but-authentic tokens so the client refresh flow can renew them
  const user = token ? await getVerifiedServerUser(token) : null;

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    // Unprefixed path: LoginForm navigates with the locale-aware router
    url.search = `?redirect=${encodeURIComponent(pathname.slice(locale.length + 1) + search)}`;
    return NextResponse.redirect(url);
  }

  if (isDashboard && !checkUserPermission(user as User, Permissions.ACCESS_DASHBOARD)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/home`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return null;
}

export default async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/v1/")) {
    return relayApiRequest(request);
  }

  const authResponse = await checkAuth(request);
  if (authResponse) return authResponse;

  const maintenanceResponse = await checkMaintenance(request);
  if (maintenanceResponse) return maintenanceResponse;

  return intlMiddleware(request);
}
