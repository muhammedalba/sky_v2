import { cache } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { env } from "@/lib/env";
import ProductDetailsClient from "./ProductDetailsClient";

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/**
* cache() ensures the function executes only once per request, even if called
* by both generateMetadata and the page. 
*
* It returns null only when the product genuinely does not exist (404),
* allowing the caller to invoke notFound() and trigger a true 404 response. 
* Any other failure (such as a network error or 5xx) is thrown as an exception
* rather than being suppressed, ensuring the correct error page is displayed
* instead of an erroneous "Not Found" page. 
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
  //  Next.js: this will not make a new API request! It will use the cached result from generateMetadata request
  const product = await getProductData(slug, locale);

  // The product does not actually exist → 404 instead of showing the "not found" interface with status 200
  if (!product) notFound();

  //4. Passing data as initial data to the client component so it does not have to fetch it from scratch.
  return (
    <ProductDetailsClient key={slug} params={params} initialData={product} />
  );
}
