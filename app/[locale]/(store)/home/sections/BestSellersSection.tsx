"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/shared/ui/Button";
import { ChevronRightIcon, EyeIcon, PackageIcon, ShoppingCartIcon, StarIcon } from "@/shared/ui/Icons";
import { Card } from "@/shared/ui/Card";
import { useProducts } from "@/features/products/hooks/useProducts";
import { Product } from "@/types";
import { getLocalizedValue } from "@/lib/utils";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";

export default function BestSellersSection({ locale }: { locale: string }) {
  const t = useTranslations("home");
  const { data: productsData } = useProducts({ limit: 4 });
  const products = productsData?.data || [];

  return (
    <section className="py-24 bg-background relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="slide-up">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black tracking-widest uppercase">
                {t("best_sellers.badge")}
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                {t("best_sellers.title")}
              </h2>
              <p className="text-lg text-muted-foreground font-medium max-w-2xl">
                {t("best_sellers.description")}
              </p>
            </div>
            <Link href="/products" className="shrink-0">
              <Button
                variant="outline"
                className="h-12 px-8 rounded-xl font-black gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                {t("best_sellers.view_all")}
                <ChevronRightIcon className="w-5 h-5 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.length > 0
            ? products.map((item: Product, i: number) => {
                const localizedUses = item.uses
                  ? locale === "ar"
                    ? item.uses.ar
                    : item.uses.en
                  : [];
                const rating = Math.round(item.ratingsAverage || 5);

                return (
                  <ScrollReveal key={item._id} animation="slide-up" delay={i * 100}>
                    <Card className="group flex flex-col bg-card hover:shadow-2xl hover:border-primary/50 transition-all duration-500 rounded-4xl overflow-hidden border-border/50 h-full relative cursor-pointer hover:scale-[1.02]">
                      
                      {/* Image container & hover overlays */}
                      <div className="aspect-square bg-secondary/30 dark:bg-secondary/10 relative overflow-hidden flex items-center justify-center p-8">
                        {/* Wishlist Button (Start corner) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          title="add to wishlist"
                          aria-label="add to wishlist"
                          className="absolute top-4 inset-s-4 z-20 w-10 h-10 bg-background/80 backdrop-blur-md rounded-full flex items-center justify-center border border-border/50 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors duration-300"
                        >
                          <StarIcon className="w-4 h-4" />
                        </button>

                        {/* Best Seller Badge (End corner) */}
                        <div className="absolute top-4 inset-e-4 z-20 flex flex-col gap-2">
                          <span className="bg-primary text-primary-foreground text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-md shadow-sm">
                            {t("best_sellers.badge")}
                          </span>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-foreground/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-10 backdrop-blur-[2px]">
                          <Link href={`/products/${item._id}`}>
                            <div className="bg-background/90 text-foreground hover:bg-primary hover:text-primary-foreground rounded-full p-3 transition-colors duration-300 shadow-lg cursor-pointer">
                              <EyeIcon className="w-5 h-5" />
                            </div>
                          </Link>
                        </div>

                        {/* Product Image */}
                        {item.imageCover ? (
                          <Image
                            src={item.imageCover}
                            alt={getLocalizedValue(item.title, locale)}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-contain group-hover:scale-110 transition-transform duration-500 p-8"
                            loading="lazy"
                          />
                        ) : (
                          <PackageIcon className="w-24 h-24 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-500" />
                        )}
                      </div>

                      {/* Card details */}
                      <div className="p-6 flex flex-col grow">
                        {/* Category Name */}
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                          {typeof item.category === "object" &&
                          item.category &&
                          "name" in item.category
                            ? getLocalizedValue(
                                (item.category as { name: Record<string, string> }).name,
                                locale,
                              )
                            : ""}
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-black text-foreground mb-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300">
                          {getLocalizedValue(item.title, locale)}
                        </h3>

                        {/* Uses Tags Grid */}
                        {localizedUses && localizedUses.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {localizedUses.slice(0, 2).map((use: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-[10px] font-bold text-muted-foreground border border-border/50 rounded-md px-2.5 py-0.5 bg-secondary/50 dark:bg-secondary/15"
                              >
                                {use}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Footer wrapper: Price & Ratings */}
                        <div className="mt-auto border-t border-border/40 pt-4 flex items-end justify-between">
                          {/* Price */}
                          <div className="text-2xl font-black text-primary tracking-tight">
                            {item.priceRange?.min || 0}{" "}
                            <span className="text-sm font-medium text-muted-foreground">
                              {t("common.currency")}
                            </span>
                          </div>

                          {/* Ratings column */}
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <StarIcon
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= rating ? "text-warning" : "text-border dark:text-muted/50"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-muted-foreground font-semibold">
                              {item.ratingsQuantity
                                ? `${item.ratingsQuantity} ${t("best_sellers.reviews_label")}`
                                : t("best_sellers.reviews_label")}
                            </span>
                          </div>
                        </div>

                        {/* Add to Cart button */}
                        <Link href={`/products/${item._id}`} className="mt-4 block w-full">
                          <Button className="w-full h-12 bg-foreground text-background hover:bg-primary hover:text-primary-foreground font-black rounded-xl transition-all duration-300 flex justify-center items-center gap-2 shadow-sm hover:shadow-lg">
                            <ShoppingCartIcon className="w-4 h-4" />
                            {t("common.add_to_cart")}
                          </Button>
                        </Link>
                      </div>

                    </Card>
                  </ScrollReveal>
                );
              })
            : [1, 2, 3, 4].map((i: number) => (
                <div key={i} className="aspect-square bg-secondary animate-pulse rounded-3xl" />
              ))}
        </div>
      </div>
    </section>
  );
}
