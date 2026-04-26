import type { Metadata } from "next";
import { env } from "@/lib/env";
import Script from 'next/script';
import { getFontVariables } from '@/lib/fonts';

export const metadata: Metadata = {
  title: env.APP_NAME,
  description: env.APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
