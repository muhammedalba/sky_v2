
import { generatePageMetadata } from '@/lib/seo';
import { getStoreSettings } from '@/shared/api/settings';
import HomePageContent from './HomePageContent';

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
    siteLogoUrl: settings?.logo?.url,
  });
}

export default async function HomePage({ params }: Props) {
  const { locale } = (await params) as { locale: 'ar' | 'en' };

  return <HomePageContent locale={locale} />;
}
