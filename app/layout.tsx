import type { Metadata, Viewport } from "next";
import { env } from "@/lib/env";
import Script from "next/script";
import { getFontVariables } from "@/lib/fonts";
import { getLocale } from "next-intl/server";
import { getStoreSettings, DEFAULT_SETTINGS } from "@/shared/api/settings";
import { getImageUrl } from "@/shared/utils/image.util";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) ?? "ar";
  const settings = (await getStoreSettings()) || DEFAULT_SETTINGS;

  const title =
    settings.metaTitle?.[locale as "ar" | "en"] ||
    settings.siteName?.[locale as "ar" | "en"] ||
    env.APP_NAME;
  const description =
    settings.metaDescription?.[locale as "ar" | "en"] ||
    settings.siteDescription?.[locale as "ar" | "en"] ||
    env.APP_DESCRIPTION;

  return {
    title: {
      template: `%s | ${title}`,
      default: title,
    },
    description,
    icons: {
      icon: getImageUrl(settings.favicon?.url) || "/favicon.ico",
      shortcut: getImageUrl(settings.favicon?.url) || "/favicon.ico",
      apple: getImageUrl(settings.favicon?.url) || "/apple-touch-icon.png",
    },
    openGraph: {
      title,
      description,
      siteName: title,
      images: settings.logo
        ? [
            {
              url: getImageUrl(settings.logo) || "/assets/images/logo.png",
            },
          ]
        : [],
      locale: locale === "ar" ? "ar_SA" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: settings.logo
        ? [
            {
              url: getImageUrl(settings.logo) || "/assets/images/logo.png",
            },
          ]
        : [],
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
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = (await getLocale()) ?? "ar";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head />
      <body className={`${getFontVariables()} antialiased `}>
        <Script
          id="theme-initializer"
          src="/theme-init.js"
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}
