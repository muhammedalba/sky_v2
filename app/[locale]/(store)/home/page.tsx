import { use } from 'react';
import { generatePageMetadata } from '@/lib/seo';
import { getStoreSettings } from '@/shared/api/settings';
import HomeClient from './HomeClient';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const settings = await getStoreSettings();

  return generatePageMetadata({
    locale,
    namespace: 'home',
    canonicalPath: '',
    siteName:    settings?.siteName?.[locale as 'ar' | 'en'],
    siteLogoUrl: settings?.logo,
  });
}

export default function HomePage({ params }: Props) {
  const { locale } = use(params);
  return <HomeClient locale={locale} />;
}
