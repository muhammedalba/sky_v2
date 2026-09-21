import HeroSection from "./sections/HeroSection";
import StatsBar from "./sections/StatsBar";
import TrustedBy from "@/components/home/TrustedBy";
import CategoriesSection from "./sections/CategoriesSection";
import FeaturedProductsSection from "./sections/FeaturedProductsSection";
import FeaturedProjectsSection from "./sections/FeaturedProjectsSection";
import TestimonialsSection from "./sections/TestimonialsSection";
import StatsHighlightSection from "./sections/StatsHighlightSection";
import WhyDifferenceSection from "./sections/WhyDifferenceSection";
import PromoBannerSection from "./sections/PromoBannerSection";

interface HomePageContentProps {
  locale: "ar" | "en";
}

export default function HomePageContent({ locale }: HomePageContentProps) {
  return (
    <div className="flex flex-col min-h-screen max-w-350 mx-auto">
      {/* 1. HERO SECTION (Above the Fold - Server Component) */}
      <HeroSection locale={locale} />

      {/* Stats Bar (Above the Fold - Server Component) */}
      <StatsBar locale={locale} />

      {/* 2. TRUST INDICATORS (Above the Fold - Server Component) */}
      <TrustedBy locale={locale} />

      {/* 3. CORE CATEGORIES (Below the Fold - Server Component) */}
      <CategoriesSection locale={locale} />

      {/* 4. BEST SELLERS (Below the Fold - Server Component) */}
      <FeaturedProductsSection locale={locale} />

      {/* 5. PROMO BANNER (Below the Fold - Server Component) */}
      <PromoBannerSection locale={locale} />

      {/* 5b. WHY IS THE DIFFERENCE (Below the Fold - Server Component) */}
      <WhyDifferenceSection locale={locale} />



      {/* 5c. STATS HIGHLIGHT (Below the Fold - Server Component) */}
      <StatsHighlightSection locale={locale} />

      {/* 7. CUSTOMER TESTIMONIALS (Below the Fold - Server Component) */}
      <TestimonialsSection locale={locale} />

      {/* 8. FEATURED PROJECTS (Below the Fold - Server Component) */}
      <FeaturedProjectsSection locale={locale} />
    </div>
  );
}
