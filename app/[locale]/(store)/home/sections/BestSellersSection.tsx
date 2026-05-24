"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/shared/ui/Button";
import { ChevronRightIcon } from "@/shared/ui/Icons";
import { useProducts } from "@/features/products/hooks/useProducts";
import { Product } from "@/types";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import ProductCard from "@/components/ProductCard";

// 1. استخراج مصفوفة التحميل خارج المكون لتجنب إعادة إنشائها في كل ريندر
const SKELETON_ITEMS = [1, 2, 3, 4];

export default function BestSellersSection() {
  const t = useTranslations("home");
  const {
    data: productsData,
    isLoading,
    error,
  } = useProducts({ limit: 4, isFeatured: true });

  const products = productsData?.data || [];

  // 2. إخفاء القسم بالكامل فقط إذا "انتهى التحميل" ولم تكن هناك بيانات
  if (!isLoading && (error || !products || products.length === 0)) {
    return null;
  }

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 3. عرض الترويسة بشكل دائم لتحسين الـ UX وتقليل الـ Layout Shift */}
        <ScrollReveal animation="slide-up">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 md:gap-8 mb-12 md:mb-16">
            <div className="space-y-4 w-full">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black tracking-widest uppercase">
                {t("customer_favorite.featured")}
              </div>
              <h2 className="text-4xl md:text-5xl font-black title-gradient tracking-tight">
                {t("customer_favorite.title")}
              </h2>
              <p className="text-lg text-muted-foreground font-medium max-w-2xl">
                {t("customer_favorite.description")}
              </p>
            </div>
            
            <Link href="/products" className="shrink-0">
              <Button
                variant="outline"
                className="h-12 px-8 rounded-xl font-black gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 group"
              >
                {t("customer_favorite.view_all")}
                <ChevronRightIcon className="w-5 h-5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>

        {/* 4. توحيد حاوية الشبكة (Grid) لحالتي التحميل والبيانات */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? SKELETON_ITEMS.map((i) => (
                // تصميم الهيكل المؤقت (Skeleton) ليطابق تقريباً أبعاد بطاقة المنتج (ProductCard)
                <div
                  key={`skeleton-${i}`}
                  className="w-full min-h-112.5 bg-secondary/40 animate-pulse rounded-[2rem] border border-border/30"
                />
              ))
            : products.map((item: Product, i: number) => (
                <ScrollReveal 
                  key={item._id || item.sku} // الاعتماد على الـ ID لضمان دقة الـ Keys
                  animation="slide-up" 
                  delay={i * 100}
                >
                  <ProductCard item={item} t={t} />
                </ScrollReveal>
              ))}
        </div>
      </div>
    </section>
  );
}