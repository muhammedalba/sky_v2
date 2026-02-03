import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { env } from './env';

interface GenerateMetadataProps {
  locale: string;
  namespace: string;
  canonicalPath?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export async function generatePageMetadata({
  locale,
  namespace,
  canonicalPath,
  ogImage,
  noIndex = false,
}: GenerateMetadataProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace });
  const baseUrl = env.APP_URL;
  const path = canonicalPath || '';

  return {
    title: {
      template: '%s | Sky Galaxy',
      default: t('meta.title'), // Expects 'meta.title' in json
    },
    description: t('meta.description'), // Expects 'meta.description' in json
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
      siteName: 'Sky Galaxy',
      images: [
        {
          url: ogImage || `${baseUrl}/og-image.jpg`,
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
