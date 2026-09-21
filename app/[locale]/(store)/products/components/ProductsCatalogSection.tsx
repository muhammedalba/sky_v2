"use client";

import { Suspense, useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useProductFilters } from "@/features/products/hooks/useProductFilters";
import { productsApi } from "@/features/products/api";
import { Product } from "@/types";
import Pagination from "@/shared/ui/Pagination";
import { Button } from "@/shared/ui/Button";
import { Dropdown, DropdownItem } from "@/shared/ui/CustomDropdown";
import {
  ChevronDownIcon as ChevronDown,
  FilterIcon as Filter,
} from "@/shared/ui/Icons";
import ProductsGrid from "./ProductsGrid";
import ProductsGridSkeleton from "./ProductsGridSkeleton";
import { DEFAULT_CATALOG_PARAMS } from "@/features/products/storefrontQueryDefaults";
import SearchBar from "@/components/navigation/SearchBar";
import { useMediaQuery } from "@/shared/hooks/use-media-query";

// ─── Stable empty reference ───────────────────────────────────────────────────
const EMPTY_ARRAY: never[] = [];

// ─── Inner component — uses useSuspenseQuery so it suspends on filter changes ─

interface CatalogGridProps {
  queryParams: Record<string, unknown>;
  onPageChange: (p: number) => void;
  t: ReturnType<typeof useTranslations>;
}

function CatalogGrid({ queryParams, onPageChange, t }: CatalogGridProps) {
  const locale = useLocale();

  const { data } = useSuspenseQuery({
    queryKey: ["products", locale, queryParams],
    queryFn: () => productsApi.getAll(queryParams),
    // يتطابق مع next: { revalidate: 60 } في page.tsx — لا re-fetch بعد hydration
    staleTime: 60 * 1000,
  });

  return (
    <>
      {!!data?.meta?.pagination?.totalResults && (
        <p className="text-sm text-muted-foreground pb-3 -mt-2 md:-mt-5 ">
          <span className="text-primary ps-1 pe-2">
          ( {data.meta.pagination.totalResults} )
          </span>
          {t("resultsCount")}
        </p>
      )}

      <ProductsGrid
        items={(data?.data as Product[]) || EMPTY_ARRAY}
        isLoading={false}
        emptyTitle={t("noProducts")}
        emptyDesc={t("noProductsDesc")}
      />

      {data?.meta?.pagination && (
        <Pagination
          pagination={data.meta.pagination}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}

// ─── Exported section component ───────────────────────────────────────────────

interface ProductsCatalogSectionProps {
  /** Called when the user clicks the Filter button */
  onOpenFilter: () => void;
}

/**
 * The "All Products" section of the storefront.
 *
 * Architecture:
 *  - Toolbar (sort + filter button) renders immediately and stays visible
 *    during every filter/sort change — no layout shift.
 *  - The grid and pagination are wrapped in <Suspense> so they show a skeleton
 *    while new data is being fetched (on filter/sort/page changes).
 *  - On first load the SSR-prefetched data is in the cache → no suspension.
 */
export default function ProductsCatalogSection({
  onOpenFilter,
}: ProductsCatalogSectionProps) {
  const t = useTranslations("store.productsPage");
  const commonT = useTranslations("common.buttons");

  const { filters, apiParams, page, sortBy, setPage, setSortBy } =
    useProductFilters();

  // null = not yet known on the client (SSR-safe default: render as if it
  // could be mobile, matching the CSS-based "md:hidden" behaviour below).
  // Once resolved to `true`, skip mounting the mobile SearchBar entirely
  // instead of just CSS-hiding it, so desktop viewports don't carry its
  // duplicate state/effects/debounce timer alongside the desktop SearchBar.
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Badge count for the filter button
  const activeFilterCount = useMemo(
    () =>
      [
        filters.category,
        filters.SubCategories,
        filters.brand,
        filters["pricerange[min]"],
        filters["pricerange[max]"],
        filters.color,
      ].filter(Boolean).length,
    [filters],
  );

  // page/sortBy default to DEFAULT_CATALOG_PARAMS (see useProductFilters), so
  // on first render this matches the SSR-prefetched query key exactly.
  const productQueryParams = useMemo(
    () => ({
      page,
      limit: DEFAULT_CATALOG_PARAMS.limit,
      sort: sortBy,
      ...apiParams,
    }),
    [page, sortBy, apiParams],
  );

  const sortOptions = [
    { value: "-createdAt", label: t("sorts.newest") },
    { value: "-totalSold", label: t("sorts.bestSelling") },
    { value: "priceRange.min", label: t("sorts.priceLowHigh") },
    { value: "-priceRange.min", label: t("sorts.priceHighLow") },
    { value: "-ratingsAverage", label: t("sorts.topRated") },
  ];

  return (
    <section id="all-products" className="relative py-10 sm:py-14 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Toolbar: always visible, no Suspense ──────────────── */}
        <div className="flex flex-wrap flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-black title-gradient">
            {t("allProducts")}
          </h2>
          {/* ── Mobile Search Bar: only visible on mobile screens ── */}
          {isDesktop !== true && (
            <div className="md:hidden mb-3">
              <SearchBar useLiveSearch={true} className="w-full" />
            </div>
          )}
          <div className="flex items-center justify-between md:justify-end gap-3">
            {/* Sort dropdown */}
            <Dropdown
              trigger={
                <span className="inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-input bg-background text-sm font-semibold hover:bg-accent transition-colors">
                  {t("sortByLabel")}:{" "}
                  <span className="text-primary">
                    {sortOptions.find((s) => s.value === sortBy)?.label}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </span>
              }
              width="w-56"
            >
              {sortOptions.map((opt) => (
                <DropdownItem
                  key={opt.value}
                  onClick={() => {
                    setSortBy(opt.value);
                    setPage(1);
                  }}
                  className={
                    opt.value === sortBy
                      ? "font-semibold text-primary"
                      : undefined
                  }
                >
                  {opt.label}
                </DropdownItem>
              ))}
            </Dropdown>

            {/* Filter button */}
            <Button
              variant="default"
              className="h-11 px-4 gap-2 relative"
              onClick={onOpenFilter}
            >
              <Filter className="w-4 h-4" />
              {commonT("filter")}
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 rtl:-right-auto rtl:-left-2 flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-black shadow-md">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* ── Grid + Pagination: suspends while loading ──────────── */}
        <Suspense fallback={<ProductsGridSkeleton />}>
          <CatalogGrid
            queryParams={productQueryParams}
            onPageChange={setPage}
            t={t}
          />
        </Suspense>
      </div>
    </section>
  );
}
