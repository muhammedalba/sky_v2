"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/shared/ui/Button";
import { ChevronRightIcon, PackageIcon, ShoppingCartIcon, StarIcon } from "@/shared/ui/Icons";
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
                className="h-12 px-8 rounded-xl font-black gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                {t("best_sellers.view_all")}
                <ChevronRightIcon className="w-5 h-5 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.length > 0
            ? products.map((item: Product, i: number) => (
                <ScrollReveal key={item._id} animation="slide-up" delay={i * 500}>
                  <Card className="group flex flex-col bg-card hover:shadow-2xl hover:border-primary/50 transition-all duration-500 rounded-3xl overflow-hidden border-border/50 h-full relative cursor-pointer">
                    <button type="button" onClick={() => {}} title='add to wishlist' aria-label='add to wishlist' className="absolute top-4 left-4 z-20 w-10 h-10 bg-background/80 backdrop-blur-md rounded-full flex items-center justify-center border border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                      <StarIcon className="w-4 h-4" />
                    </button>

                    <div className="aspect-square bg-secondary relative overflow-hidden flex items-center justify-center p-8">
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
                      <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
                        <Link href={`/products/${item._id}`}>
                          <Button className="w-full bg-foreground text-background hover:bg-primary font-black shadow-xl">
                            <ShoppingCartIcon className="w-4 h-4 ml-2" />{" "}
                            {t("common.add_to_cart")}
                          </Button>
                        </Link>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col grow">
                      <div className="text-xs font-black text-muted-foreground mb-2">
                        {typeof item.category === "object" &&
                        item.category &&
                        "name" in item.category
                          ? getLocalizedValue(
                              (item.category as { name: Record<string, string> }).name,
                              locale,
                            )
                          : ""}
                      </div>
                      <h3 className="text-lg font-black text-foreground mb-4 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                        {getLocalizedValue(item.title, locale)}
                      </h3>

                      <div className="mt-auto flex items-end justify-between pt-4 border-t border-border/50">
                        <div className="flex flex-col gap-1">
                          <div className="flex text-warning">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <StarIcon key={s} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground font-medium">
                            {t("best_sellers.reviews_label")}
                          </span>
                        </div>
                        <div className="text-xl font-black text-foreground">
                          {item.priceRange?.min || 0}{" "}
                          <span className="text-sm text-muted-foreground">
                            {t("common.currency")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </ScrollReveal>
              ))
            : [1, 2, 3, 4].map((i: number) => (
                <div key={i} className="aspect-square bg-secondary animate-pulse rounded-3xl" />
              ))}
        </div>
      </div>
    </section>
  );
}
