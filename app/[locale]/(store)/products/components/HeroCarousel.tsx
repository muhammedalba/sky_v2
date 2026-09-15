"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useTrans } from "@/shared/hooks/useTrans";
import { useCarousel } from "@/features/marketing/hooks/useCarousel";
import { Carousel } from "@/types";
import { DEFAULT_CAROUSEL_PARAMS } from "@/features/products/storefrontQueryDefaults";
import {
  ChevronLeftIcon as ChevronLeft,
  ChevronRightIcon as ChevronRight,
  SparklesIcon as Sparkles,
} from "@/shared/ui/Icons";

// ─── Skeleton ────────────────────────────────────────────────────
function HeroCarouselSkeleton() {
  return (
    <div className="relative rounded-3xl overflow-hidden aspect-4/3 md:aspect-16/7 lg:aspect-21/9 border border-border/50 bg-muted animate-pulse" />
  );
}

// ─── Main Component ───────────────────────────────────────────────

/**
 * Self-contained Hero Carousel.
 * Fetches its own slide data via useCarousel — no props required.
 * On first load the SSR-prefetched cache provides data immediately (no flash).
 */
export default function HeroCarousel() {
  const t = useTranslations("store.productsPage");
  const getTrans = useTrans();
  const { data: carouselData, isLoading } = useCarousel(DEFAULT_CAROUSEL_PARAMS);
  const slides = (carouselData?.data || []) as Carousel[];
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (!slides.length) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const onPrev = () =>
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const onNext = () =>
    setActiveSlide((prev) => (prev + 1) % slides.length);
  const onDotClick = (index: number) => setActiveSlide(index);

  if (isLoading) return <HeroCarouselSkeleton />;

  if (slides.length === 0) {
    return (
      <div className="relative rounded-3xl overflow-hidden py-16 sm:py-24 px-6 sm:px-12 text-center bg-card border border-border/50 shadow-xs">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px] pointer-events-none" />
        <h1 className="text-3xl sm:text-5xl font-black mb-4 title-gradient">
          {t("heroTitle")}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed font-medium">
          {t("heroDesc")}
        </p>
      </div>
    );
  }

  return (
    <div className="relative rounded-3xl overflow-hidden aspect-4/3 md:aspect-16/7 lg:aspect-21/9 border border-border/50 shadow-lg group/carousel">
      {slides.map((slide, idx) => {
        const isActive = idx === activeSlide;
        const slideDesc = getTrans(slide.description);
        return (
          <div
            key={slide._id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <picture className="absolute inset-0 w-full h-full">
              <source
                media="(min-width: 1024px)"
                srcSet={
                  typeof slide.carouselLg === "object"
                    ? slide.carouselLg.url
                    : slide.carouselLg
                }
              />
              <source
                media="(min-width: 640px)"
                srcSet={
                  typeof slide.carouselMd === "object"
                    ? slide.carouselMd.url
                    : slide.carouselMd
                }
              />
              <img
                src={
                  typeof slide.carouselSm === "object"
                    ? slide.carouselSm.url
                    : slide.carouselSm
                }
                alt={slideDesc || "Hero Banner"}
                className="object-cover w-full h-full"
                fetchPriority={idx === 0 ? "high" : "low"}
              />
            </picture>
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-transparent" />
            <div className="absolute bottom-6 sm:bottom-12 lg:bottom-16 left-6 sm:left-12 lg:left-16 right-6 sm:right-12 lg:right-16 text-white z-20 space-y-2 sm:space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-primary-foreground">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                {t("featuredSpotlight")}
              </div>
              <p className="text-sm sm:text-2xl lg:text-3xl font-black leading-tight drop-shadow-md">
                {slideDesc}
              </p>
            </div>
          </div>
        );
      })}
      {slides.length > 1 && (
        <>
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 backdrop-blur-xs border border-white/10 text-white hover:bg-primary transition-all scale-90 opacity-0 group-hover/carousel:opacity-100 group-hover/carousel:scale-100 duration-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 backdrop-blur-xs border border-white/10 text-white hover:bg-primary transition-all scale-90 opacity-0 group-hover/carousel:opacity-100 group-hover/carousel:scale-100 duration-300"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => onDotClick(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeSlide ? "w-6 bg-primary" : "w-2 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}