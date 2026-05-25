import { getMessages, setRequestLocale } from "next-intl/server";
import { ReactNode } from "react";
import { locales } from "@/i18n";
import { notFound } from "next/navigation";
import Script from "next/script";
import LocaleProvider from "./LocaleProvider";
import ThemeProvider from "@/app/providers/ThemeProvider";
import ToastProvider from "@/shared/ui/toast/ToastProvider";
import SettingsProvider from "@/app/providers/SettingsProvider";
import "../globals.css";
import { cookies } from "next/headers";
import { getServerUserFromToken, checkUserPermission } from "@/lib/auth";
import { User } from "@/types";
import { getStoreSettings, DEFAULT_SETTINGS } from "@/shared/api/settings";
import { Permissions } from "@/features/roles/types";
import MaintenanceGuard from "@/components/MaintenanceGuard";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import CartDrawer from "@/features/cart/components/CartDrawer";

/**
 * Enterprise SEO Engine
 * Dynamic Metadata Generation based on active locale and global settings
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const settings = (await getStoreSettings()) || DEFAULT_SETTINGS;

  const title =
    settings.metaTitle?.[locale as "ar" | "en"] ||
    settings.siteName?.[locale as "ar" | "en"] ||
    "Sky Galaxy";
  const description =
    settings.metaDescription?.[locale as "ar" | "en"] ||
    settings.siteDescription?.[locale as "ar" | "en"] ||
    "";

  return {
    title: {
      template: `%s | ${title}`,
      default: title,
    },
    description,
    icons: {
      icon: settings.favicon || "/favicon.ico",
      shortcut: settings.favicon || "/favicon.ico",
      apple: settings.favicon || "/apple-touch-icon.png",
    },
    openGraph: {
      title,
      description,
      siteName: title,
      images: settings.logo ? [settings.logo] : [],
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params: paramsPromise,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const params = await paramsPromise;
  const { locale } = params;

  // Validate locale
  if (!locales.includes(locale as "ar" | "en")) {
    notFound();
  }

  // Optimize next-intl rendering & enable static deduplication
  setRequestLocale(locale);

  const cookieStore = await cookies();
  const [allMessages, settings] = await Promise.all([
    getMessages(),
    getStoreSettings(),
  ]);

  // Pick only root/essential namespaces to send to the root provider (reduces initial client payload)
  const rootMessages = {
    common: allMessages.common,
    auth: allMessages.auth,
    buttons: allMessages.buttons,
    errors: allMessages.errors,
    navigation: allMessages.navigation,
    messages: allMessages.messages,
    maintenance: allMessages.maintenance,
    notifications: allMessages.notifications,
    cart: allMessages.cart,
  };

  // Use fallback settings if API fails
  const finalSettings = settings || DEFAULT_SETTINGS;

  const token = cookieStore.get("access_token")?.value;
  const user = token ? getServerUserFromToken(token) : null;
  const canBypassMaintenance = checkUserPermission(user as User, [
    Permissions.UPDATE_SETTINGS,
    Permissions.VIEW_SETTINGS,
    Permissions.ACCESS_DASHBOARD,
  ]);

  const isMaintenance = finalSettings.maintenanceMode === true;

  // 1. Structured Data Configuration
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: finalSettings.siteName?.[locale as "ar" | "en"] || "SkyGalaxy",
    image: finalSettings.logo || "",
    description: finalSettings.siteDescription?.[locale as "ar" | "en"] || "",
  };

  return (
    <LocaleProvider locale={locale} messages={rootMessages}>
      <ThemeProvider>
        <SettingsProvider settings={finalSettings}>
          <MaintenanceGuard
            isMaintenance={isMaintenance}
            canBypassMaintenance={canBypassMaintenance}
            locale={locale}
          >
            {finalSettings.googleAnalyticsId && (
              <>
                <Script
                  src={`https://www.googletagmanager.com/gtag/js?id=${finalSettings.googleAnalyticsId}`}
                  strategy="afterInteractive"
                />
                <Script id="google-analytics" strategy="afterInteractive">
                  {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${finalSettings.googleAnalyticsId}');
                  `}
                </Script>
              </>
            )}

            <ToastProvider />

            {/* Performance Monitoring */}
            <PerformanceMonitor debugMode={finalSettings.debugMode ?? false} />
            {children}
            <CartDrawer />
            {/* JSON-LD Structured Data for SEO Rich Snippets */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(structuredData),
              }}
            />
          </MaintenanceGuard>
        </SettingsProvider>
      </ThemeProvider>
    </LocaleProvider>
  );
}
