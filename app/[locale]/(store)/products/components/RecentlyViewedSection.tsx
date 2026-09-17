"use client";

import { useTranslations } from "next-intl";
import { ClockIcon as Clock } from "@/shared/ui/Icons";
import { useRecentlyViewedProducts } from "@/features/products/hooks/useRecentlyViewedProducts";
import ProductsSectionHeader from "./ProductsSectionHeader";
import ProductsGrid from "./ProductsGrid";

export default function RecentlyViewedSection() {
  const t = useTranslations("store.productsPage");
  const { products, isLoading } = useRecentlyViewedProducts();

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="relative py-10 sm:py-14 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductsSectionHeader
          icon={Clock}
          title={t("recentlyViewedTitle")}
          description={t("recentlyViewedDesc")}
        />
        <ProductsGrid
          items={products}
          isLoading={isLoading}
          emptyTitle={t("noProducts")}
          emptyDesc={t("noProductsDesc")}
          withReveal
        />
      </div>
    </section>
  );
}
