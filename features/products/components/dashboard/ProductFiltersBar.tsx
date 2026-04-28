'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { FilterDrawer } from '@/shared/ui/FilterDrawer';
import { useProductFilters } from '../../hooks/useProductFilters';
import { SearchableSelect } from '@/shared/ui/form/SearchableSelect';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useBrands } from '@/features/brands/hooks/useBrands';
import { useSubCategories } from '@/features/categories/hooks/useSubCategories';
import { useTrans } from '@/shared/hooks/useTrans';
import { LocalizedString } from '@/types';
import { SearchOption } from '@/shared/ui/form/SearchableSelect';
import { useDebounce } from '@/shared/hooks/use-debounce';
import EntitySearchBar from '@/shared/ui/dashboard/EntitySearchBar';
import {
  Hash,
  Palette,
  Tag,
  Briefcase,
  Layers,
  DollarSign,
  Scale,
  Box,
  TrendingUp
} from 'lucide-react';
import { WEIGHT_UNITS, VOLUME_UNITS } from '@/shared/constants/product-constants';




export function ProductFiltersBar() {
  const t = useTranslations('products');
  const tCommon = useTranslations('buttons');
  const { filters, setFilter, setFilters, resetFilters } = useProductFilters();
  const getTrans = useTrans();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // ── Local states ──
  const [query, setQuery] = useState(filters.keywords || '');
  const [sku, setSku] = useState(filters.skuSearch || '');
  const [color, setColor] = useState(filters.color || '');
  const [minPrice, setMinPrice] = useState(filters['pricerange[min]'] || '');
  const [maxPrice, setMaxPrice] = useState(filters['pricerange[max]'] || '');

  // ── Search states for taxonomy filters ───────────────
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [subCategorySearch, setSubCategorySearch] = useState('');

  // ── Fetching data for filters ────────────────────────
  const { data: categoriesData, isFetching: isCategoriesFetching } = useCategories(
    { keywords: categorySearch },
    { enabled: isDrawerOpen },
  );
  const { data: brandsData, isFetching: isBrandsFetching } = useBrands(
    { keywords: brandSearch },
    { enabled: isDrawerOpen },
  );
  const { data: subCategoriesData, isFetching: isSubCategoriesFetching } = useSubCategories(
    { keywords: subCategorySearch },
    { enabled: isDrawerOpen },
  );

  // ── Debounced values ────────────────────────────────
  const debouncedQuery = useDebounce(query, 500);
  const debouncedSku = useDebounce(sku, 500);
  const debouncedColor = useDebounce(color, 500);
  const debouncedMinPrice = useDebounce(minPrice, 500);
  const debouncedMaxPrice = useDebounce(maxPrice, 500);

  // ── Sync debounced values to filters ─────────────────
  useEffect(() => {
    const updates: Record<string, any> = {};

    if (debouncedQuery !== (filters.keywords || '')) updates.keywords = debouncedQuery;
    if (debouncedSku !== (filters.skuSearch || '')) updates.skuSearch = debouncedSku;
    if (debouncedColor !== (filters.color || '')) updates.color = debouncedColor;
    if (debouncedMinPrice !== (filters['pricerange[min]'] || '')) updates['pricerange[min]'] = debouncedMinPrice;
    if (debouncedMaxPrice !== (filters['pricerange[max]'] || '')) updates['pricerange[max]'] = debouncedMaxPrice;

    if (Object.keys(updates).length > 0) {
      setFilters(updates); // تحديث الكل دفعة واحدة
    }
  }, [debouncedQuery, debouncedSku, debouncedColor, debouncedMinPrice, debouncedMaxPrice, setFilters]);

  // 2. مزامنة الحالة المحلية عند تغير الـ URL (تأثير واحد شامل)  ── Sync back if URL changes externally ──────────────
  useEffect(() => {
    setQuery(filters.keywords || '');
    setSku(filters.skuSearch || '');
    setColor(filters.color || '');
    setMinPrice(filters['pricerange[min]'] || '');
    setMaxPrice(filters['pricerange[max]'] || '');
  }, [filters.keywords, filters.skuSearch, filters.color, filters['pricerange[min]'], filters['pricerange[max]']]);




  // ── Count active advanced filters (excluding keywords) ─
  // 3. تحسين حساب الفلاتر النشطة
  const activeFilterCount = useMemo(() => {
    const keys = [
      'skuSearch', 'color', 'category', 'brand', 'SubCategories',
      'pricerange[min]', 'pricerange[max]', 'weight_min', 'weight_max',
      'weight_unit', 'volume_min', 'volume_max', 'volume_unit', 'sold_min', 'sold_max'
    ];
    return keys.filter(k => filters[k as keyof typeof filters]).length;
  }, [filters]);

  // ── Handlers ──
  const handleClearAll = () => {
    resetFilters();
    setCategorySearch('');
    setBrandSearch('');
    setSubCategorySearch('');
    setQuery('');
    setSku('');
    setColor('');
    setMinPrice('');
    setMaxPrice('');

  };

  // ─────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────
  return (
    <div className="space-y-4 w-full">
      {/* ── Primary Search Row + Drawer Toggle ────────── */}
      <div className="flex flex-col md:flex-row gap-3 items-center">
        {/* Search input */}
        <EntitySearchBar
          placeholder={tCommon('search') || 'Search products...'}
          onSearch={(val) => setQuery(val)}
          defaultValue={query}
        />

        {/* Advanced Filters toggle button */}
        <Button
          variant="outline"
          onClick={() => setIsDrawerOpen(true)}
          className="h-12 px-5 gap-2.5 bg-background/50 border-border/40 font-bold relative h-stretch"
          id="advanced-filters-toggle"
        >
          <Icons.Settings className="w-4 h-4" />
          {t('filters.advancedFilters', { defaultValue: 'Advanced Filters' })}
          {activeFilterCount > 0 && (
            <span className="absolute -top-2 -right-2 rtl:-right-auto rtl:-left-2 flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-black shadow-md animate-in zoom-in-50 duration-200">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* ── Filter Drawer ─────────────────────────────── */}
      <FilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={t('filters.advancedFilters', { defaultValue: 'Advanced Filters' })}
        activeCount={activeFilterCount}
        subtitle={
          activeFilterCount > 0
            ? `${activeFilterCount} ${t('filters.active', { defaultValue: 'active' })}`
            : t('filters.noActiveFilters', { defaultValue: 'No active filters' })
        }
        footer={
          <div className="flex items-center gap-3 w-full">
            <Button
              variant="secondary"
              onClick={handleClearAll}
              className="flex-1 h-11 font-bold rounded-xl"
            >
              {tCommon('clearAll', { defaultValue: 'Clear All' })}
            </Button>
            <Button
              onClick={() => setIsDrawerOpen(false)}
              className="flex-1 h-11 font-bold rounded-xl shadow-md shadow-primary/20"
            >
              {tCommon('applyFilters', { defaultValue: 'Apply Filters' })}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* ═══ Section: General ═══════════════════════ */}
          <FilterSection title={t('filters.general', { defaultValue: 'General' })}>
            <Input
              label="Search by SKU..."
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              icon={Hash}
              className="h-10"
            />



            <Input
              label="e.g. red, blue"
              inputWrapperClass="mt-5"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              icon={Palette}
              className="h-10"
            />



          </FilterSection>

          {/* ═══ Section: Classification ════════════════ */}
          <FilterSection title={t('filters.classification', { defaultValue: 'Classification' })}>
            <SearchableSelect
              label="Search Categories"
              icon={Tag}
              value={filters.category || ''}

              isLoading={isCategoriesFetching}
              options={(categoriesData?.data as unknown as SearchOption[]) || []}
              getDisplayValue={(opt: SearchOption) => getTrans(opt.name as LocalizedString)}
              onSearch={(term) => setCategorySearch(term)}
              onSelect={(id) => {
                setFilters({ category: id, SubCategories: '' });
              }}
              className="h-10"
            />

            <SearchableSelect
              label="Search Brands"
              icon={Briefcase}
              value={filters.brand || ''}

              isLoading={isBrandsFetching}
              options={(brandsData?.data as unknown as SearchOption[]) || []}
              getDisplayValue={(opt: SearchOption) => getTrans(opt.name as LocalizedString)}
              onSearch={(term) => setBrandSearch(term)}
              onSelect={(id) => setFilter('brand', id)}
              className="h-10 my-5"
            />


            <SearchableSelect
              icon={Layers}
              label="Search Sub Categories"

              value={filters.SubCategories || ''}
              isLoading={isSubCategoriesFetching}
              options={(subCategoriesData?.data as unknown as SearchOption[]) || []}
              getDisplayValue={(opt: SearchOption) => getTrans(opt.name as LocalizedString)}
              onSearch={(term) => setSubCategorySearch(term)}
              onSelect={(id) => setFilter('SubCategories', id)}
              className="h-10"
            />

          </FilterSection>

          {/* ═══ Section: Price ═════════════════════════ */}
          <FilterSection title={t('filters.priceRange', { defaultValue: 'Price Range' })}>
            <div className="grid grid-cols-2 gap-3">

              <Input
                label="Min Price"
                icon={DollarSign}
                type="number"
                value={minPrice}

                onChange={(e) => setMinPrice(e.target.value)}
                className="h-10"
              />


              <Input
                type="number"
                icon={DollarSign}
                label='Max price'
                value={maxPrice}

                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-10"
              />
            </div>
          </FilterSection>

          {/* ═══ Section: Weight ════════════════════════ */}
          <FilterSection title={t('filters.weight', { defaultValue: 'Weight' })}>
            <div className="grid grid-cols-2 gap-3">

              <Input
                type="number"
                icon={Scale}
                label="Min"
                value={filters.weight_min || ''}

                onChange={(e) => setFilter('weight_min', e.target.value)}
                className="h-10"
              />
              <Input
                type="number"
                icon={Scale}
                label="Max"
                value={filters.weight_max || ''}

                onChange={(e) => setFilter('weight_max', e.target.value)}
                className="h-10"
              />
            </div>

            <Select
              label="weight Unit"
              value={filters.weight_unit || ''}
              onChange={(e) => setFilter('weight_unit', e.target.value)}
              options={[...WEIGHT_UNITS]}
              className="h-10"
            />


          </FilterSection>

          {/* ═══ Section: Volume ════════════════════════ */}
          <FilterSection title={t('filters.volume', { defaultValue: 'Volume' })}>
            <div className="grid grid-cols-2 gap-3">

              <Input
                type="number"
                label="Min"
                value={filters.volume_min || ''}
                onChange={(e) => setFilter('volume_min', e.target.value)}
                className="h-10"
                icon={Box}
              />



              <Input
                type="number"
                label="Max"
                value={filters.volume_max || ''}
                onChange={(e) => setFilter('volume_max', e.target.value)}
                className="h-10"
                icon={Box}
              />


            </div>

            <Select
              label="volume Unit"
              value={filters.volume_unit || ''}
              onChange={(e) => setFilter('volume_unit', e.target.value)}
              options={[...VOLUME_UNITS]}
              className="h-10"
            />


          </FilterSection>

          {/* ═══ Section: Sales ═════════════════════════ */}
          <FilterSection title={t('filters.unitsSold', { defaultValue: 'Units Sold' })}>
            <div className="grid grid-cols-2 gap-3">

              <Input
                type="number"
                label="Min"
                value={filters.sold_min || ''}
                onChange={(e) => setFilter('sold_min', e.target.value)}
                icon={TrendingUp}
                className="h-10"
              />


              <Input
                type="number"
                label="Max"
                value={filters.sold_max || ''}
                onChange={(e) => setFilter('sold_max', e.target.value)}
                icon={TrendingUp}
                className="h-10"
              />

            </div>
          </FilterSection>
        </div>
      </FilterDrawer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  Internal Layout Helpers
// ═══════════════════════════════════════════════════════

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-3 pl-0.5 rtl:pr-0.5 rtl:pl-0">
        {children}
      </div>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
