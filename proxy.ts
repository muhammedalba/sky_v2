import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { locales } from "./i18n";
import { env } from "./lib/env";
import { checkUserPermission, getServerUserFromToken } from "@/lib/auth";
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
  /^\/(en|ar)\/(home|products|cart|checkout|contact|account|notifications|privacy|terms|request-quote)(\/|$)/;

// Proxy always runs on the Node.js runtime (Next.js 16+), so it shares the
// same Data Cache, Buffer-based JWT decoding, and settings fetch used by the
// server components — no separate Edge-compatible implementation to maintain.
export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

async function checkMaintenance(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  if (!STORE_PATH_RE.test(pathname)) return null;

  const settings = (await getStoreSettings()) || DEFAULT_SETTINGS;
  if (settings.maintenanceMode !== true) return null;

  const token = request.cookies.get("access_token")?.value;
  const user = token ? getServerUserFromToken(token) : null;
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

export default async function proxy(request: NextRequest) {
  const maintenanceResponse = await checkMaintenance(request);
  if (maintenanceResponse) return maintenanceResponse;

  return intlMiddleware(request);
}
