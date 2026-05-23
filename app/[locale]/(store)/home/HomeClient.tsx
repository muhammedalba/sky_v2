"use client";

import dynamic from "next/dynamic";
import TrustedBy from "@/components/home/TrustedBy";
import HeroSection from "./sections/HeroSection";
import StatsBar from "./sections/StatsBar";

// --- Sections Below the Fold (Dynamically Imported) ---
const CategoriesSection = dynamic(
  () => import("./sections/CategoriesSection"),
  {
    loading: () => <div className="h-96 animate-pulse bg-secondary/50" />,
  },
);
const BestSellersSection = dynamic(
  () => import("./sections/BestSellersSection"),
  {
    loading: () => <div className="h-96 animate-pulse bg-background" />,
  },
);
const PromoBannerSection = dynamic(
  () => import("./sections/PromoBannerSection"),
  {
    loading: () => <div className="h-64 animate-pulse bg-background" />,
  },
);
const WhyChooseUsSection = dynamic(
  () => import("./sections/WhyChooseUsSection"),
  {
    loading: () => <div className="h-96 animate-pulse bg-secondary/50" />,
  },
);
const TestimonialsSection = dynamic(
  () => import("./sections/TestimonialsSection"),
  {
    loading: () => <div className="h-96 animate-pulse bg-background" />,
  },
);
const FeaturedProjectsSection = dynamic(
  () => import("./sections/FeaturedProjectsSection"),
  {
    loading: () => <div className="h-96 animate-pulse bg-background" />,
  },
);

export default function HomeClient({ locale }: { locale: string }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION (Above the Fold - Static Import) */}
      <HeroSection />

      {/* Stats Bar (Above the Fold - Static Import) */}
      <StatsBar />

      {/* 2. TRUST INDICATORS (Above the Fold - Static Import) */}
      <TrustedBy />

      {/* 3. CORE CATEGORIES (Below the Fold - Dynamic Import) */}
      <CategoriesSection locale={locale} />

      {/* 4. BEST SELLERS (Below the Fold - Dynamic Import) */}
      <BestSellersSection locale={locale} />

      {/* 5. PROMO BANNER (Below the Fold - Dynamic Import) */}
      <PromoBannerSection />

      {/* 6. WHY CHOOSE US (Below the Fold - Dynamic Import) */}
      <WhyChooseUsSection />

      {/* 7. CUSTOMER TESTIMONIALS (Below the Fold - Dynamic Import) */}
      <TestimonialsSection />

      {/* 8. FEATURED PROJECTS (Below the Fold - Dynamic Import) */}
      <FeaturedProjectsSection />
    </div>
  );
}
