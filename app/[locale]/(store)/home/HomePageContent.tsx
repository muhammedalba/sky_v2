import dynamic from "next/dynamic";
import HeroSection from "./sections/HeroSection";
import StatsBar from "./sections/StatsBar";
import TrustedBy from "@/components/home/TrustedBy";

// --- Sections Below the Fold (Dynamically Imported) ---
const CategoriesSection = dynamic(
  () => import("./sections/CategoriesSection"),
  {
    loading: () => <div className="h-96 animate-pulse bg-secondary/50" />,
  },
);
const FeaturedProductsSection = dynamic(
  () => import("./sections/FeaturedProductsSection"),
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
const WhyDifferenceSection = dynamic(
  () => import("./sections/WhyDifferenceSection"),
  {
    loading: () => <div className="h-96 animate-pulse bg-background" />,
  },
);
const StatsHighlightSection = dynamic(
  () => import("./sections/StatsHighlightSection"),
  {
    loading: () => <div className="h-48 animate-pulse bg-background" />,
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

      {/* 3. CORE CATEGORIES (Below the Fold - Dynamic Import) */}
      <CategoriesSection  />

      {/* 4. BEST SELLERS (Below the Fold - Dynamic Import) */}
      <FeaturedProductsSection  />

      {/* 5. PROMO BANNER (Below the Fold - Dynamic Import) */}
      <PromoBannerSection />

      {/* 5b. WHY IS THE DIFFERENCE (Below the Fold - Dynamic Import) */}
      <WhyDifferenceSection />



      {/* 5c. STATS HIGHLIGHT (Below the Fold - Dynamic Import) */}
      <StatsHighlightSection />

      {/* 7. CUSTOMER TESTIMONIALS (Below the Fold - Dynamic Import) */}
      <TestimonialsSection />

      {/* 8. FEATURED PROJECTS (Below the Fold - Dynamic Import) */}
      <FeaturedProjectsSection />
    </div>
  );
}
