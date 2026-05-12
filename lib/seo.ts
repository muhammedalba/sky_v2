import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { env } from './env';

interface GenerateMetadataProps {
  locale: string;
  namespace: string;
  canonicalPath?: string;
  ogImage?: string;
  noIndex?: boolean;
  /** Override site name from DB settings (falls back to 'Sky Galaxy') */
  siteName?: string;
  /** Override OG logo from DB settings.logo */
  siteLogoUrl?: string;
}

export async function generatePageMetadata({
  locale,
  namespace,
  canonicalPath,
  ogImage,
  noIndex = false,
  siteName,
  siteLogoUrl,
}: GenerateMetadataProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace });
  const baseUrl = env.APP_URL;
  const path = canonicalPath || '';

  // Prefer DB-driven values; fall back to hardcoded defaults
  const resolvedSiteName = siteName || 'Sky Galaxy';
  const resolvedOgImage  = ogImage || siteLogoUrl || `${baseUrl}/og-image.jpg`;

  return {
    title: {
      template: `%s | ${resolvedSiteName}`,
      default: t('meta.title'),
    },
    description: t('meta.description'),
    alternates: {
      canonical: `${baseUrl}/${locale}${path}`,
      languages: {
        'en': `${baseUrl}/en${path}`,
        'ar': `${baseUrl}/ar${path}`,
      },
    },
    openGraph: {
      title: t('meta.title'),
      description: t('meta.description'),
      url: `${baseUrl}/${locale}${path}`,
      siteName: resolvedSiteName,
      images: [
        {
          url: resolvedOgImage,
          width: 1200,
          height: 630,
        },
      ],
      locale: locale,
      type: 'website',
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
  };
}

