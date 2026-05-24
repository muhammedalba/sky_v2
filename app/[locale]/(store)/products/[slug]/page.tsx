import { Metadata } from 'next';
import { env } from '@/lib/env';
import ProductDetailsClient from './ProductDetailsClient';

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

// 1. إنشاء دالة مساعدة لجلب البيانات (تعمل على السيرفر فقط)
async function getProductData(slug: string) {
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

    if (!response.ok) return null;
    const responseData = await response.json();
    return responseData.data || null;
  } catch (error) {
    console.error(`[ProductMetadata] Failed to fetch product ${slug}:`, error);
    return null;
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  
  // 2. استخدام الدالة هنا
  const product = await getProductData(slug);

  if (!product) return {};

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
}

export default async function ProductDetailsPage({ params }: ProductPageProps) {
  const { slug } = await params;
  
  // 3. استخدام نفس الدالة هنا مرة أخرى
  // سحر Next.js: هذا لن يقوم بطلب جديد للـ API! سيستخدم النتيجة المخبأة من طلب generateMetadata
  const product = await getProductData(slug);

  // 4. تمرير البيانات كـ Initial Data للمكون العميل لكي لا يضطر لجلبها من الصفر
  return <ProductDetailsClient params={params} initialData={product} />;
}