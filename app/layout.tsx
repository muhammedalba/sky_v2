import type { Metadata, Viewport } from "next";
import { env } from "@/lib/env";
import Script from 'next/script';
import { getFontVariables } from '@/lib/fonts';
import { getLocale } from 'next-intl/server';
import { getStoreSettings, DEFAULT_SETTINGS } from '@/shared/api/settings';

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) ?? 'ar';
  const settings = (await getStoreSettings()) || DEFAULT_SETTINGS;

  const title = settings.metaTitle?.[locale as 'ar' | 'en'] || settings.siteName?.[locale as 'ar' | 'en'] || env.APP_NAME;
  const description = settings.metaDescription?.[locale as 'ar' | 'en'] || settings.siteDescription?.[locale as 'ar' | 'en'] || env.APP_DESCRIPTION;

  return {
    title: {
      template: `%s | ${title}`,
      default: title,
    },
    description,
    icons: {
      icon: settings.favicon || '/favicon.ico',
      shortcut: settings.favicon || '/favicon.ico',
      apple: settings.favicon || '/apple-touch-icon.png',
    },
    openGraph: {
      title,
      description,
      siteName: title,
      images: settings.logo ? [{ url: settings.logo }] : [],
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: settings.logo ? [settings.logo] : [],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,

}: Readonly<{
  children: React.ReactNode;
}>) {

  const locale = await getLocale() ?? 'ar';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <Script
          id="theme-initializer"
          src="/theme-init.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${getFontVariables()} antialiased`}>
        {children}
      </body>
    </html>
  );
}
