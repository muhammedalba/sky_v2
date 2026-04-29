import type { Metadata } from "next";
import { env } from "@/lib/env";
import Script from 'next/script';
import { getFontVariables } from '@/lib/fonts';

export const metadata: Metadata = {
  title: env.APP_NAME,
  description: env.APP_DESCRIPTION,
};

import type { Viewport } from 'next';
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};



import { getLocale } from 'next-intl/server';

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
