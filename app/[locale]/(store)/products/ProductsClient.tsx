"use client";

import { useState, useEffect, useMemo } from "react";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/features/products/components/storefront/ProductCard";
import { Input } from "@/shared/ui/Input";
import { Button } from "@/shared/ui/Button";
import { Skeleton } from "@/shared/ui/Skeleton";
import Pagination from "@/shared/ui/Pagination";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useSubCategories } from "@/features/categories/hooks/useSubCategories";
import { useBrands } from "@/features/brands/hooks/useBrands";
import { useCarousel } from "@/features/marketing/hooks/useCarousel";
import { Product, Category, SubCategory, Brand, Carousel } from "@/types";
import { Link } from "@/navigation";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { useTrans } from "@/shared/hooks/useTrans";
import {
  SlidersHorizontal,
  Search,
  X,
  ChevronDown,
  Tag,
  Briefcase,
  Coins,
  RotateCcw,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Award,
  Filter,
} from "lucide-react";

export default function ProductsClient() {
  const locale = useLocale();
  const getTrans = useTrans();
  const formatCurrency = useFormatCurrency();

  const searchParams = useSearchParams();

  // ─── Filter States ──────────────────────────────────────
  const [page, setPage] = useState(1);
  const [localSearch, setLocalSearch] = useState(() => searchParams?.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams?.get("category") || "");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("-createdAt");

  // Sync state with URL search and category query parameter changes during render to avoid cascading effects
  const currentSearch = searchParams?.get("search") || "";
  const currentCategory = searchParams?.get("category") || "";

  const [prevSearch, setPrevSearch] = useState(currentSearch);
  const [prevCategory, setPrevCategory] = useState(currentCategory);

  if (currentSearch !== prevSearch) {
    setLocalSearch(currentSearch);
    setPrevSearch(currentSearch);
  }
  if (currentCategory !== prevCategory) {
    setSelectedCategory(currentCategory);
    setPrevCategory(currentCategory);
  }

  // Mobile Filter Drawer toggle
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Carousel Active Slide state
  const [activeSlide, setActiveSlide] = useState(0);

  // Debounce inputs
  const debouncedSearch = useDebounce(localSearch, 500);
  const debouncedMinPrice = useDebounce(minPrice, 600);
  const debouncedMaxPrice = useDebounce(maxPrice, 600);

  const priceRangeMin = debouncedMinPrice
    ? Number(debouncedMinPrice)
    : undefined;
  const priceRangeMax = debouncedMaxPrice
    ? Number(debouncedMaxPrice)
    : undefined;

  // ─── Query Parameters ───────────────────────────────────
  const productQueryParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page,
      limit: 9,
      sort: sortBy,
    };
    if (debouncedSearch) params.keywords = debouncedSearch;
    if (selectedCategory) params.category = selectedCategory;
    if (selectedSubCategory) params.subcategories = selectedSubCategory;
    if (selectedBrand) params.brand = selectedBrand;
    if (priceRangeMin !== undefined) params["pricerange[min]"] = priceRangeMin;
    if (priceRangeMax !== undefined) params["pricerange[max]"] = priceRangeMax;
    return params;
  }, [
    page,
    debouncedSearch,
    selectedCategory,
    selectedSubCategory,
    selectedBrand,
    priceRangeMin,
    priceRangeMax,
    sortBy,
  ]);

  // ─── Data Fetching ──────────────────────────────────────
  const { data: mainCatalogData, isLoading: isCatalogLoading } =
    useProducts(productQueryParams);

  // Best Sellers Query
  const { data: bestSellersData } = useProducts({
    sort: "-totalSold",
    limit: 4,
  });

  // Featured Products Query
  const { data: featuredData } = useProducts({ isFeatured: true, limit: 3 });

  // Categories, Subcategories & Brands
  const { data: categoriesData } = useCategories({ limit: 100 });
  const { data: subCategoriesData } = useSubCategories({
    category: selectedCategory || undefined,
    limit: 100,
  });
  const { data: brandsData } = useBrands({ limit: 100 });

  // Responsive Carousel Query
  const { data: carouselData } = useCarousel({ isActive: true });

  const categoriesList = useMemo(
    () => (categoriesData?.data || []) as Category[],
    [categoriesData?.data],
  );
  const subCategoriesList = useMemo(
    () => (subCategoriesData?.data || []) as SubCategory[],
    [subCategoriesData?.data],
  );
  const brandsList = useMemo(
    () => (brandsData?.data || []) as Brand[],
    [brandsData?.data],
  );
  const carouselSlides = useMemo(
    () => (carouselData?.data || []) as Carousel[],
    [carouselData?.data],
  );

  const bestSellersList = useMemo(
    () => (bestSellersData?.data || []) as Product[],
    [bestSellersData?.data],
  );
  const featuredList = useMemo(
    () => (featuredData?.data || []) as Product[],
    [featuredData?.data],
  );

  // ─── Carousel Autoplay Timer ────────────────────────────
  useEffect(() => {
    if (!carouselSlides.length) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselSlides]);

  // Reset Filters
  const handleClearAll = () => {
    setLocalSearch("");
    setSelectedCategory("");
    setSelectedSubCategory("");
    setSelectedBrand("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("-createdAt");
    setPage(1);
  };

  const hasActiveFilters = !!(
    debouncedSearch ||
    selectedCategory ||
    selectedSubCategory ||
    selectedBrand ||
    minPrice ||
    maxPrice
  ); // Localization labels
  const trans = {
    heroTitle:
      locale === "ar"
        ? "عالم التكنولوجيا والصناعة"
        : "Sky Galaxy Mega Showroom",
    heroDesc:
      locale === "ar"
        ? "استكشف مجموعتنا الفاخرة المعتمدة لدى كبرى الكيانات الصناعية."
        : "Discover leading industrial supplies, components, and tools curated for global leaders.",
    bestSellers:
      locale === "ar" ? "المنتجات الأكثر طلباً" : "Best Selling Masterpieces",
    bestSellersDesc:
      locale === "ar"
        ? "القطع المعتمدة والأكثر كفاءة الموصى بها من المهندسين."
        : "The most efficient, high-performance pieces highly recommended by professionals.",
    featuredTitle:
      locale === "ar" ? "مختاراتنا المتميزة" : "Amethyst Spotlight Collection",
    featuredDesc:
      locale === "ar"
        ? "تصاميم فريدة وأداء متطور يلبي احتياجات الغد."
        : "Asymmetric spotlights of exceptional high-margin components and systems.",
    allProducts:
      locale === "ar" ? "معرض المنتجات الشامل" : "All Products Showroom",
    searchPlaceholder:
      locale === "ar"
        ? "ابحث بالاسم، المواصفات..."
        : "Search components, materials...",
    sortByLabel: locale === "ar" ? "ترتيب حسب" : "Sort By",
    filtersTitle: locale === "ar" ? "خيارات التصفية" : "Filters Panel",
    categories: locale === "ar" ? "الأقسام" : "Categories",
    allCategories: locale === "ar" ? "جميع الأقسام" : "All Categories",
    brands: locale === "ar" ? "العلامات التجارية" : "Brands",
    allBrands: locale === "ar" ? "جميع العلامات" : "All Brands",
    priceRange: locale === "ar" ? "نطاق الأسعار" : "Price Range",
    minPrice: locale === "ar" ? "الأدنى" : "Min",
    maxPrice: locale === "ar" ? "الأقصى" : "Max",
    clearAll: locale === "ar" ? "إعادة ضبط" : "Clear All",
    resultsCount: locale === "ar" ? "منتج تم العثور عليه" : "products found",
    noProducts: locale === "ar" ? "لا توجد نتائج مطابقة" : "No products found",
    noProductsDesc:
      locale === "ar"
        ? "يرجى تجربة تعديل حقول الأسعار أو البحث."
        : "Adjust search tags, price range, or reset selected attributes.",
    trustedBrands:
      locale === "ar" ? "شركاء النجاح والماركات" : "Authorized Brand Ecosystem",
    sorts: [
      {
        value: "-createdAt",
        label: locale === "ar" ? "الأحدث أولاً" : "Newest First",
      },
      {
        value: "-totalSold",
        label: locale === "ar" ? "الأكثر مبيعاً" : "Best Sellers",
      },
      {
        value: "priceRange.min",
        label:
          locale === "ar" ? "السعر: من الأقل للأعلى" : "Price: Low to High",
      },
      {
        value: "-priceRange.min",
        label:
          locale === "ar" ? "السعر: من الأعلى للأقل" : "Price: High to Low",
      },
      {
        value: "-ratingsAverage",
        label: locale === "ar" ? "الأعلى تقييماً" : "Top Rated",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-300 relative overflow-hidden">
      {/* Dynamic Keyframes inject to support smooth infinite marquees */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-rtl {
          0% { transform: translateX(0%); }
          100% { transform: translateX(50%); }
        }
        .animate-marquee-left {
          display: flex;
          width: max-content;
          animation: marquee 35s linear infinite;
        }
        .animate-marquee-right {
          display: flex;
          width: max-content;
          animation: marquee-rtl 35s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: hsl(var(--primary) / 0.15);
          border-radius: 10px;
        }
      `}</style>

      {/* Amethyst and Violet gradient glowing backdrops */}
      <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-[100vh] left-1/4 w-[35rem] h-[35rem] bg-accent/5 rounded-full blur-3xl pointer-events-none z-0" />

      {/* ─── 1. HERO CAROUSEL SECTION ──────────────────────── */}
      <section className="relative pt-24 pb-8 overflow-hidden z-10 bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {carouselSlides.length > 0 ? (
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] md:aspect-[16/7] lg:aspect-[21/9] border border-border/50 shadow-lg group/carousel">
              {/* Slides Track */}
              {carouselSlides.map((slide, idx) => {
                const isActive = idx === activeSlide;
                const slideDesc = getTrans(slide.description);
                return (
                  <div
                    key={slide._id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      isActive ? "opacity-100 z-10" : "opacity-0 z-0"
                    }`}
                  >
                    {/* Picture elements to ensure true native responsive LCP banners */}
                    <picture className="absolute inset-0 w-full h-full">
                      <source
                        media="(min-width: 1024px)"
                        srcSet={slide.carouselLg}
                      />
                      <source
                        media="(min-width: 640px)"
                        srcSet={slide.carouselMd}
                      />
                      <img
                        src={slide.carouselSm}
                        alt={slideDesc || "Hero Banner"}
                        className="object-cover w-full h-full"
                        fetchPriority={idx === 0 ? "high" : "low"}
                      />
                    </picture>

                    {/* Dark gradient blur covering text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-6 sm:p-10 lg:p-14 text-white" />

                    {/* Text overlays */}
                    <div className="absolute bottom-6 sm:bottom-12 lg:bottom-16 left-6 sm:left-12 lg:left-16 right-6 sm:right-12 lg:right-16 text-white z-20 space-y-2 sm:space-y-4 max-w-xl">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-primary-foreground">
                        <Sparkles className="w-3.5 h-3.5 fill-current" />
                        {locale === "ar"
                          ? "أفضل المبيعات"
                          : "Featured Spotlight"}
                      </div>
                      <p className="text-sm sm:text-2xl lg:text-3xl font-black leading-tight drop-shadow-md">
                        {slideDesc}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Slider Arrow Buttons (Visible on Hover) */}
              {carouselSlides.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveSlide(
                        (prev) =>
                          (prev - 1 + carouselSlides.length) %
                          carouselSlides.length,
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 backdrop-blur-xs border border-white/10 text-white hover:bg-primary transition-all scale-90 opacity-0 group-hover/carousel:opacity-100 group-hover/carousel:scale-100 duration-300"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveSlide(
                        (prev) => (prev + 1) % carouselSlides.length,
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 backdrop-blur-xs border border-white/10 text-white hover:bg-primary transition-all scale-90 opacity-0 group-hover/carousel:opacity-100 group-hover/carousel:scale-100 duration-300"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Pagination indicators dots */}
              {carouselSlides.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {carouselSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlide(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === activeSlide
                          ? "w-6 bg-primary"
                          : "w-2 bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Modern static hero fallback if no slides are set
            <div className="relative rounded-3xl overflow-hidden py-16 sm:py-24 px-6 sm:px-12 text-center bg-card border border-border/50 shadow-xs">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
              <h1 className="text-3xl sm:text-5xl font-black mb-4 title-gradient">
                {trans.heroTitle}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed font-medium">
                {trans.heroDesc}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── 2. SHOP BY CATEGORY SECTION (VISUAL SLIDER) ─── */}
      {categoriesList.length > 0 && (
        <section className="py-12 sm:py-16 border-b border-border/30 bg-muted/5 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary fill-current animate-pulse" />
                  {locale === "ar"
                    ? "تصفح بالأقسام والفئات"
                    : "Shop by Category"}
                </h2>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  {locale === "ar"
                    ? "اختر الفئة المفضلة للوصول السريع لقطع الغيار والمعدات الفاخرة."
                    : "Select a collection to filter active premium equipment instantly."}
                </p>
              </div>

              {/* Scroll controller helpers */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const el = document.getElementById("category-track");
                    if (el)
                      el.scrollBy({
                        left: locale === "ar" ? 250 : -250,
                        behavior: "smooth",
                      });
                  }}
                  className="p-2 rounded-xl border border-border/60 bg-background hover:bg-muted text-foreground transition-all active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById("category-track");
                    if (el)
                      el.scrollBy({
                        left: locale === "ar" ? -250 : 250,
                        behavior: "smooth",
                      });
                  }}
                  className="p-2 rounded-xl border border-border/60 bg-background hover:bg-muted text-foreground transition-all active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal sliding track */}
            <div
              id="category-track"
              className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scroll-smooth custom-scrollbar select-none"
            >
              {categoriesList.map((cat) => {
                const catName = getTrans(cat.name);
                const isActive = selectedCategory === cat._id;
                const initials = catName
                  ? catName.slice(0, 2).toUpperCase()
                  : "CG";

                return (
                  <div
                    key={cat._id}
                    onClick={() => {
                      setSelectedCategory(isActive ? "" : cat._id);
                      setSelectedSubCategory("");
                      setPage(1);
                      // Smooth scroll down to the product catalog section
                      const target =
                        document.getElementById("products-showroom");
                      if (target) {
                        target.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }}
                    className="group/cat cursor-pointer flex-shrink-0 w-24 sm:w-32 transition-all duration-300 relative text-center"
                  >
                    {/* Category Image Circle/Square */}
                    <div
                      className={`relative aspect-square w-full rounded-2xl sm:rounded-3xl overflow-hidden border-2 mb-3 flex items-center justify-center transition-all duration-300 shadow-xs ${
                        isActive
                          ? "border-primary ring-4 ring-primary/10 scale-95 shadow-md shadow-primary/10"
                          : "border-border/60 bg-card group-hover/cat:border-primary/45 group-hover/cat:scale-[1.03] group-hover/cat:shadow-md"
                      }`}
                    >
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={catName}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover/cat:scale-110"
                        />
                      ) : (
                        // Absolute Fallback Gradient containing initials
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-accent/5 to-muted-foreground/5 flex items-center justify-center text-primary font-black text-base sm:text-xl tracking-wider select-none">
                          {initials}
                        </div>
                      )}

                      {/* Interactive overlay tint */}
                      <div
                        className={`absolute inset-0 transition-opacity duration-300 ${
                          isActive
                            ? "bg-primary/5"
                            : "bg-black/0 group-hover/cat:bg-black/5"
                        }`}
                      />
                    </div>

                    {/* Category Title & Count */}
                    <div className="px-1">
                      <p
                        className={`text-xs sm:text-sm font-extrabold truncate transition-colors duration-300 ${
                          isActive
                            ? "text-primary font-black"
                            : "text-foreground group-hover/cat:text-primary"
                        }`}
                      >
                        {catName}
                      </p>

                      {cat.productsCount !== undefined && (
                        <span className="text-[9px] sm:text-[10px] text-muted-foreground font-semibold inline-block mt-0.5 bg-muted/50 px-2 py-0.5 rounded-full border border-border/20">
                          {cat.productsCount}{" "}
                          {locale === "ar" ? "منتج" : "items"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── 5. SEARCH & ADVANCED PRODUCTS CATALOG ─────────── */}
      <section id="products-showroom" className="py-16 sm:py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center md:text-left rtl:md:text-right mb-12">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight flex items-center justify-center md:justify-start gap-2">
              <ShoppingBag className="w-7 h-7 text-primary" />
              {trans.allProducts}
            </h2>
            <div className="w-16 h-1 bg-primary rounded-full mt-3 mx-auto md:mx-0" />
          </div>

          {/* Catalog Controls Row */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-8 mb-8 border-b border-border/40">
            {/* Advanced Live Search Input */}
            <div className="relative w-full md:w-[26rem] group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder={trans.searchPlaceholder}
                className="pl-10 h-11 rounded-xl bg-card border-border/50 focus-visible:ring-primary/20 shadow-2xs text-xs sm:text-sm font-medium"
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  setPage(1);
                }}
              />
              {localSearch && (
                <button
                  onClick={() => {
                    setLocalSearch("");
                    setPage(1);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted text-muted-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between w-full md:w-auto gap-4">
              {/* Mobile Filter trigger */}
              <Button
                onClick={() => setIsMobileDrawerOpen(true)}
                variant="outline"
                className="h-11 px-4 lg:hidden rounded-xl border-border/50 gap-2 font-bold bg-card"
              >
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                {trans.filtersTitle}
                {hasActiveFilters && (
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </Button>

              {/* Advanced Sorting selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground/80 whitespace-nowrap hidden sm:inline uppercase tracking-wider">
                  {trans.sortByLabel}:
                </span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setPage(1);
                    }}
                    className="appearance-none h-11 pl-4 pr-10 rounded-xl bg-card border border-border/50 text-xs sm:text-sm font-bold text-foreground focus:outline-none focus:border-primary/30 shadow-2xs cursor-pointer"
                  >
                    {trans.sorts.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Grid Layout containing sidebar + catalog */}
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* Desktop Left sticky filters sidebar */}
            <aside className="hidden lg:block lg:col-span-3 bg-card border border-border/50 rounded-2xl p-6 shadow-2xs sticky top-36 z-20">
              <div className="flex items-center justify-between pb-4 border-b border-border/40 mb-6">
                <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  {trans.filtersTitle}
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearAll}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {trans.clearAll}
                  </button>
                )}
              </div>

              {/* Dynamic Expandable Filters */}
              <div className="space-y-6">
                {/* Categories selector block */}
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase text-muted-foreground/80 tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-primary" />
                    {trans.categories}
                  </label>
                  <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar font-medium">
                    <button
                      onClick={() => {
                        setSelectedCategory("");
                        setSelectedSubCategory("");
                        setPage(1);
                      }}
                      className={`w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                        !selectedCategory
                          ? "bg-primary/10 text-primary font-bold border border-primary/20"
                          : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {trans.allCategories}
                    </button>
                    {categoriesList.map((cat) => {
                      const catName = getTrans(cat.name);
                      return (
                        <button
                          key={cat._id}
                          onClick={() => {
                            setSelectedCategory(cat._id);
                            setSelectedSubCategory("");
                            setPage(1);
                          }}
                          className={`w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs sm:text-sm transition-all truncate block ${
                            selectedCategory === cat._id
                              ? "bg-primary/10 text-primary font-bold border border-primary/20"
                              : "hover:bg-muted text-muted-foreground"
                          }`}
                          title={catName}
                        >
                          {catName}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SubCategories selector block */}
                {selectedCategory && subCategoriesList.length > 0 && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-300">
                    <label className="text-[11px] font-black uppercase text-muted-foreground/80 tracking-wider flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-primary" />
                      {locale === "ar" ? "الأقسام الفرعية" : "Subcategories"}
                    </label>
                    <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar font-medium">
                      <button
                        onClick={() => {
                          setSelectedSubCategory("");
                          setPage(1);
                        }}
                        className={`w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                          !selectedSubCategory
                            ? "bg-primary/10 text-primary font-bold border border-primary/20"
                            : "hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        {locale === "ar" ? "كل الأقسام الفرعية" : "All Subcategories"}
                      </button>
                      {subCategoriesList.map((sub) => {
                        const subName = getTrans(sub.name);
                        return (
                          <button
                            key={sub._id}
                            onClick={() => {
                              setSelectedSubCategory(sub._id);
                              setPage(1);
                            }}
                            className={`w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs sm:text-sm transition-all truncate block ${
                              selectedSubCategory === sub._id
                                ? "bg-primary/10 text-primary font-bold border border-primary/20"
                                : "hover:bg-muted text-muted-foreground"
                            }`}
                            title={subName}
                          >
                            {subName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Brands selector block */}
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase text-muted-foreground/80 tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-primary" />
                    {trans.brands}
                  </label>
                  <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar font-medium">
                    <button
                      onClick={() => {
                        setSelectedBrand("");
                        setPage(1);
                      }}
                      className={`w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                        !selectedBrand
                          ? "bg-primary/10 text-primary font-bold border border-primary/20"
                          : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {trans.allBrands}
                    </button>
                    {brandsList.map((brand) => {
                      const bName = getTrans(brand.name);
                      return (
                        <button
                          key={brand._id}
                          onClick={() => {
                            setSelectedBrand(brand._id);
                            setPage(1);
                          }}
                          className={`w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs sm:text-sm transition-all truncate block ${
                            selectedBrand === brand._id
                              ? "bg-primary/10 text-primary font-bold border border-primary/20"
                              : "hover:bg-muted text-muted-foreground"
                          }`}
                          title={bName}
                        >
                          {bName}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price range textboxes */}
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase text-muted-foreground/80 tracking-wider flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-primary" />
                    {trans.priceRange}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder={trans.minPrice}
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(e.target.value);
                        setPage(1);
                      }}
                      className="h-10 text-xs text-center rounded-xl bg-muted/40 border-border/40 font-bold"
                    />
                    <Input
                      type="number"
                      placeholder={trans.maxPrice}
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(e.target.value);
                        setPage(1);
                      }}
                      className="h-10 text-xs text-center rounded-xl bg-muted/40 border-border/40 font-bold"
                    />
                  </div>
                </div>
              </div>
            </aside>

            {/* Catalog Grid Panel (col-span-9) */}
            <main className="col-span-12 lg:col-span-9">
              {/* Product grid or skeletons loading states */}
              {isCatalogLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                  {Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="bg-card border border-border/40 rounded-3xl p-5 space-y-4 shadow-2xs"
                      >
                        <Skeleton className="aspect-square w-full rounded-2xl animate-pulse" />
                        <Skeleton className="h-4 w-1/3 animate-pulse" />
                        <Skeleton className="h-6 w-3/4 animate-pulse" />
                        <Skeleton className="h-4 w-1/2 animate-pulse" />
                      </div>
                    ))}
                </div>
              ) : mainCatalogData?.data?.length ? (
                <>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="px-2.5 py-1 text-xs font-black text-primary bg-primary/10 border border-primary/20 rounded-md">
                      {mainCatalogData?.meta?.total || 0}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                      {trans.resultsCount}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 animate-in fade-in duration-500">
                    {mainCatalogData.data.map((product: Product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        locale={locale}
                      />
                    ))}
                  </div>
                </>
              ) : (
                // Elegant Empty Search State
                <div className="text-center py-24 bg-card border border-border/45 rounded-3xl shadow-2xs">
                  <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/25">
                    <Filter className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black mb-1.5">
                    {trans.noProducts}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed font-medium">
                    {trans.noProductsDesc}
                  </p>
                  {hasActiveFilters && (
                    <Button
                      onClick={handleClearAll}
                      variant="outline"
                      className="mt-6 font-extrabold rounded-xl border-primary/25 hover:bg-primary/5 text-primary text-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
                      {trans.clearAll}
                    </Button>
                  )}
                </div>
              )}

              {/* Pagination controls with smooth anchor scrolling */}
              {mainCatalogData?.meta?.pagination &&
                mainCatalogData.meta.pagination.numberOfPages > 1 && (
                  <div className="mt-16 flex justify-center">
                    <Pagination
                      pagination={mainCatalogData.meta.pagination}
                      onPageChange={(p) => {
                        setPage(p);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    />
                  </div>
                )}
            </main>
          </div>
        </div>
      </section>
      {/* ─── 3. BEST SELLING PRODUCTS ──────────────────────── */}
      {bestSellersList.length > 0 && (
        <section className="py-16 sm:py-20 border-b border-border/30 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-3">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  {trans.bestSellers}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 font-medium max-w-lg">
                  {trans.bestSellersDesc}
                </p>
              </div>
            </div>

            {/* Grid display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {bestSellersList.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  locale={locale}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── 4. FEATURED PRODUCTS (ASYMMETRIC SPOTLIGHT) ───── */}
      {featuredList.length > 0 && (
        <section className="py-16 sm:py-20 bg-muted/15 border-b border-border/30 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-3">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
                  <Award className="w-6 h-6 text-amber-500" />
                  {trans.featuredTitle}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 font-medium max-w-lg">
                  {trans.featuredDesc}
                </p>
              </div>
            </div>

            {/* Asymmetric Spotlight Layout: Double width first featured card */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
              {/* Col-span-6 (Main spotlight showcase banner) */}
              <div className="md:col-span-6 flex flex-col justify-between bg-linear-to-tr from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-3xl p-6 sm:p-10 relative overflow-hidden group">
                <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-4">
                  <div className="inline-flex px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold uppercase tracking-widest">
                    {locale === "ar" ? "العرض الأقوى" : "Golden Choice"}
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-black text-foreground leading-tight tracking-tight">
                    {getTrans(featuredList[0].title)}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md line-clamp-3 font-medium">
                    {getTrans(featuredList[0].description)}
                  </p>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 pt-6 border-t border-border/40">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-muted-foreground font-bold">
                      {locale === "ar" ? "تبدأ من" : "Starting at"}
                    </span>
                    <span className="text-2xl font-black text-foreground">
                      {formatCurrency(featuredList[0].priceRange?.min || 0)}
                    </span>
                  </div>
                  <Link
                    href={`/products/${featuredList[0]._id}`}
                    className="inline-flex items-center justify-center rounded-xl h-11 font-extrabold px-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/15 transition-all text-xs"
                  >
                    {locale === "ar" ? "اكتشف التفاصيل" : "Explore Component"}
                  </Link>
                </div>
              </div>

              {/* Col-span-6 (Right side, containing the remaining 2 products in standard luxury grids) */}
              <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
                {featuredList.slice(1, 3).map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    locale={locale}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
      {/* ─── 6. BRANDS ECOSYSTEM SECTION ───────────────────── */}
      {brandsList.length > 0 && (
        <section className="py-16 sm:py-24 border-t border-border/30 bg-muted/5 overflow-hidden relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-muted-foreground/60">
              {trans.trustedBrands}
            </h2>
            <div className="w-12 h-0.5 bg-primary/30 rounded-full mt-2.5 mx-auto" />
          </div>

          <div className="hover:[animation-play-state:paused] flex select-none cursor-pointer">
            <div
              className={
                locale === "ar"
                  ? "animate-marquee-left gap-10"
                  : "animate-marquee-right gap-10"
              }
            >
              {[...brandsList, ...brandsList].map((brand, idx) => {
                const bName = getTrans(brand.name);
                return (
                  <div
                    key={`${brand._id}-${idx}`}
                    onClick={() => {
                      setSelectedBrand(brand._id);
                      setPage(1);
                    }}
                    className="px-8 py-5 rounded-2xl bg-card border border-border/40 shadow-2xs hover:border-primary/25 hover:shadow-md transition-all shrink-0 flex items-center justify-center min-w-40 h-20"
                  >
                    <span className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-muted-foreground/80 hover:text-primary transition-colors">
                      {bName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── 7. MOBILE FILTER DRAWER SHEET DIALOG ──────────── */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          {/* Backdrop Mask */}
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
          />

          {/* Sliding sheet container */}
          <div className="relative w-80 max-w-full bg-background border-l rtl:border-l-0 rtl:border-r border-border/50 h-full p-6 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right rtl:slide-in-from-left duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-border/40 mb-6">
              <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                {trans.filtersTitle}
              </h3>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Filters list */}
            <div className="flex-1 overflow-y-auto space-y-6 pb-6 pr-1 custom-scrollbar">
              {/* Categories */}
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-muted-foreground/80 tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  {trans.categories}
                </label>
                <div className="space-y-1 font-medium">
                  <button
                    onClick={() => {
                      setSelectedCategory("");
                      setSelectedSubCategory("");
                      setPage(1);
                    }}
                    className={`w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs transition-all ${
                      !selectedCategory
                        ? "bg-primary/10 text-primary font-bold border border-primary/20"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {trans.allCategories}
                  </button>
                  {categoriesList.map((cat) => {
                    const catName = getTrans(cat.name);
                    return (
                      <button
                        key={cat._id}
                        onClick={() => {
                          setSelectedCategory(cat._id);
                          setSelectedSubCategory("");
                          setPage(1);
                        }}
                        className={`w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs transition-all truncate block ${
                          selectedCategory === cat._id
                            ? "bg-primary/10 text-primary font-bold border border-primary/20"
                            : "hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        {catName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SubCategories */}
              {selectedCategory && subCategoriesList.length > 0 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-300">
                  <label className="text-[11px] font-black uppercase text-muted-foreground/80 tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-primary" />
                    {locale === "ar" ? "الأقسام الفرعية" : "Subcategories"}
                  </label>
                  <div className="space-y-1 font-medium">
                    <button
                      onClick={() => {
                        setSelectedSubCategory("");
                        setPage(1);
                      }}
                      className={`w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs transition-all ${
                        !selectedSubCategory
                          ? "bg-primary/10 text-primary font-bold border border-primary/20"
                          : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {locale === "ar" ? "كل الأقسام الفرعية" : "All Subcategories"}
                    </button>
                    {subCategoriesList.map((sub) => {
                      const subName = getTrans(sub.name);
                      return (
                        <button
                          key={sub._id}
                          onClick={() => {
                            setSelectedSubCategory(sub._id);
                            setPage(1);
                          }}
                          className={`w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs transition-all truncate block ${
                            selectedSubCategory === sub._id
                              ? "bg-primary/10 text-primary font-bold border border-primary/20"
                              : "hover:bg-muted text-muted-foreground"
                          }`}
                          title={subName}
                        >
                          {subName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Brands */}
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-muted-foreground/80 tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-primary" />
                  {trans.brands}
                </label>
                <div className="space-y-1 font-medium">
                  <button
                    onClick={() => {
                      setSelectedBrand("");
                      setPage(1);
                    }}
                    className={`w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs transition-all ${
                      !selectedBrand
                        ? "bg-primary/10 text-primary font-bold border border-primary/20"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {trans.allBrands}
                  </button>
                  {brandsList.map((brand) => {
                    const bName = getTrans(brand.name);
                    return (
                      <button
                        key={brand._id}
                        onClick={() => {
                          setSelectedBrand(brand._id);
                          setPage(1);
                        }}
                        className={`w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs transition-all truncate block ${
                          selectedBrand === brand._id
                            ? "bg-primary/10 text-primary font-bold border border-primary/20"
                            : "hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        {bName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Ranges */}
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-muted-foreground/80 tracking-wider flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-primary" />
                  {trans.priceRange}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder={trans.minPrice}
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                      setPage(1);
                    }}
                    className="h-10 text-xs text-center rounded-xl bg-muted/40 border-border/40 font-bold"
                  />
                  <Input
                    type="number"
                    placeholder={trans.maxPrice}
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                      setPage(1);
                    }}
                    className="h-10 text-xs text-center rounded-xl bg-muted/40 border-border/40 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions inside mobile drawer */}
            <div className="pt-4 border-t border-border/40 flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  onClick={handleClearAll}
                  variant="destructive"
                  className="flex-1 rounded-xl h-11 font-bold text-xs"
                >
                  {trans.clearAll}
                </Button>
              )}
              <Button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="flex-1 rounded-xl h-11 font-bold text-xs shadow-md shadow-primary/15"
              >
                {locale === "ar" ? "تطبيق الفلاتر" : "Apply"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
