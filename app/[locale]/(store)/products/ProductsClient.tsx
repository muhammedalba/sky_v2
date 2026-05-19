'use client';

import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { useLocale } from 'next-intl';
import ProductCard from '@/features/products/components/storefront/ProductCard';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import Pagination from '@/shared/ui/Pagination';
import { useProducts } from '@/features/products/hooks/useProducts';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useBrands } from '@/features/brands/hooks/useBrands';
import { Product, Category, Brand } from '@/types';
import { useTrans } from '@/shared/hooks/useTrans';
import { 
  SlidersHorizontal, 
  Search, 
  X, 
  ChevronDown, 
  Tag, 
  Briefcase, 
  Coins, 
  RotateCcw,
  ArrowUpDown,
  ShoppingBag
} from 'lucide-react';

export default function ProductsClient() {
  const locale = useLocale();
  const getTrans = useTrans();

  // Filter States
  const [page, setPage] = useState(1);
  const [localSearch, setLocalSearch] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('-createdAt');
  
  // Mobile Filter Drawer toggle
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Debounce search and price values
  const debouncedSearch = useDebounce(localSearch, 500);
  const debouncedMinPrice = useDebounce(minPrice, 600);
  const debouncedMaxPrice = useDebounce(maxPrice, 600);

  // Sync debounced search to query
  useEffect(() => {
    setSearch(debouncedSearch);
    setPage(1);
  }, [debouncedSearch]);

  // Sync debounced prices to query
  const priceRangeMin = debouncedMinPrice ? Number(debouncedMinPrice) : undefined;
  const priceRangeMax = debouncedMaxPrice ? Number(debouncedMaxPrice) : undefined;

  // Build backend query parameters dynamically
  const productQueryParams = useMemo(() => {
    const params: Record<string, any> = {
      page,
      limit: 12,
      sort: sortBy,
    };
    if (search) params.keywords = search;
    if (selectedCategory) params.category = selectedCategory;
    if (selectedBrand) params.brand = selectedBrand;
    if (priceRangeMin !== undefined) params['pricerange[min]'] = priceRangeMin;
    if (priceRangeMax !== undefined) params['pricerange[max]'] = priceRangeMax;
    return params;
  }, [page, search, selectedCategory, selectedBrand, priceRangeMin, priceRangeMax, sortBy]);

  // Data Fetching
  const { data, isLoading } = useProducts(productQueryParams);
  const { data: categoriesData } = useCategories({ limit: 100 });
  const { data: brandsData } = useBrands({ limit: 100 });

  const categoriesList = (categoriesData?.data || []) as Category[];
  const brandsList = (brandsData?.data || []) as Brand[];

  // Reset all filters easily
  const handleClearAll = () => {
    setLocalSearch('');
    setSearch('');
    setSelectedCategory('');
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('-createdAt');
    setPage(1);
  };

  const hasActiveFilters = !!(search || selectedCategory || selectedBrand || minPrice || maxPrice);

  // Helper translations mapped inline to avoid bundle key mismatch issues
  const translations = {
    title: locale === 'ar' ? 'معرض المنتجات المتميزة' : 'Premium Product Showroom',
    subtitle: locale === 'ar' 
      ? 'استكشف مجموعتنا الفاخرة المصممة خصيصاً لتلبية أعلى المعايير المهنية.' 
      : 'Explore our high-end professional tools and components curated for industrial giants.',
    searchPlaceholder: locale === 'ar' ? 'ابحث بالاسم أو المواصفات...' : 'Search by name or specs...',
    sortByLabel: locale === 'ar' ? 'ترتيب حسب' : 'Sort By',
    filtersTitle: locale === 'ar' ? 'تصفية المنتجات' : 'Filter Products',
    categories: locale === 'ar' ? 'الأقسام' : 'Categories',
    allCategories: locale === 'ar' ? 'جميع الأقسام' : 'All Categories',
    brands: locale === 'ar' ? 'الماركات التجارية' : 'Brands',
    allBrands: locale === 'ar' ? 'جميع الماركات' : 'All Brands',
    priceRange: locale === 'ar' ? 'نطاق السعر' : 'Price Range',
    minPrice: locale === 'ar' ? 'الأدنى' : 'Min',
    maxPrice: locale === 'ar' ? 'الأقصى' : 'Max',
    clearAll: locale === 'ar' ? 'إعادة ضبط الفلاتر' : 'Reset Filters',
    resultsCount: locale === 'ar' ? 'منتج تم العثور عليه' : 'products found',
    noProducts: locale === 'ar' ? 'لم يتم العثور على منتجات' : 'No products found',
    noProductsDesc: locale === 'ar' ? 'يرجى تجربة تعديل خيارات البحث أو الفلاتر النشطة.' : 'Try adjusting your search terms or clearing active filters.',
    sorts: [
      { value: '-createdAt', label: locale === 'ar' ? 'الأحدث أولاً' : 'Newest' },
      { value: '-totalSold', label: locale === 'ar' ? 'الأكثر مبيعاً' : 'Best Sellers' },
      { value: 'priceRange.min', label: locale === 'ar' ? 'السعر: من الأقل للأعلى' : 'Price: Low to High' },
      { value: '-priceRange.min', label: locale === 'ar' ? 'السعر: من الأعلى للأقل' : 'Price: High to Low' },
      { value: '-ratingsAverage', label: locale === 'ar' ? 'الأعلى تقييماً' : 'Top Rated' },
    ]
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-300">
      
      {/* Visual background accents */}
      <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-3xl pointer-events-none z-0" />
      
      {/* 1. Header Banner */}
      <div className="relative pt-40 pb-16 border-b border-border/40 bg-gradient-to-b from-muted/30 to-background overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 title-gradient">
            {translations.title}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
            {translations.subtitle}
          </p>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        
        {/* Top Control Bar (Search, Active Info, Sort) */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-8 mb-8 border-b border-border/40">
          
          {/* Dynamic Search */}
          <div className="relative w-full md:w-[24rem] group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder={translations.searchPlaceholder}
              className="pl-10 h-11 rounded-xl bg-card border-border/50 focus-visible:ring-primary/20 shadow-xs text-xs sm:text-sm font-medium"
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setPage(1);
              }}
            />
            {localSearch && (
              <button 
                onClick={() => {
                  setLocalSearch('');
                  setPage(1);
                }} 
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted text-muted-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            {/* Mobile Filters Toggle Button */}
            <Button
              variant="outline"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="h-11 px-4 lg:hidden rounded-xl border-border/50 gap-2 font-bold bg-card"
            >
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              {translations.filtersTitle}
              {hasActiveFilters && (
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              )}
            </Button>

            {/* Sort Order Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground/80 whitespace-nowrap hidden sm:inline uppercase tracking-wider">
                {translations.sortByLabel}:
              </span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="appearance-none h-11 pl-4 pr-10 rounded-xl bg-card border border-border/50 text-xs sm:text-sm font-bold text-foreground focus:outline-none focus:border-primary/30 shadow-xs cursor-pointer"
                >
                  {translations.sorts.map((option) => (
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

        {/* Layout Layout: 12-column grid */}
        <div className="grid grid-cols-12 gap-8 items-start">
          
          {/* Desktop Filter Sidebar (Left Panel, col-span-3) */}
          <aside className="hidden lg:block lg:col-span-3 bg-card border border-border/50 rounded-2xl p-6 shadow-xs sticky top-36">
            
            <div className="flex items-center justify-between pb-4 border-b border-border/40 mb-6">
              <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                {translations.filtersTitle}
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={handleClearAll}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {locale === 'ar' ? 'إعادة ضبط' : 'Reset'}
                </button>
              )}
            </div>

            {/* Filter Content */}
            <div className="space-y-6">
              
              {/* Categories */}
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-muted-foreground/80 tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  {translations.categories}
                </label>
                <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar font-medium">
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setPage(1);
                    }}
                    className={`w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                      !selectedCategory
                        ? 'bg-primary/10 text-primary font-bold border border-primary/20'
                        : 'hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    {translations.allCategories}
                  </button>
                  {categoriesList.map((cat) => {
                    const catName = getTrans(cat.name);
                    return (
                      <button
                        key={cat._id}
                        onClick={() => {
                          setSelectedCategory(cat._id);
                          setPage(1);
                        }}
                        className={`w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs sm:text-sm transition-all truncate block ${
                          selectedCategory === cat._id
                            ? 'bg-primary/10 text-primary font-bold border border-primary/20'
                            : 'hover:bg-muted text-muted-foreground'
                        }`}
                        title={catName}
                      >
                        {catName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Brands */}
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-muted-foreground/80 tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-primary" />
                  {translations.brands}
                </label>
                <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar font-medium">
                  <button
                    onClick={() => {
                      setSelectedBrand('');
                      setPage(1);
                    }}
                    className={`w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                      !selectedBrand
                        ? 'bg-primary/10 text-primary font-bold border border-primary/20'
                        : 'hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    {translations.allBrands}
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
                            ? 'bg-primary/10 text-primary font-bold border border-primary/20'
                            : 'hover:bg-muted text-muted-foreground'
                        }`}
                        title={bName}
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
                  {translations.priceRange}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder={translations.minPrice}
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(e.target.value);
                        setPage(1);
                      }}
                      className="h-10 text-xs text-center rounded-xl bg-muted/40 border-border/40 font-bold"
                    />
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder={translations.maxPrice}
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

            </div>

          </aside>

          {/* Product Catalog Display (Right Panel, col-span-9) */}
          <main className="col-span-12 lg:col-span-9">
            
            {/* Products grid / skeleton lists */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="bg-card border border-border/40 rounded-2xl p-5 space-y-4 shadow-2xs">
                    <Skeleton className="aspect-square w-full rounded-xl" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : data?.data?.length ? (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <span className="px-2.5 py-1 text-xs font-black text-primary bg-primary/10 border border-primary/20 rounded-md">
                    {data?.meta?.total || 0}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    {translations.resultsCount}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                  {data.data.map((product: Product) => (
                    <ProductCard key={product._id} product={product} locale={locale} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-card border border-border/40 rounded-2xl shadow-2xs">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5 border border-primary/20">
                  <ShoppingBag className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold mb-1">
                  {translations.noProducts}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto font-medium">
                  {translations.noProductsDesc}
                </p>
                {hasActiveFilters && (
                  <Button
                    onClick={handleClearAll}
                    variant="outline"
                    className="mt-6 font-bold rounded-xl border-primary/25 hover:bg-primary/5 text-primary text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
                    {translations.clearAll}
                  </Button>
                )}
              </div>
            )}

            {/* Pagination Controls */}
            {data?.meta?.pagination && data.meta.pagination.numberOfPages > 1 && (
              <div className="mt-16 flex justify-center">
                <Pagination
                  pagination={data.meta.pagination}
                  onPageChange={(p) => {
                    setPage(p);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}

          </main>

        </div>

      </div>

      {/* 3. Mobile Filter Drawer Dialog Sheet */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          {/* Overlay mask */}
          <div 
            onClick={() => setIsMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
          />
          
          {/* Sheet body */}
          <div className="relative w-80 max-w-full bg-background border-l rtl:border-l-0 rtl:border-r border-border/50 h-full p-6 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right rtl:slide-in-from-left duration-300">
            
            <div className="flex items-center justify-between pb-4 border-b border-border/40 mb-6">
              <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                {translations.filtersTitle}
              </h3>
              <button 
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer filters layout */}
            <div className="flex-1 overflow-y-auto space-y-6 pb-6 pr-1 custom-scrollbar">
              
              {/* Categories */}
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-muted-foreground/80 tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  {translations.categories}
                </label>
                <div className="space-y-1 font-medium">
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setPage(1);
                    }}
                    className={`w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs transition-all ${
                      !selectedCategory
                        ? 'bg-primary/10 text-primary font-bold border border-primary/20'
                        : 'hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    {translations.allCategories}
                  </button>
                  {categoriesList.map((cat) => {
                    const catName = getTrans(cat.name);
                    return (
                      <button
                        key={cat._id}
                        onClick={() => {
                          setSelectedCategory(cat._id);
                          setPage(1);
                        }}
                        className={`w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs transition-all truncate block ${
                          selectedCategory === cat._id
                            ? 'bg-primary/10 text-primary font-bold border border-primary/20'
                            : 'hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        {catName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Brands */}
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-muted-foreground/80 tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-primary" />
                  {translations.brands}
                </label>
                <div className="space-y-1 font-medium">
                  <button
                    onClick={() => {
                      setSelectedBrand('');
                      setPage(1);
                    }}
                    className={`w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs transition-all ${
                      !selectedBrand
                        ? 'bg-primary/10 text-primary font-bold border border-primary/20'
                        : 'hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    {translations.allBrands}
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
                            ? 'bg-primary/10 text-primary font-bold border border-primary/20'
                            : 'hover:bg-muted text-muted-foreground'
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
                  {translations.priceRange}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder={translations.minPrice}
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                      setPage(1);
                    }}
                    className="h-10 text-xs text-center rounded-xl bg-muted/40 border-border/40 font-bold"
                  />
                  <Input
                    type="number"
                    placeholder={translations.maxPrice}
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

            {/* Bottom Actions inside drawer */}
            <div className="pt-4 border-t border-border/40 flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  onClick={handleClearAll}
                  variant="destructive"
                  className="flex-1 rounded-xl h-11 font-bold text-xs"
                >
                  {translations.clearAll}
                </Button>
              )}
              <Button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="flex-1 rounded-xl h-11 font-bold text-xs shadow-md shadow-primary/10"
              >
                {locale === 'ar' ? 'تطبيق الفلاتر' : 'Apply'}
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
