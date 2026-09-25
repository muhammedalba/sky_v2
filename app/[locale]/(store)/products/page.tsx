import { getStoreSettings } from '@/shared/api/settings';
import ProductsClient from './ProductsClient';
import TrustedBy from '@/components/home/TrustedBy';
import { Metadata } from 'next';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { env } from '@/lib/env';
import {
  DEFAULT_CATALOG_PARAMS,
  DEFAULT_BEST_SELLERS_PARAMS,
  DEFAULT_FEATURED_PARAMS,
  DEFAULT_CATEGORIES_PARAMS,
  DEFAULT_BRANDS_PARAMS,
  DEFAULT_CAROUSEL_PARAMS,
} from '@/features/products/storefrontQueryDefaults';
import { serverFetch } from "@/shared/api/server-fetch";

interface Props {
  params: Promise<{ locale: string }>;
}

// ─── Server-side Prefetch Helper ─────────────────────────────────────────────

/**
 * Fetches any list endpoint and stores it in the QueryClient.
 * Uses Next.js Data Cache via fetch() so repeated requests within the
 * revalidate window never hit the origin.
 */
async function prefetchList(
  queryClient: QueryClient,
  locale: string,
  endpoint: string,
  urlParams: Record<string, unknown>,
  queryKey: unknown[],
  revalidate: number,
  tags: string[],
) {
  const url = new URL(`${env.API_URL}${endpoint}`);

  Object.entries(urlParams).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });

  try {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn: async () => {
        const res = await serverFetch(url.toString(), {
          next: { revalidate, tags },
          headers: { 'Content-Type': 'application/json', 'accept-language': locale },
        });
        if (!res.ok) return null;
        return res.json();
      },
    });
  } catch (error) {
    // Prefetch failures are non-fatal — client will fetch normally on hydration,
    // but we still want visibility into recurring SSR failures.
    console.error(`[ProductsPage] Prefetch failed for ${queryKey.join('/')}:`, error);
  }
}

// ─── Metadata ────────────────────────────────────────────────────────────────

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
    description:
      settings?.metaDescription?.[locale as 'ar' | 'en'] ||
      settings?.siteDescription?.[locale as 'ar' | 'en'],
    openGraph: {
      title: `${pageTitle} | ${siteName}`,
      description: settings?.metaDescription?.[locale as 'ar' | 'en'],
      images: settings?.logo
        ? [{ url: typeof settings.logo === 'object' ? settings.logo.url : settings.logo }]
        : [],
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProductsPage({ params }: Props) {
  const { locale } = await params;
  const queryClient = new QueryClient();

  // Prefetch ALL 6 queries that ProductsClient fires on mount, in parallel.
  // Query keys must exactly match what the hooks use: [name, locale, params] —
  // the params objects come from the shared storefrontQueryDefaults module so
  // both sides stay in sync by construction rather than by comment.
  await Promise.all([
    // ── Products ──────────────────────────────────────────────────
    prefetchList(
      queryClient, locale,
      env.ENDPOINTS.PRODUCTS.BASE,
      DEFAULT_CATALOG_PARAMS,
      ['products', locale, DEFAULT_CATALOG_PARAMS],
      60, ['products'],
    ),
    prefetchList(
      queryClient, locale,
      env.ENDPOINTS.PRODUCTS.BASE,
      DEFAULT_BEST_SELLERS_PARAMS,
      ['products', locale, DEFAULT_BEST_SELLERS_PARAMS],
      60, ['products'],
    ),
    prefetchList(
      queryClient, locale,
      env.ENDPOINTS.PRODUCTS.BASE,
      DEFAULT_FEATURED_PARAMS,
      ['products', locale, DEFAULT_FEATURED_PARAMS],
      60, ['products'],
    ),
    // ── Categories ────────────────────────────────────────────────
    prefetchList(
      queryClient, locale,
      env.ENDPOINTS.CATEGORIES.BASE,
      DEFAULT_CATEGORIES_PARAMS,
      ['categories', locale, DEFAULT_CATEGORIES_PARAMS],
      300, ['categories'],
    ),
    // ── Brands ────────────────────────────────────────────────────
    prefetchList(
      queryClient, locale,
      env.ENDPOINTS.BRANDS.BASE,
      DEFAULT_BRANDS_PARAMS,
      ['brands', locale, DEFAULT_BRANDS_PARAMS],
      300, ['brands'],
    ),
    // ── Carousel ──────────────────────────────────────────────────
    prefetchList(
      queryClient, locale,
      env.ENDPOINTS.CAROUSEL.BASE,
      DEFAULT_CAROUSEL_PARAMS,
      ['carousel', locale, DEFAULT_CAROUSEL_PARAMS],
      600, ['carousel'],
    ),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductsClient
        trustedBySection={
          <TrustedBy locale={locale as 'ar' | 'en'} mode="text" duration="200s" />
        }
      />
    </HydrationBoundary>
  );
}

