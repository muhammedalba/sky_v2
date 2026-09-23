/**
 * Single source of truth for the default query params used by the storefront
 * Products page (server-side prefetch in `app/[locale]/(store)/products/page.tsx`
 * and the client hooks/components that read the hydrated react-query cache).
 *
 * Both sides MUST use the same params object to produce matching query keys —
 * otherwise the client-side hook misses the SSR-prefetched cache entry and
 * fires a redundant fetch on mount. Importing from here instead of duplicating
 * literals keeps that guarantee compiler-enforced rather than comment-enforced.
 */

/**
 * Storefront product queries refetch when the tab regains focus (once the
 * 60s staleTime has passed), so edits made in the dashboard show up without
 * a manual page reload.
 */
export const STOREFRONT_REFETCH_OPTIONS = {
  refetchOnWindowFocus: true,
  staleTime: 60 * 1000,
} as const;

export const DEFAULT_CATALOG_PARAMS = {
  page: 1,
  limit: 20,
  sort: "-createdAt",
} as const;

export const DEFAULT_BEST_SELLERS_PARAMS = {
  sort: "-totalSold",
  limit: 4,
} as const;

export const DEFAULT_FEATURED_PARAMS = {
  isFeatured: true,
  limit: 4,
} as const;

export const DEFAULT_CATEGORIES_PARAMS = {
  limit: 100,
} as const;

export const DEFAULT_BRANDS_PARAMS = {
  limit: 100,
} as const;

export const DEFAULT_CAROUSEL_PARAMS = {
  isActive: true,
} as const;
