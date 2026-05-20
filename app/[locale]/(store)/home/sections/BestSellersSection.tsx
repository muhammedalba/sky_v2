"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/shared/ui/Button";
import { Icons } from "@/shared/ui/Icons";
import { Card } from "@/shared/ui/Card";
import { useState, useRef, useEffect } from "react";
import { useProducts } from "@/features/products/hooks/useProducts";
import { Product } from "@/types";
import { getLocalizedValue } from "@/lib/utils";

const ScrollReveal = ({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "50px" },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const getTranslate = () => {
    if (direction === "up") return "translate-y-12";
    if (direction === "down") return "-translate-y-12";
    if (direction === "left") return "translate-x-12";
    if (direction === "right") return "-translate-x-12";
    return "";
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0 translate-x-0" : `opacity-0 ${getTranslate()}`} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default function BestSellersSection({ locale }: { locale: string }) {
  const t = useTranslations("home");
  const { data: productsData } = useProducts({ limit: 4 });
  const products = productsData?.data || [];

  return (
    <section className="py-24 bg-background relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
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
                <Icons.ChevronRight className="w-5 h-5 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.length > 0
            ? products.map((item: Product, i: number) => (
                <ScrollReveal key={item._id} direction="up" delay={i * 100}>
                  <Card className="group flex flex-col bg-card hover:shadow-2xl hover:border-primary/50 transition-all duration-500 rounded-3xl overflow-hidden border-border/50 h-full relative cursor-pointer">
                    <button className="absolute top-4 left-4 z-20 w-10 h-10 bg-background/80 backdrop-blur-md rounded-full flex items-center justify-center border border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                      <Icons.Star className="w-4 h-4" />
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
                        <Icons.Package className="w-24 h-24 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-500" />
                      )}
                      <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
                        <Link href={`/products/${item._id}`}>
                          <Button className="w-full bg-foreground text-background hover:bg-primary font-black shadow-xl">
                            <Icons.ShoppingCart className="w-4 h-4 ml-2" />{" "}
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
                              <Icons.Star key={s} className="w-3 h-3 fill-current" />
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
