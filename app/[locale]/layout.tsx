
import { getMessages } from 'next-intl/server';
import { ReactNode } from 'react';
import { locales } from '@/i18n';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import LocaleProvider from './LocaleProvider';
import ThemeProvider from '@/app/providers/ThemeProvider';
import ToastProvider from '@/shared/ui/toast/ToastProvider';
import SettingsProvider from '@/app/providers/SettingsProvider';
import '../globals.css';
import { cookies } from 'next/headers';
import { getServerUser, checkUserPermission } from '@/lib/auth';
import Maintenance from '@/components/Maintenance';
import { getStoreSettings, DEFAULT_SETTINGS } from '@/shared/api/settings';

/**
 * Enterprise SEO Engine
 * Dynamically generates metadata from store settings
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const settings = await getStoreSettings() || DEFAULT_SETTINGS;

  const title = settings.metaTitle?.[locale as 'ar' | 'en'] || settings.siteName?.[locale as 'ar' | 'en'] || 'Sky Galaxy';
  const description = settings.metaDescription?.[locale as 'ar' | 'en'] || settings.siteDescription?.[locale as 'ar' | 'en'] || '';

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
      images: settings.logo ? [settings.logo] : [],
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    }
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Parallel data fetching for maximum performance
  const [messages, settings, cookieStore] = await Promise.all([
    getMessages(),
    getStoreSettings(),
    cookies()
  ]);

  // Use fallback settings if API fails
  const finalSettings = settings || DEFAULT_SETTINGS;
  

  const user = getServerUser(cookieStore);
  const canBypassMaintenance = checkUserPermission(user, 'manage_settings') || checkUserPermission(user, 'access_dashboard');
    console.log("layout",user?.role);
    
  const isMaintenance = finalSettings.maintenanceMode === true;
// console.log("settings",finalSettings?.logo)
  // Maintenance Guard (Server-Side)
  if (isMaintenance && !canBypassMaintenance) {
    return (
      <LocaleProvider locale={locale} messages={messages}>
        <ThemeProvider>
          <SettingsProvider settings={finalSettings}>
            <Maintenance />
          </SettingsProvider>
        </ThemeProvider>
      </LocaleProvider>
    );
  }

  return (
    <LocaleProvider locale={locale} messages={messages} >
      <ThemeProvider >
        <SettingsProvider settings={finalSettings}>
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
          {children}
        </SettingsProvider>
      </ThemeProvider>
    </LocaleProvider>
  );
}
