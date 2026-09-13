"use client";

import { useState, useEffect, useMemo } from "react";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
// import ProductCard from "@/features/products/components/storefront/ProductCard";
import { Input } from "@/shared/ui/Input";
import { Button } from "@/shared/ui/Button";
import { Skeleton } from "@/shared/ui/Skeleton";
import Pagination from "@/shared/ui/Pagination";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useSubCategories } from "@/features/categories/hooks/useSubCategories";
import { useBrands } from "@/features/brands/hooks/useBrands";
import { useCarousel } from "@/features/marketing/hooks/useCarousel";
import {
  Product,
  Category,
  SubCategory,
  Brand,
  Carousel,
  LocalizedString,
} from "@/types";
import { Link } from "@/navigation";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { useTrans } from "@/shared/hooks/useTrans";
import {
  SlidersHorizontalIcon as SlidersHorizontal,
  SearchIcon as Search,
  XIcon as X,
  ChevronDownIcon as ChevronDown,
  TagIcon as Tag,
  BriefcaseIcon as Briefcase,
  LayersIcon as Layers,
  PaletteIcon as Palette,
  CoinsIcon as Coins,
  RotateCcwIcon as RotateCcw,
  ShoppingBagIcon as ShoppingBag,
  ChevronLeftIcon as ChevronLeft,
  ChevronRightIcon as ChevronRight,
  SparklesIcon as Sparkles,
  TrendingUpIcon as TrendingUp,
  AwardIcon as Award,
  FilterIcon as Filter,
} from "@/shared/ui/Icons";
import SimilarProductCard from "@/components/SimilarProductCard";
import { Dropdown, DropdownItem } from "@/shared/ui/CustomDropdown";
import { FilterDrawer } from "@/shared/ui/FilterDrawer";
import {
  SearchableSelect,
  SearchOption,
} from "@/shared/ui/form/SearchableSelect";
import ImageWithFallback from "@/shared/ui/image/ImageWithFallback";
import CategoriesSlide from "./[slug]/components/CategoriesSlide";
import TrustedBy from "@/components/home/TrustedBy";

