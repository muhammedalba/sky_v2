import { getStoreSettings } from '@/shared/api/settings';
import ProductsClient from './ProductsClient';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ locale: string }>;
}

/**
 * Server Component for the Products page.
 * Handles SEO metadata generation using store settings and passes control to ProductsClient.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const settings = await getStoreSettings();
  
  const siteName = settings?.siteName?.[locale as 'ar' | 'en'] || 'Sky Galaxy';
  const pageTitle = locale === 'ar' ? 'جميع المنتجات' : 'All Products';

  return {
    title: pageTitle,
    description: settings?.metaDescription?.[locale as 'ar' | 'en'] || settings?.siteDescription?.[locale as 'ar' | 'en'],
    openGraph: {
      title: `${pageTitle} | ${siteName}`,
      description: settings?.metaDescription?.[locale as 'ar' | 'en'],
      images: settings?.logo ? [settings.logo] : [],
    }
  };
}

export default function ProductsPage() {
  return <ProductsClient />;
}
