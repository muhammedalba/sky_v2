import { Metadata } from 'next';
import { env } from '@/lib/env';
import ProductDetailsClient from './ProductDetailsClient';

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const endpoint = `${env.API_URL}${env.ENDPOINTS.PRODUCTS.BASE}/${slug}`;

  try {
    const response = await fetch(endpoint, {
      next: {
        revalidate: 3600, // Cache for 1 hour
        tags: [`product-${slug}`, 'products'],
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return {};
    }

    const responseData = await response.json();
    const product = responseData.data;

    if (!product) {
      return {};
    }

    // Handle i18n title/description if they are objects in DB or fallback to string
    const title = typeof product.title === 'object' ? (product.title[locale] || product.title.ar || product.title.en) : product.title;
    const description = typeof product.description === 'object' ? (product.description[locale] || product.description.ar || product.description.en) : product.description;
    const ogImage = product.imageCover || product.images?.[0] || '';

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: ogImage ? [{ url: ogImage }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ogImage ? [ogImage] : [],
      },
    };
  } catch (error) {
    console.error(`[ProductMetadata] Failed to fetch product ${slug}:`, error);
    return {};
  }
}

export default async function ProductDetailsPage({ params }: ProductPageProps) {
  return <ProductDetailsClient params={params} />;
}