export default function ProductsClient() {
  const locale = useLocale();
  const getTrans = useTrans();
  const formatCurrency = useFormatCurrency();
  const commonT = useTranslations("common.buttons");
  const searchParams = useSearchParams();

  // ─── Filter States ──────────────────────────────────────
  const [page, setPage] = useState(1);
  const [localSearch, setLocalSearch] = useState(
    () => searchParams?.get("search") || "",
  );
  const [selectedCategory, setSelectedCategory] = useState(
    () => searchParams?.get("category") || "",
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("-createdAt");

  // Local search terms for the filter drawer's SearchableSelect fields
  const [categorySearch, setCategorySearch] = useState("");
  const [subCategorySearch, setSubCategorySearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");

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
  const debouncedColor = useDebounce(color, 500);

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
    if (debouncedColor) params.color = debouncedColor;
    return params;
  }, [
    page,
    debouncedSearch,
    selectedCategory,
    selectedSubCategory,
    selectedBrand,
    priceRangeMin,
    priceRangeMax,
    debouncedColor,
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

  // ─── Active Filters Count (for the Filter button badge) ─
  const activeFilterCount = useMemo(() => {
    return [
      selectedCategory,
      selectedSubCategory,
      selectedBrand,
      minPrice,
      maxPrice,
      color,
    ].filter((v) => !!v).length;
  }, [
    selectedCategory,
    selectedSubCategory,
    selectedBrand,
    minPrice,
    maxPrice,
    color,
  ]);

  // ─── Filtered options for the SearchableSelect fields ───
  const filteredCategoryOptions = useMemo(
    () =>
      categoriesList.filter((c) =>
        getTrans(c.name).toLowerCase().includes(categorySearch.toLowerCase()),
      ) as unknown as SearchOption[],
    [categoriesList, categorySearch, getTrans],
  );
  const filteredSubCategoryOptions = useMemo(
    () =>
      subCategoriesList.filter((c) =>
        getTrans(c.name)
          .toLowerCase()
          .includes(subCategorySearch.toLowerCase()),
      ) as unknown as SearchOption[],
    [subCategoriesList, subCategorySearch, getTrans],
  );
  const filteredBrandOptions = useMemo(
    () =>
      brandsList.filter((b) =>
        getTrans(b.name).toLowerCase().includes(brandSearch.toLowerCase()),
      ) as unknown as SearchOption[],
    [brandsList, brandSearch, getTrans],
  );

  const handleClearAllFilters = () => {
    setSelectedCategory("");
    setSelectedSubCategory("");
    setSelectedBrand("");
    setMinPrice("");
    setMaxPrice("");
    setColor("");
    setCategorySearch("");
    setSubCategorySearch("");
    setBrandSearch("");
    setPage(1);
  };

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
    subCategories: locale === "ar" ? "الفئات الفرعية" : "Sub Categories",
    priceRange: locale === "ar" ? "نطاق الأسعار" : "Price Range",
    minPrice: locale === "ar" ? "الأدنى" : "Min",
    maxPrice: locale === "ar" ? "الأقصى" : "Max",
    color: locale === "ar" ? "اللون" : "Color",
    colorPlaceholder:
      locale === "ar" ? "مثال: أحمر، أزرق..." : "e.g. red, blue",
    activeFilters: locale === "ar" ? "فلاتر نشطة" : "active",
    noActiveFilters:
      locale === "ar" ? "لا توجد فلاتر نشطة" : "No active filters",
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

                    {/* Dark gradient blur covering text */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-6 sm:p-10 lg:p-14 text-white" />

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
      {/*CategoriesSlide  */}
      <CategoriesSlide />

      {/* ─── 2. ALL PRODUCTS SECTION ───────────────────────── */}
      <section className="relative py-10 sm:py-14 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black title-gradient">
                {trans.allProducts}
              </h2>
              {!!mainCatalogData?.meta?.pagination?.totalResults && (
                <p className="text-sm text-muted-foreground mt-1">
                  {mainCatalogData.meta.pagination.totalResults}{" "}
                  {trans.resultsCount}
                </p>
              )}
            </div>

            {/* Toolbar: Sort by + Filter */}
            <div className="flex items-center justify-end gap-3">
              <Dropdown
                trigger={
                  <span className="inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-input bg-background text-sm font-semibold hover:bg-accent transition-colors">
                    {trans.sortByLabel}:{" "}
                    <span className="text-primary">
                      {trans.sorts.find((s) => s.value === sortBy)?.label}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </span>
                }
                width="w-56"
              >
                {trans.sorts.map((opt) => (
                  <DropdownItem
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value);
                      setPage(1);
                    }}
                    className={
                      opt.value === sortBy
                        ? "font-semibold text-primary"
                        : undefined
                    }
                  >
                    {opt.label}
                  </DropdownItem>
                ))}
              </Dropdown>

              <Button
                variant="outline"
                className="h-11 px-4 gap-2 relative"
                onClick={() => setIsMobileDrawerOpen(true)}
              >
                <Filter className="w-4 h-4" />
                {commonT("filter")}
                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 rtl:-right-auto rtl:-left-2 flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-black shadow-md">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          {isCatalogLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-80 w-full rounded-2xl" />
              ))}
            </div>
          ) : mainCatalogData?.data?.length ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {(mainCatalogData.data as Product[]).map((item) => (
                <SimilarProductCard key={item._id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg font-bold text-foreground">
                {trans.noProducts}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {trans.noProductsDesc}
              </p>
            </div>
          )}

          {/* Pagination */}
          {mainCatalogData?.meta?.pagination && (
            <Pagination
              pagination={mainCatalogData.meta.pagination}
              onPageChange={(p) => setPage(p)}
            />
          )}
        </div>
      </section>
      {/* 2. TRUST INDICATORS (Above the Fold - Static Import) */}
      <TrustedBy mode="text" duration="18اشىيث0s" />
      {/* ─── Filter Drawer ──────────────────────────────────── */}
      <FilterDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        title={trans.filtersTitle}
        activeCount={activeFilterCount}
        subtitle={
          activeFilterCount > 0
            ? `${activeFilterCount} ${trans.activeFilters}`
            : trans.noActiveFilters
        }
        footer={
          <div className="flex items-center gap-3 w-full">
            <Button
              variant="destructive"
              onClick={handleClearAllFilters}
              className="flex-1 h-11 font-bold rounded-xl"
            >
              {commonT("clearAll")}
            </Button>
            <Button
              onClick={() => setIsMobileDrawerOpen(false)}
              className="flex-1 h-11 font-bold rounded-xl shadow-md shadow-primary/20"
            >
              {commonT("applyFilters")}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <FilterSection title={trans.categories}>
            <SearchableSelect
              label={trans.categories}
              icon={Tag}
              value={selectedCategory}
              options={filteredCategoryOptions}
              getDisplayValue={(opt) => getTrans(opt.name as LocalizedString)}
              onSearch={setCategorySearch}
              onSelect={(id) => {
                setSelectedCategory(id);
                setSelectedSubCategory("");
              }}
              className="mt-2"
            />
            <SearchableSelect
              label={trans.subCategories}
              icon={Layers}
              value={selectedSubCategory}
              options={filteredSubCategoryOptions}
              getDisplayValue={(opt) => getTrans(opt.name as LocalizedString)}
              onSearch={setSubCategorySearch}
              onSelect={(id) => setSelectedSubCategory(id)}
              className="mt-5"
            />
            <SearchableSelect
              label={trans.brands}
              icon={Briefcase}
              value={selectedBrand}
              options={filteredBrandOptions}
              getDisplayValue={(opt) => getTrans(opt.name as LocalizedString)}
              onSearch={setBrandSearch}
              onSelect={(id) => setSelectedBrand(id)}
              className="mt-5"
            />
          </FilterSection>

          <FilterSection title={trans.priceRange}>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                icon={Coins}
                label={trans.minPrice}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="h-10"
              />
              <Input
                type="number"
                icon={Coins}
                label={trans.maxPrice}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-10"
              />
            </div>
          </FilterSection>

          <FilterSection title={trans.color}>
            <Input
              icon={Palette}
              placeholder={trans.colorPlaceholder}
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10"
            />
          </FilterSection>
        </div>
      </FilterDrawer>
    </div>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
