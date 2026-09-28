import { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { locales } from "@/i18n";
import { serverFetch } from "@/shared/api/server-fetch";

// Regenerate hourly so new/updated products reach Google without a redeploy.
export const revalidate = 3600;

type ChangeFrequency = NonNullable<
  MetadataRoute.Sitemap[number]["changeFrequency"]
>;

// Public, indexable storefront routes only — auth/account/checkout/cart/
// dashboard pages are user-specific or behind auth and excluded (see robots.ts).
const staticPaths: {
  path: string;
  changeFrequency: ChangeFrequency;
  priority: number;
}[] = [
  { path: "/home", changeFrequency: "daily", priority: 1 },
  { path: "/products", changeFrequency: "daily", priority: 0.9 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/request-quote", changeFrequency: "monthly", priority: 0.7 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

// Google caps a sitemap at 50,000 URLs; each product yields one URL per locale.
const PRODUCTS_PAGE_SIZE = 500;
const MAX_PRODUCTS = Math.floor(50_000 / locales.length) - staticPaths.length;

type ProductEntry = { slug: string; updatedAt?: string };

/**
 * Fetches slug + updatedAt of every storefront-visible product. The API
 * already hides deleted/inactive products by default (Product schema
 * pre-find hook), so no extra filters are needed.
 */
async function getAllProducts(): Promise<ProductEntry[]> {
  const products: ProductEntry[] = [];

  // Sorted by _id (immutable) so an edit mid-crawl can't shift items between pages.
  for (let page = 1; products.length < MAX_PRODUCTS; page++) {
    const res = await serverFetch(
      `${env.API_URL}${env.ENDPOINTS.PRODUCTS.BASE}?page=${page}&limit=${PRODUCTS_PAGE_SIZE}&sort=_id&fields=slug,updatedAt`,
      { next: { revalidate, tags: ["products"] } },
    );
    if (!res.ok) {
      throw new Error(`[sitemap] Products page ${page}: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    const batch: ProductEntry[] = (json?.data ?? []).filter(
      (p: Partial<ProductEntry>) => Boolean(p.slug),
    );
    products.push(...batch);

    if (!json?.pagination?.nextPage || batch.length === 0) break;
  }

  return products.slice(0, MAX_PRODUCTS);
}

function localizedEntries(
  path: string,
  extra: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">,
): MetadataRoute.Sitemap {
  const baseUrl = env.APP_URL;
  const languages = Object.fromEntries(
    locales.map((l) => [l, `${baseUrl}/${l}${path}`]),
  );

  return locales.map((locale) => ({
    url: `${baseUrl}/${locale}${path}`,
    ...extra,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // No lastModified on static pages: a timestamp that changes on every
  // regeneration is inaccurate, and Google stops trusting lastmod across the
  // whole sitemap (including the real product dates below) when it sees that.
  const staticEntries = staticPaths.flatMap(({ path, changeFrequency, priority }) =>
    localizedEntries(path, { changeFrequency, priority }),
  );

  let products: ProductEntry[] = [];
  try {
    products = await getAllProducts();
  } catch (error) {
    // Keep the static pages available rather than failing the build/route.
    console.error("[sitemap] Failed to load products:", error);
  }

  const productEntries = products.flatMap(({ slug, updatedAt }) =>
    localizedEntries(`/products/${encodeURIComponent(slug)}`, {
      lastModified: updatedAt ? new Date(updatedAt) : undefined,
      changeFrequency: "weekly",
      priority: 0.8,
    }),
  );

  return [...staticEntries, ...productEntries];
}
