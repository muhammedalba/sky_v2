"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/shared/ui/Button";
import {
  ChevronRightIcon,
  EyeIcon,
  HeartIcon,
  PackageIcon,
  ShoppingCartIcon,
  StarIcon,
} from "@/shared/ui/Icons";
import { Card } from "@/shared/ui/Card";
import { useProducts } from "@/features/products/hooks/useProducts";
import { Product } from "@/types";
import { getLocalizedValue, truncate } from "@/lib/utils";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import ImageWithFallback from "@/shared/ui/image/ImageWithFallback";
import Badge from "@/shared/ui/Badge";
import { Tooltip } from "@/shared/ui/Tooltip";

export default function BestSellersSection({ locale }: { locale: string }) {
  const t = useTranslations("home");
  const { data: productsData } = useProducts({ limit: 4, isFeatured: true });
  const products = productsData?.data || [];

  return (
    <section className="py-24 bg-background relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="slide-up">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
            <div className="space-y-4 w-full">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black tracking-widest uppercase">
                {t("best_sellers.badge")}
              </div>
              <h2 className="text-4xl md:text-5xl font-black title-gradient tracking-tight">
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
                const localizedUses = item.uses ? item.uses : [];

                return (
                  <ScrollReveal
                    key={item._id}
                    animation="slide-up"
                    delay={i * 100}
                  >
                    <Card className="group flex flex-col bg-card hover:shadow-2xl hover:border-primary/50 transition-all duration-500 rounded-4xl overflow-hidden border-border/50 h-full relative cursor-pointer hover:scale-[1.02]">
                      {/* Image container & hover overlays */}
                      <div className="aspect-square bg- relative overflow-hidden flex items-center justify-center">
                        {/* Wishlist Button (Start corner) */}
                        <div
                          dir={"ltr"}
                          className="absolute top-4 inset-s-4 z-30 flex flex-col gap-2 md:-translate-x-24 md:group-hover:translate-x-4 transition-all duration-300"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            title="add to wishlist"
                            aria-label="add to wishlist"
                            className="cursor-pointer w-10 h-10 bg-background/80 backdrop-blur-md rounded-full flex items-center justify-center text-foreground hover:bg-primary/70 hover:text-primary-foreground transition-colors duration-300"
                          >
                            <Tooltip
                              position="inset"
                              content={'t("common.add_to_wishlist")'}
                            >
                              {" "}
                              <HeartIcon className="w-4 h-4" />
                            </Tooltip>{" "}
                          </button>
                          {/* Quick view */}
                          <Link
                            href={`/products/${item.sku}`}
                            title="add to wishlist"
                            aria-label="add to wishlist"
                            className="cursor-pointer w-10 h-10 bg-background/80 backdrop-blur-md rounded-full flex items-center justify-center text-foreground hover:bg-primary/70 hover:text-primary-foreground transition-colors duration-300"
                          >
                            <Tooltip
                              position="inset"
                              content={'t("common.add_to_wishlist")'}
                            >
                              <EyeIcon className="w-5 h-5" />
                            </Tooltip>{" "}
                          </Link>
                        </div>
                        {/* Best Seller Badge (End corner) */}
                        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                          <Badge
                            variant={"warning"}
                            className="text-[10px] bg-warning text-warning-foreground font-black tracking-wider uppercase px-2.5 py-1 rounded-md shadow-sm"
                          >
                            {t("best_sellers.badge")}
                          </Badge>
                        </div>

                        {/* Product Image */}
                        {item.imageCover ? (
                          <ImageWithFallback
                            src={item.imageCover}
                            alt={getLocalizedValue(item.title, locale)}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-contain group-hover:scale-110 transition-transform duration-500 "
                            loading="lazy"
                          />
                        ) : (
                          <PackageIcon className="w-24 h-24 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-500" />
                        )}
                      </div>

                      {/* Card details */}
                      <div className="p-6 flex flex-col grow">
                        {/* Category Name */}
                        <div className="border-b border-border/40 flex flex-wrap gap-2">
                          <Badge
                            variant="default"
                            className="text-xs  uppercase tracking-wider w-fit"
                          >
                            {typeof item.category === "object" &&
                            item.category &&
                            "name" in item.category
                              ? getLocalizedValue(
                                  (
                                    item.category as {
                                      name: Record<string, string>;
                                    }
                                  ).name,
                                  locale,
                                )
                              : ""}
                          </Badge>
                          <Badge
                            variant="default"
                            className="text-xs   uppercase tracking-wider mb-2 w-fit"
                          >
                            {typeof item.brand === "object" &&
                            item.brand &&
                            "name" in item.brand
                              ? getLocalizedValue(
                                  (
                                    item.brand as {
                                      name: Record<string, string>;
                                    }
                                  ).name,
                                  locale,
                                )
                              : ""}
                          </Badge>
                        </div>
                        {/* Title */}
                        <h3 className="text-lg font-semibold text-foreground/90 my-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300">
                          {truncate(getLocalizedValue(item.title, locale), 30)}
                        </h3>
                        <p className="text-sm font-normal text-foreground/60 mb-3">
                          {truncate(
                            getLocalizedValue(item.description, locale),
                            50,
                          )}
                        </p>

                        {/* Uses Tags Grid */}
                        {localizedUses && localizedUses.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {localizedUses
                              .slice(0, 2)
                              .map((use: string, idx: number) => (
                                <Badge
                                  variant={"secondary"}
                                  key={idx}
                                  // className="text-[10px] font-bold text-muted-foreground border border-border/50 rounded-md px-2.5 py-0.5 bg-secondary/50 dark:bg-secondary/15"
                                >
                                  {use}
                                </Badge>
                              ))}
                          </div>
                        )}

                        {/* Footer wrapper: Price & Ratings */}
                        <div className="mt-auto border-t border-border/40 pt-4 flex items-end justify-between">
                          {/* Price */}
                          <div className="text-2xl font-black text-primary tracking-tight">
                            {item.priceRange?.min || 0}
                            <span className="text-sm font-medium text-muted-foreground">
                              {t("common.currency")}
                            </span>
                          </div>

                          {/* Ratings column */}
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < Math.round(item.ratingsAverage || 0)
                                      ? "text-amber-400"
                                      : "text-zinc-200"
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
                        <Link
                          href={`/products/${item.slug}`}
                          className="mt-4 block w-full"
                        >
                          <Button
                            variant={"default"}
                            size="lg"
                            className="w-full hover:bg-background/80 hover:text-primary font-black hover:border-primary border border-border shadow-sm hover:shadow-lg"
                          >
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
                <div
                  key={i}
                  className="aspect-square bg-secondary animate-pulse rounded-3xl"
                />
              ))}
        </div>
      </div>
    </section>
  );
}
