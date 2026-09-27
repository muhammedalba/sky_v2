import type { Metadata, Viewport } from "next";
import { getMessages, setRequestLocale } from "next-intl/server";
import { ReactNode, Suspense } from "react";
import { locales } from "@/i18n";
import { notFound } from "next/navigation";
import Script from "next/script";
import LocaleProvider from "./LocaleProvider";
import ThemeProvider from "@/app/providers/ThemeProvider";
import ToastProvider from "@/shared/ui/toast/ToastProvider";
import NavigationProgress from "@/shared/ui/NavigationProgress";
import SettingsProvider from "@/app/providers/SettingsProvider";
import { getStoreSettings, DEFAULT_SETTINGS } from "@/shared/api/settings";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import CartDrawer from "@/features/cart/components/CartDrawerLoader";
import CartSyncer from "@/features/cart/components/CartSyncer";
import WishlistSyncer from "@/features/wishlist/components/WishlistSyncer";
import { getImageUrl } from "@/shared/utils/image.util";
import { env } from "@/lib/env";

/**
 * Enterprise SEO Engine
 * Dynamic Metadata Generation based on active locale and global settings.
 *
 * Note: html/body live in the true root app/layout.tsx, not here — this
 * layout uses `params.locale` directly (instead of the dynamic `getLocale()`
 * an ancestor layout would need), which keeps the whole app static/ISR
 * eligible. See app/layout.tsx for why the theme <Script> also lives there.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const settings = (await getStoreSettings()) || DEFAULT_SETTINGS;

  const title =
    settings.metaTitle?.[locale as "ar" | "en"] ||
    settings.siteName?.[locale as "ar" | "en"] ||
    env.APP_NAME;
  const description =
    settings.metaDescription?.[locale as "ar" | "en"] ||
    settings.siteDescription?.[locale as "ar" | "en"] ||
    env.APP_DESCRIPTION;
  const ogImage = getImageUrl(settings.logo);

  return {
    title: {
      template: `%s | ${title}`,
      default: title,
    },
    description,
    icons: {
      icon: getImageUrl(settings.favicon) || "/favicon.ico",
      shortcut: getImageUrl(settings.favicon) || "/favicon.ico",
      apple: getImageUrl(settings.favicon) || "/apple-touch-icon.webp",
    },
    openGraph: {
      title,
      description,
      siteName: title,
      images: ogImage ? [{ url: ogImage }] : [],
      locale: locale === "ar" ? "ar_SA" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : [],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

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

  // Tawk.to chat: dashboard setting first, env var as fallback
  const tawkId =  process.env.NEXT_PUBLIC_TAWKID;

  // 1. Structured Data Configuration
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: finalSettings.siteName?.[locale as "ar" | "en"] || "SkyGalaxy",
    image: getImageUrl(finalSettings.logo),
    description: finalSettings.siteDescription?.[locale as "ar" | "en"] || "",
  };

  return (
    <>
      {/* JSON-LD Structured Data for SEO Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      {/* Google Tag Manager — GA4, pixels, etc. are configured inside the GTM container */}
      {finalSettings.googleTagManagerId && (
        <>
          {/* lazyOnload: keeps GTM's ~110 KiB off the critical path */}
          <Script id="gtm" strategy="lazyOnload">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${finalSettings.googleTagManagerId}');
            `}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${finalSettings.googleTagManagerId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      )}

      {/* Tawk.to Live Chat — tawkId format: "<propertyId>/<widgetId>" */}
      {tawkId && (
        <>
          {/* Config must exist before the embed loads, so both live in one script.
              Tawk picks desktop/mobile by user agent, not width — so the offset is
              chosen by viewport width (MobileBottomNav, ~84px, shows below sm/640px).
              The embed is injected on the first user interaction: its popup iframe
              otherwise lands mid-load and counts as a large layout shift (CLS). */}
          <Script id="tawk" strategy="lazyOnload">
            {`
              var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
              var tawkNavVisible = window.matchMedia('(max-width: 639px)').matches;
              var tawkOffset = { position: 'br', xOffset: tawkNavVisible ? 12 : 20, yOffset: tawkNavVisible ? 100 : 20 };
              Tawk_API.customStyle = {
                visibility: { desktop: tawkOffset, mobile: tawkOffset }
              };
              (function () {
                var events = ['scroll', 'pointerdown', 'keydown', 'touchstart'];
                function load() {
                  events.forEach(function (e) { window.removeEventListener(e, load); });
                  var s = document.createElement('script');
                  s.async = true;
                  s.src = 'https://embed.tawk.to/' + ${JSON.stringify(tawkId)};
                  s.charset = 'UTF-8';
                  s.setAttribute('crossorigin', '*');
                  document.head.appendChild(s);
                }
                events.forEach(function (e) { window.addEventListener(e, load, { once: true, passive: true }); });
              })();
            `}
          </Script>
        </>
      )}

      <LocaleProvider locale={locale} messages={rootMessages}>
        <ThemeProvider>
          <SettingsProvider settings={finalSettings}>
            <ToastProvider />
            {/* Suspense: NavigationProgress reads useSearchParams (keeps pages static) */}
            <Suspense fallback={null}>
              <NavigationProgress />
            </Suspense>

            {/* Performance Monitoring */}
            <PerformanceMonitor
              enablePerformance={finalSettings.enablePerformance ?? false}
            />
            {children}
            <CartDrawer />
            <CartSyncer />
            <WishlistSyncer />
          </SettingsProvider>
        </ThemeProvider>
      </LocaleProvider>
    </>
  );
}
