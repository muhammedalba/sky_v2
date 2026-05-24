"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/shared/ui/Button";
import { ChevronRightIcon, PackageIcon, StarIcon } from "@/shared/ui/Icons";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { Category } from "@/types";

import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import { GlowCard } from "@/shared/ui/GlowCard";
import { useTrans } from "@/shared/hooks/useTrans";

export default function CategoriesSection() {
  const t = useTranslations("home");
  const getTrans = useTrans();
  const {
    data: categoriesData,
    isLoading,
    error,
  } = useCategories({ limit: 4 });
  const categories = categoriesData?.data || [];

  if (isLoading) {
    return [1, 2, 3, 4].map((i: number) => (
      <div
        key={i}
        className="aspect-square bg-secondary animate-pulse rounded-3xl"
      />
    ));
  }
  if (error || !categories || categories.length === 0) {
    return;
  }

  return (
    <section className="py-24 bg-secondary/30 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <ScrollReveal animation="fade" delay={100}>
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12 md:mb-16">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black title-gradient">
                {t("categories.title")}
              </h2>
               <div className="w-24 h-0.5 bg-primary/80 rounded-full mt-2.5 me-auto" />
              <p className="text-lg text-muted-foreground font-medium max-w-2xl">
                {t("categories.description")}
              </p>
            </div>
            <Link href="/products" className="shrink-0">
              <Button
                variant="ghost"
                className="font-bold text-primary hover:bg-primary/10 hover:text-primary gap-2 group"
              >
                {t("categories.view_all")}
                <ChevronRightIcon className="w-5 h-5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px] md:auto-rows-[450px]">
          {categories.length > 0 ? (
            <>
              {/* Featured Category (Main Card) */}
              <ScrollReveal
                animation="slide-up"
                className="md:col-span-2 h-full"
              >
                <Link
                  href={`/products?category=${categories[0]._id}`}
                  className="block h-full group"
                >
                  <GlowCard className="h-full w-full rounded-3xl bg-card border border-border/50 shadow-md hover:shadow-xl transition-all duration-500">
                    {/* Featured Badge */}
                    <div className="absolute top-6 right-6 z-20 bg-background/90 backdrop-blur-md px-4 py-2 rounded-full border border-border/50 text-sm font-bold shadow-sm flex items-center gap-2">
                      <StarIcon className="w-4 h-4 text-warning animate-pulse" />
                      {t("categories.featured_label")}
                    </div>

                    {/* Background Image Layer */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${categories[0].image})` }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

                    {/* Content */}
                    <div className="absolute inset-0 z-10 flex flex-col justify-end p-8 md:p-10">
                      <h3 className="text-3xl md:text-5xl font-black text-white mb-3 line-clamp-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                        {getTrans(categories[0].name)}
                      </h3>
                      <p className="text-white/70 font-medium max-w-md mb-6 line-clamp-2 transform translate-y-4 md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                        {t("categories.items.waterproofing.desc")}
                      </p>

                      <div className="flex bg-primary/90 hover:bg-primary px-5 py-2.5 backdrop-blur-md rounded-xl w-fit items-center gap-3 text-primary-foreground font-bold transition-all shadow-lg">
                        {t("categories.shop_category")}
                        <ChevronRightIcon className="w-5 h-5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* Decorative Icon */}
                    <PackageIcon className="absolute left-8 -bottom-8 w-64 h-64 text-white/5 group-hover:text-white/10 group-hover:-rotate-12 transition-all duration-700 pointer-events-none" />
                  </GlowCard>
                </Link>
              </ScrollReveal>

              {/* Secondary Categories */}
              <div className="hidden md:flex flex-col gap-6 h-full md:col-span-1">
                {categories.slice(1, 3).map((cat: Category, i: number) => (
                  <ScrollReveal
                    key={cat._id}
                    delay={200 + i * 100}
                    className="flex-1 h-full"
                  >
                    <Link
                      href={`/products?category=${cat._id}`}
                      className="block h-full group"
                    >
                      <GlowCard className="h-full min-h-62.5 md:min-h-0 w-full rounded-3xl bg-card border border-border/50 shadow-md hover:shadow-xl transition-all duration-500">
                        {/* Background Image Layer */}
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                          style={{ backgroundImage: `url(${cat.image})` }}
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

                        {/* Content */}
                        <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 md:p-8">
                          <h3 className="text-2xl font-bold text-white mb-2 line-clamp-1 group-hover:text-primary-100 transition-colors">
                            {getTrans(cat.name)}
                          </h3>

                          <div className="flex items-center justify-between mt-2">
                            <span className="text-white/70 font-medium text-sm flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                              {cat.productsCount || 10}+ {t("customer_favorite.featured")}
                            </span>

                            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm transform group-hover:scale-110">
                              <ChevronRightIcon className="w-5 h-5 rtl:rotate-180" />
                            </div>
                          </div>
                        </div>
                      </GlowCard>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </>
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed border-border/50 rounded-3xl">
              <PackageIcon className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium">{t("categories.title")}...</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
