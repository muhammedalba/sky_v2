"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useProductFilters } from "@/features/products/hooks/useProductFilters";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useSubCategories } from "@/features/categories/hooks/useSubCategories";
import { useBrands } from "@/features/brands/hooks/useBrands";
import { Category, SubCategory, Brand, Product } from "@/types";
import {
  TrendingUpIcon as TrendingUp,
  AwardIcon as Award,
  ClockIcon as Clock,
} from "@/shared/ui/Icons";
import { useRecentlyViewedProducts } from "@/features/products/hooks/useRecentlyViewedProducts";
import dynamic from "next/dynamic";
import CategoriesSlide from "./[slug]/components/CategoriesSlide";
import HeroCarousel from "./components/HeroCarousel";
import ProductsSectionHeader from "./components/ProductsSectionHeader";
import ProductsGrid from "./components/ProductsGrid";
import ProductsCatalogSection from "./components/ProductsCatalogSection";
import {
  DEFAULT_BEST_SELLERS_PARAMS,
  DEFAULT_FEATURED_PARAMS,
  DEFAULT_CATEGORIES_PARAMS,
  DEFAULT_BRANDS_PARAMS,
} from "@/features/products/storefrontQueryDefaults";

const ProductsFilterDrawer = dynamic(
  () => import("./components/ProductsFilterDrawer"),
  { ssr: false }
);
const TrustedBy = dynamic(
  () => import("@/components/home/TrustedBy"),
  { ssr: false }
);

const EMPTY_ARRAY: never[] = [];

export default function ProductsClient() {
  const t = useTranslations("store.productsPage");

  // Only need filters + setFilter + resetFilters here;
  // page/sortBy/setSortBy/setPage/apiParams live in ProductsCatalogSection
  const { filters, filterErrors, setFilter, resetFilters } = useProductFilters();

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // ─── Data Fetching ───────────────────────────────────────
  const { data: bestSellersData } = useProducts(DEFAULT_BEST_SELLERS_PARAMS);
  const { data: featuredData } = useProducts(DEFAULT_FEATURED_PARAMS);
  const { data: categoriesData } = useCategories(DEFAULT_CATEGORIES_PARAMS);
  const { data: subCategoriesData } = useSubCategories(
    { category: filters.category || undefined, limit: 100 },
  );
  const { data: brandsData } = useBrands(DEFAULT_BRANDS_PARAMS);

  const categoriesList = useMemo(() => (categoriesData?.data || EMPTY_ARRAY) as Category[], [categoriesData?.data]);
  const subCategoriesList = useMemo(() => (subCategoriesData?.data || EMPTY_ARRAY) as SubCategory[], [subCategoriesData?.data]);
  const brandsList = useMemo(() => (brandsData?.data || EMPTY_ARRAY) as Brand[], [brandsData?.data]);
  const bestSellersList = useMemo(() => (bestSellersData?.data || EMPTY_ARRAY) as Product[], [bestSellersData?.data]);
  const featuredList = useMemo(() => (featuredData?.data || EMPTY_ARRAY) as Product[], [featuredData?.data]);

  const { products: recentlyViewedList } = useRecentlyViewedProducts();

  // ─── Active Filters Count ────────────────────────────────
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



  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-300 relative overflow-hidden">
      {/* Background glow decorations */}
      <div className="absolute top-0 right-1/4 w-160 h-160 bg-primary/5 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-[100vh] left-1/4 w-140 h-140 bg-accent/5 rounded-full blur-3xl pointer-events-none z-0" />

      {/* ─── 1. HERO CAROUSEL ────────────────────────────────── */}
      <section className="relative pt-24 pb-8 overflow-hidden z-10 bg-linear-to-b from-muted/30 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HeroCarousel />
        </div>
      </section>

      {/* ─── Categories Slide ─────────────────────────────────── */}
      <CategoriesSlide />

      {/* ─── 2. RECENTLY VIEWED ──────────────────────────────── */}
      {recentlyViewedList.length > 0 && (
        <section className="relative py-10 sm:py-14 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductsSectionHeader
              icon={Clock}
              title={t("recentlyViewedTitle")}
              description={t("recentlyViewedDesc")}
            />
            <ProductsGrid
              items={recentlyViewedList}
              isLoading={false}
              emptyTitle={t("noProducts")}
              emptyDesc={t("noProductsDesc")}
              withReveal
            />
          </div>
        </section>
      )}

      {/* ─── 3. BEST SELLERS ─────────────────────────────────── */}
      {bestSellersList.length > 0 && (
        <section className="relative py-10 sm:py-14 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductsSectionHeader
              icon={TrendingUp}
              title={t("bestSellers")}
              description={t("bestSellersDesc")}
            />
            <ProductsGrid
              items={bestSellersList}
              isLoading={false}
              emptyTitle={t("noProducts")}
              emptyDesc={t("noProductsDesc")}
              withReveal
            />
          </div>
        </section>
      )}

      {/* ─── 4. FEATURED ─────────────────────────────────────── */}
      {featuredList.length > 0 && (
        <section className="relative py-10 sm:py-14 z-10 bg-linear-to-b from-primary/5 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductsSectionHeader
              icon={Award}
              title={t("featuredTitle")}
              description={t("featuredDesc")}
            />
            <ProductsGrid
              items={featuredList}
              isLoading={false}
              emptyTitle={t("noProducts")}
              emptyDesc={t("noProductsDesc")}
              withReveal
            />
          </div>
        </section>
      )}

      {/* ─── 5. ALL PRODUCTS (with Suspense boundary) ───────────── */}
      <ProductsCatalogSection
        onOpenFilter={() => setIsMobileDrawerOpen(true)}
      />

      {/* ─── 6. TRUSTED BY ───────────────────────────────────── */}
      <TrustedBy mode="text" duration="200s" />

      {/* ─── Filter Drawer ────────────────────────────────────── */}
      <ProductsFilterDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        activeFilterCount={activeFilterCount}
        filters={filters}
        filterErrors={filterErrors}
        categoriesList={categoriesList}
        subCategoriesList={subCategoriesList}
        brandsList={brandsList}
        setFilter={setFilter}
        onClearAll={resetFilters}
      />
    </div>
  );
}