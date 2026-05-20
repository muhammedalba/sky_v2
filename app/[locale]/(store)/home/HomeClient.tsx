"use client";

import dynamic from "next/dynamic";
import TrustedBy from "@/components/home/TrustedBy";
import HeroSection from "./sections/HeroSection";

// --- Sections Below the Fold (Dynamically Imported) ---
const CategoriesSection = dynamic(() => import("./sections/CategoriesSection"), {
  loading: () => <div className="h-96 animate-pulse bg-secondary/50" />,
});
const BestSellersSection = dynamic(() => import("./sections/BestSellersSection"), {
  loading: () => <div className="h-96 animate-pulse bg-background" />,
});
const PromoBannerSection = dynamic(() => import("./sections/PromoBannerSection"), {
  loading: () => <div className="h-64 animate-pulse bg-background" />,
});
const WhyChooseUsSection = dynamic(() => import("./sections/WhyChooseUsSection"), {
  loading: () => <div className="h-96 animate-pulse bg-secondary/50" />,
});
const TestimonialsSection = dynamic(() => import("./sections/TestimonialsSection"), {
  loading: () => <div className="h-96 animate-pulse bg-background" />,
});
const FeaturedProjectsSection = dynamic(() => import("./sections/FeaturedProjectsSection"), {
  loading: () => <div className="h-96 animate-pulse bg-background" />,
});

export default function HomeClient({ locale }: { locale: string }) {
  return (
    <div className="flex flex-col min-h-screen">
      <style>{`
        /* Global CSS reset/utilities for the homepage */
        .title-gradient {
          background: linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary)/0.6));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee { animation: marquee 30s linear infinite; }
        [dir="rtl"] .animate-marquee { animation-direction: reverse; }
        .mask-image-fade { 
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); 
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); 
        }
        
        /* Custom Scrollbar for horizontal lists if needed */
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* 1. HERO SECTION (Above the Fold - Static Import) */}
      <HeroSection />

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
