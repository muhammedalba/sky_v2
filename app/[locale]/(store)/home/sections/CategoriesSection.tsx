"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/shared/ui/Button";
import { Icons } from "@/shared/ui/Icons";
import { useState, useRef, useEffect } from "react";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { Category } from "@/types";
import { getLocalizedValue, truncate } from "@/lib/utils";

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

const GlowCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px z-10 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.08), transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
};

export default function CategoriesSection({ locale }: { locale: string }) {
  const t = useTranslations("home");
  const { data: categoriesData } = useCategories({ limit: 4 });
  const categories = categoriesData?.data || [];

  return (
    <section className="py-24 bg-secondary/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-16">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black title-gradient">
                {t("categories.title")}
              </h2>
              <p className="text-lg text-muted-foreground font-medium max-w-2xl">
                {t("categories.description")}
              </p>
            </div>
            <Link href="/products">
              <Button
                variant="ghost"
                className="font-black text-primary hover:bg-primary/10 gap-2"
              >
                {t("categories.view_all")}{" "}
                <Icons.ChevronRight className="w-5 h-5 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[400px]">
          {categories.length > 0 ? (
            <>
              <ScrollReveal delay={100} className="md:col-span-2 h-full">
                <Link
                  href={`/products?category=${categories[0]._id}`}
                  className={`block h-full`}
                >
                  <GlowCard className="h-full group rounded-[2.5rem] bg-card border border-border/50 shadow-lg hover:shadow-2xl transition-all duration-700 overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-700 z-10" />
                    <div className="absolute top-8 right-8 z-20 bg-background/90 backdrop-blur-md px-4 py-2 rounded-full border border-border/50 text-sm font-black shadow-sm flex items-center gap-2">
                      <Icons.Star className="w-4 h-4 text-warning" />
                      {t("categories.featured_label")}
                    </div>
                    <div
                      style={{ backgroundImage: `url(${categories[0].image})` }}
                      className="bg-cover bg-center bg-no-repeat h-full inset-0 flex flex-col justify-end p-10 z-20 bg-linear-to-t from-background via-background/80 to-transparent"
                    >
                      <div className="absolute inset-0 z-1 bg-black/60" /> 
                      <h3 className="text-4xl md:text-5xl font-black text-white mb-4 z-1">
                        {truncate(getLocalizedValue(categories[0].name, locale), 15)}
                      </h3>
                      <p className="text-white/50 font-medium max-w-md mb-6  z-1">
                        {t("categories.items.waterproofing.desc")}
                      </p>
                      <div className=" z-1 flex bg-primary/20 px-3 py-1.5 backdrop-blur-md rounded-lg w-fit items-center gap-4 text-primary font-black group-hover:translate-x-2 rtl:group-hover:-translate-x-2 transition-transform">
                        {t("categories.shop_category")}
                        <Icons.ChevronRight className="w-5 h-5 rtl:rotate-180" />
                      </div>
                    </div>
                    <Icons.Package className="absolute left-10 top-1/2 -translate-y-1/2 w-64 h-64 text-muted/20 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700" />
                  </GlowCard>
                </Link>
              </ScrollReveal>

              <div className="flex flex-col gap-6 h-full">
                {categories.slice(1, 3).map((cat: Category, i: number) => (
                  <ScrollReveal
                    key={cat._id}
                    delay={200 + i * 100}
                    className="h-full"
                  >
                    <Link
                      href={`/products?category=${cat._id}`}
                      className="block h-full"
                    > 
                      <GlowCard className="h-full group rounded-[2.5rem] bg-card border border-border/50 shadow-lg hover:shadow-2xl transition-all duration-700 overflow-hidden">
                        <div
                          style={{ backgroundImage: `url(${cat.image})` }}
                          className={`h-full inset-0 relative bg-linear-to-br bg-cover bg-center bg-no-repeat ${i === 0 ? "from-warning/5" : "from-blue-500/5"} to-transparent z-10`}
                        />
                          <div className="absolute inset-0 z-10 bg-black/60" /> 
                        <div className="absolute inset-0 flex flex-col justify-end p-8 z-20">
                          <h3 className="text-2xl font-black text-white mb-2">
                            {truncate(getLocalizedValue(cat.name, locale), 15)}
                          </h3>
                          <div className="flex items-center justify-between mt-4">
                            <span className="text-white/80 font-medium text-sm">
                              {cat.productsCount || 0} {t("best_sellers.badge")}
                            </span>
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-sm">
                              <Icons.ChevronRight className="w-5 h-5 rtl:rotate-180" />
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
            <div className="col-span-full flex items-center justify-center h-64 text-muted-foreground font-black">
              {t("categories.title")}...
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
