import { getStoreSettings } from '@/shared/api/settings';
import ProductsClient from './ProductsClient';
import { Metadata } from 'next';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { env } from '@/lib/env';

interface Props {
  params: Promise<{ locale: string }>;
}

// ─── Server-side Prefetch Helpers ────────────────────────────────────────────

/** Default params that ProductsClient uses for the main catalog on first render */
const DEFAULT_CATALOG_PARAMS      = { page: 1, limit: 9, sort: '-createdAt' };
const DEFAULT_BEST_SELLERS_PARAMS = { sort: '-totalSold', limit: 4 };
const DEFAULT_FEATURED_PARAMS     = { isFeatured: true, limit: 4 };
const DEFAULT_CATEGORIES_PARAMS   = { limit: 100 };
const DEFAULT_BRANDS_PARAMS       = { limit: 100 };
const DEFAULT_CAROUSEL_PARAMS     = { isActive: true };

async function prefetchProducts(
  queryClient: QueryClient,
  locale: string,
  params: Record<string, unknown>,
  queryKey: unknown[],
) {
  const url = new URL(`${env.API_URL}${env.ENDPOINTS.PRODUCTS.BASE}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });

  try {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn: async () => {
        const res = await fetch(url.toString(), {
          next: { revalidate: 60, tags: ['products'] },
          headers: { 'Content-Type': 'application/json', 'accept-language': locale },
        });
        if (!res.ok) return null;
        return res.json();
      },
    });
  } catch {
    // Prefetch failures are non-fatal — client will fetch normally
  }
}

/**
 * Generic helper: fetches any list endpoint and stores it in the QueryClient.
 * Uses Next.js Data Cache via fetch() so repeated requests within revalidate
 * window never hit the origin.
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
        const res = await fetch(url.toString(), {
          next: { revalidate, tags },
          headers: { 'Content-Type': 'application/json', 'accept-language': locale },
        });
        if (!res.ok) return null;
        return res.json();
      },
    });
  } catch {
    // non-fatal — client will fetch normally on hydration
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
  // Query keys must exactly match what the hooks use: [name, locale, params]
  await Promise.all([
    // ── Products ──────────────────────────────────────────────────
    prefetchProducts(queryClient, locale, DEFAULT_CATALOG_PARAMS, [
      'products', locale, DEFAULT_CATALOG_PARAMS,
    ]),
    prefetchProducts(queryClient, locale, DEFAULT_BEST_SELLERS_PARAMS, [
      'products', locale, DEFAULT_BEST_SELLERS_PARAMS,
    ]),
    prefetchProducts(queryClient, locale, DEFAULT_FEATURED_PARAMS, [
      'products', locale, DEFAULT_FEATURED_PARAMS,
    ]),
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
      <ProductsClient />
    </HydrationBoundary>
  );
}

