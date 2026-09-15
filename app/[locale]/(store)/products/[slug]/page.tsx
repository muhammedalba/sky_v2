import { cache } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { env } from "@/lib/env";
import ProductDetailsClient from "./ProductDetailsClient";

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/**
 * cache() يضمن أن الدالة تُنفَّذ مرة واحدة فقط per request حتى لو استُدعيت من
 * generateMetadata والـ page معاً.
 *
 * تُرجع null فقط عندما يكون المنتج غير موجود فعليًا (404) حتى يستدعي المستدعي
 * notFound() ويحصل الطالب على استجابة 404 حقيقية. أي فشل آخر (خطأ شبكة أو 5xx)
 * يُرمى كاستثناء بدلًا من إخفائه، لتُعرض صفحة الخطأ بدل صفحة "غير موجود" خطأً.
 */
const getProductData = cache(async (slug: string, locale: string) => {
  const endpoint = `${env.API_URL}${env.ENDPOINTS.PRODUCTS.BASE}/${slug}`;

  const response = await fetch(endpoint, {
    next: {
      revalidate: 3600, // Cache for 1 hour
      tags: [`product-${slug}-${locale}`, "products"],
    },
    headers: {
      "Content-Type": "application/json",
      "accept-language": locale,
    },
  });

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(
      `[ProductMetadata] Failed to fetch product ${slug}: ${response.status} ${response.statusText}`,
    );
  }

  const responseData = await response.json();
  return responseData.data || null;
});

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  // 2. استخدام الدالة هنا
  const product = await getProductData(slug, locale);

  if (!product) return {};

  const title =
    typeof product.title === "object"
      ? product.title[locale] || product.title.ar || product.title.en
      : product.title;
  const description =
    typeof product.description === "object"
      ? product.description[locale] ||
        product.description.ar ||
        product.description.en
      : product.description;
  const coverImage = product.imageCover || product.images?.[0] || "";
  const ogImage =
    typeof coverImage === "object" ? coverImage?.url || "" : coverImage;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function ProductDetailsPage({ params }: ProductPageProps) {
  const { slug, locale } = await params;

  // 3. استخدام نفس الدالة هنا مرة أخرى
  // سحر Next.js: هذا لن يقوم بطلب جديد للـ API! سيستخدم النتيجة المخبأة من طلب generateMetadata
  const product = await getProductData(slug, locale);

  // المنتج غير موجود فعليًا → 404 حقيقي بدل عرض واجهة "غير موجود" مع status 200
  if (!product) notFound();

  // 4. تمرير البيانات كـ Initial Data للمكون العميل لكي لا يضطر لجلبها من الصفر
  return (
    <ProductDetailsClient key={slug} params={params} initialData={product} />
  );
}
