"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useBrands } from "@/features/brands/hooks/useBrands";
import { useTrans } from "@/shared/hooks/useTrans";
import { useMemo } from "react";
import { Brand } from "@/types";
import Badge from "@/shared/ui/Badge";
import { ShieldIcon } from "@/shared/ui/Icons";
const EMPTY_BRANDS: Brand[] = [];

// 1.Separate styles from the component to prevent them from being re-injected into the DOM with every render.
const MarqueeStyles = () => (
  <style>{`
    @keyframes marquee {
      0% { transform: translateX(0%); }
      100% { transform: translateX(-50%); }
    }
    .animate-marquee {
      animation: marquee 60s linear infinite;
    }
    [dir="rtl"] .animate-marquee {
      animation: marquee-rtl 60s linear infinite;
    }
    @keyframes marquee-rtl {
      0% { transform: translateX(0%); }
      100% { transform: translateX(50%); }
    }
  `}</style>
);

export default function TrustedBy() {
  const t = useTranslations("home");
  const getTrans = useTrans();
  const { data: brandsResponse, isLoading } = useBrands({ all_langs: false });
  const brands = brandsResponse?.data || EMPTY_BRANDS;

  // 2. useMemo to save heavy DOM elements in memory
  const marqueeContent = useMemo(() => {
    if (!brands.length) return null;

    // use 6 groups instead of 7 (even number).
    // because the animation moves by 50%, the even number ensures that the movement ends at the beginning of a complete group, preventing interruption (Seamless Loop).
    return [1, 2, 3, 4, 5, 6].map((group, index) => (
      <div
        key={group}
        className="flex gap-5 shrink-0 items-center"
        // 3.Accessibility: hide repeated groups from screen readers
        aria-hidden={index > 0 ? "true" : "false"}
      >
        {brands.map((brand) => (
          <div
            key={brand._id}
            className="flex items-center justify-center min-w-[120px]"
          >
            {brand.image ? (
              <Image
                src={brand.image}
                alt={getTrans(brand.name)}
                width={150}
                height={48}
                className="h-12 object-contain max-w-[150px]"
                loading="lazy"
              />
            ) : (
              <div className="px-8 py-5 rounded-2xl bg-card border border-border/40 shadow-2xs hover:border-primary/25 hover:shadow-md transition-all shrink-0 flex items-center justify-center min-w-40 h-20">
                <span className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-muted-foreground/80 hover:text-primary transition-colors">
                  {getTrans(brand.name)}
                  <Image
                    src={brand.image ?? ""}
                    alt={getTrans(brand.name)}
                    width={150}
                    height={48}
                    className="h-12 object-contain max-w-[150px]"
                    loading="lazy"
                  />
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    ));
  }, [brands, getTrans]);

  if (isLoading || brands.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 border-t border-border/30 bg-muted/5 overflow-hidden relative z-10">
      <MarqueeStyles />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8">
          <Badge variant={'success'} className="p-1 px-4 rounded-full text-xs sm:text-sm md:text-md font-black   shrink-0 text-center hover:bg-success/10 hover:text-success ">
            <ShieldIcon className="w-5 h-5 text-success me-1" />
            {t("trust.approved_distributors")}
          </Badge>
          <div className="flex flex-col items-center gap-2">
            <p className="title-gradient text-md sm:text-xl md:text-3xl  font-black   shrink-0 text-center">
              {t("trust.label")}
            </p>
            <div className="w-24 h-0.5 bg-primary/80 rounded-full mt-2.5 mx-auto" />
          </div>
          <div className="w-full relative flex overflow-hidden mask-image-fade">
            <div className="flex whitespace-nowrap animate-marquee items-center gap-5 hover:opacity-50 hover:grayscale grayscale-0 opacity-100 transition-all duration-500">
              {marqueeContent}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
