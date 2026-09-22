import type { ReactNode } from "react";
import Script from "next/script";
import { getFontVariables } from "@/lib/fonts";
import { env } from "@/lib/env";
import "./globals.css";

/**
 * True root layout — intentionally has zero dynamic API calls (no
 * cookies()/headers()/getLocale()) so it never forces the app into dynamic
 * rendering. `lang`/`dir` use the build-time default locale only; the real
 * per-locale values are corrected client-side by LocaleProvider on mount.
 *
 * The `beforeInteractive` theme script lives here (not in [locale]/layout.tsx)
 * specifically because this layout never re-renders on a locale switch —
 * only [locale]/layout.tsx does, since it's the one parameterized by
 * `params.locale`. A <Script strategy="beforeInteractive"> re-rendering on
 * the client (as opposed to fresh SSR) trips React's "Encountered a script
 * tag while rendering React component" diagnostic.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  const defaultLocale = (env.DEFAULT_LOCALE as "ar" | "en") || "ar";
  const dir = defaultLocale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={defaultLocale} dir={dir} suppressHydrationWarning>
      <head />
      <body className={`${getFontVariables()} antialiased`}>
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
