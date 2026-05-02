'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { WEIGHT_UNITS, VOLUME_UNITS, ADVANCED_FILTER_KEYS } from '@/shared/constants/product-constants';

// الثوابت خارج المكون لضمان استقرار الأداء وعدم إعادة حجز الذاكرة


export function ProductFiltersBar() {
  const t = useTranslations('products');
  const tCommon = useTranslations('buttons');
  const { filters, setFilter, setFilters, resetFilters, filterErrors } = useProductFilters();
  const getTrans = useTrans();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // ── Local states for inputs ──
  const [query, setQuery] = useState(filters.keywords || '');
  const [sku, setSku] = useState(filters.skuSearch || '');
  const [color, setColor] = useState(filters.color || '');
  const [minPrice, setMinPrice] = useState(filters['pricerange[min]'] || '');
  const [maxPrice, setMaxPrice] = useState(filters['pricerange[max]'] || '');
  const [weightMin, setWeightMin] = useState(filters.weight_min || '');
  const [weightMax, setWeightMax] = useState(filters.weight_max || '');
  const [volumeMin, setVolumeMin] = useState(filters.volume_min || '');
  const [volumeMax, setVolumeMax] = useState(filters.volume_max || '');
  const [soldMin, setSoldMin] = useState(filters.sold_min || '');
  const [soldMax, setSoldMax] = useState(filters.sold_max || '');

  // ── Search states for taxonomy ──
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [subCategorySearch, setSubCategorySearch] = useState('');

  // ── API Fetching ──
  const { data: categoriesData, isFetching: isCategoriesFetching } = useCategories(
    { keywords: categorySearch }, { enabled: isDrawerOpen }
  );
  const { data: brandsData, isFetching: isBrandsFetching } = useBrands(
    { keywords: brandSearch }, { enabled: isDrawerOpen }
  );
  const { data: subCategoriesData, isFetching: isSubCategoriesFetching } = useSubCategories(
    { keywords: subCategorySearch }, { enabled: isDrawerOpen }
  );

  // ── Debounced values ──
  const debouncedQuery = useDebounce(query, 500);
  const debouncedSku = useDebounce(sku, 500);
  const debouncedColor = useDebounce(color, 500);
  const debouncedMinPrice = useDebounce(minPrice, 500);
  const debouncedMaxPrice = useDebounce(maxPrice, 500);
  const debouncedWeightMin = useDebounce(weightMin, 500);
  const debouncedWeightMax = useDebounce(weightMax, 500);
  const debouncedVolumeMin = useDebounce(volumeMin, 500);
  const debouncedVolumeMax = useDebounce(volumeMax, 500);
  const debouncedSoldMin = useDebounce(soldMin, 500);
  const debouncedSoldMax = useDebounce(soldMax, 500);

  // 1. مزامنة القيم المؤجلة (Debounced) إلى الفلاتر (URL/Global State)
  useEffect(() => {
    const updates: Partial<typeof filters> = {};

    if (debouncedQuery !== (filters.keywords ?? '')) updates.keywords = debouncedQuery;
    if (debouncedSku !== (filters.skuSearch ?? '')) updates.skuSearch = debouncedSku;
    if (debouncedColor !== (filters.color ?? '')) updates.color = debouncedColor;
    if (debouncedMinPrice !== (filters['pricerange[min]'] ?? '')) updates['pricerange[min]'] = debouncedMinPrice;
    if (debouncedMaxPrice !== (filters['pricerange[max]'] ?? '')) updates['pricerange[max]'] = debouncedMaxPrice;
    if (debouncedWeightMin !== (filters.weight_min ?? '')) updates.weight_min = debouncedWeightMin;
    if (debouncedWeightMax !== (filters.weight_max ?? '')) updates.weight_max = debouncedWeightMax;
    if (debouncedVolumeMin !== (filters.volume_min ?? '')) updates.volume_min = debouncedVolumeMin;
    if (debouncedVolumeMax !== (filters.volume_max ?? '')) updates.volume_max = debouncedVolumeMax;
    if (debouncedSoldMin !== (filters.sold_min ?? '')) updates.sold_min = debouncedSoldMin;
    if (debouncedSoldMax !== (filters.sold_max ?? '')) updates.sold_max = debouncedSoldMax;

    if (Object.keys(updates).length > 0) {
      setFilters(updates);
    }
  }, [debouncedQuery, debouncedSku, debouncedColor, debouncedMinPrice, debouncedMaxPrice, debouncedWeightMin, debouncedWeightMax, debouncedVolumeMin, debouncedVolumeMax, debouncedSoldMin, debouncedSoldMax, setFilters, filters]);

  // 2. المزامنة العكسية: تحديث الحالة المحلية إذا تغير الـ URL من مصدر خارجي
  useEffect(() => {
    setQuery(prev => prev !== (filters.keywords ?? '') ? (filters.keywords ?? '') : prev);
    setSku(prev => prev !== (filters.skuSearch ?? '') ? (filters.skuSearch ?? '') : prev);
    setColor(prev => prev !== (filters.color ?? '') ? (filters.color ?? '') : prev);
    setMinPrice(prev => prev !== (filters['pricerange[min]'] ?? '') ? (filters['pricerange[min]'] ?? '') : prev);
    setMaxPrice(prev => prev !== (filters['pricerange[max]'] ?? '') ? (filters['pricerange[max]'] ?? '') : prev);
    setWeightMin(prev => prev !== (filters.weight_min ?? '') ? (filters.weight_min ?? '') : prev);
    setWeightMax(prev => prev !== (filters.weight_max ?? '') ? (filters.weight_max ?? '') : prev);
    setVolumeMin(prev => prev !== (filters.volume_min ?? '') ? (filters.volume_min ?? '') : prev);
    setVolumeMax(prev => prev !== (filters.volume_max ?? '') ? (filters.volume_max ?? '') : prev);
    setSoldMin(prev => prev !== (filters.sold_min ?? '') ? (filters.sold_min ?? '') : prev);
    setSoldMax(prev => prev !== (filters.sold_max ?? '') ? (filters.sold_max ?? '') : prev);
  }, [filters.keywords, filters.skuSearch, filters.color, filters['pricerange[min]'], filters['pricerange[max]'], filters.weight_min, filters.weight_max, filters.volume_min, filters.volume_max, filters.sold_min, filters.sold_max]);

  // 3. حساب عدد الفلاتر النشطة بكفاءة
  const activeFilterCount = useMemo(() => {
    return ADVANCED_FILTER_KEYS?.reduce((count, key) => {
      const val = filters[key as keyof typeof filters];
      return val && val !== '' ? count + 1 : count;
    }, 0);
  }, [filters]);

  // 4. معالج مسح الفلاتر
  const handleClearAll = useCallback(() => {
    resetFilters();
    setCategorySearch('');
    setBrandSearch('');
    setSubCategorySearch('');
    setQuery('');
    setSku('');
    setColor('');
    setMinPrice('');
    setMaxPrice('');
    setWeightMin('');
    setWeightMax('');
    setVolumeMin('');
    setVolumeMax('');
    setSoldMin('');
    setSoldMax('');
  }, [resetFilters]);

  return (
    <div className="space-y-4 w-full">
      {/* ── Primary Search Row ── */}
      <div className="flex flex-col md:flex-row gap-3 items-center">
        <EntitySearchBar
          placeholder={tCommon('search') || 'Search products...'}
          onSearch={(val) => setQuery(val)}
          defaultValue={query}
        />

        <Button
          variant="outline"
          onClick={() => setIsDrawerOpen(true)}
          className="h-12 px-5 gap-2.5 bg-background/50 border-border/40 font-bold relative title-gradient"
          id="advanced-filters-toggle"
        >
          <Icons.Settings className="w-4 h-4 text-foreground/60" />
          {t('filters.advancedFilters', { defaultValue: 'Advanced Filters' })}
          {activeFilterCount > 0 && (
            <span className="absolute -top-2 -right-2 rtl:-right-auto rtl:-left-2 flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-black shadow-md">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* ── Filter Drawer ── */}
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
              variant="destructive"
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

          <FilterSection title={t('filters.classification', { defaultValue: 'Classification' })}>
            <SearchableSelect
              label="Search Categories"
              icon={Tag}
              value={filters.category || ''}
              isLoading={isCategoriesFetching}
              options={(categoriesData?.data as unknown as SearchOption[]) || []}
              getDisplayValue={(opt: SearchOption) => getTrans(opt.name as LocalizedString)}
              onSearch={(term) => setCategorySearch(term)}
              onSelect={(id) => setFilters({ category: id, SubCategories: '' })}
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

          <FilterSection title={t('filters.priceRange', { defaultValue: 'Price Range' })}>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Min Price"
                icon={DollarSign}
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="h-10"
                error={filterErrors.price_range ? ' ' : undefined}
              />
              <Input
                label='Max price'
                icon={DollarSign}
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-10"
                error={filterErrors.price_range ? ' ' : undefined}
              />
            </div>
            {filterErrors.price_range && (
              <p className="text-xs text-destructive mt-1 animate-in fade-in duration-300">
                {t('filters.minExceedsMax', { defaultValue: 'Min value cannot be greater than max' })}
              </p>
            )}
          </FilterSection>

          <FilterSection title={t('filters.weight', { defaultValue: 'Weight' })}>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                icon={Scale}
                label="Min"
                value={weightMin}
                onChange={(e) => setWeightMin(e.target.value)}
                className="h-10"
                error={filterErrors.weight_range ? ' ' : undefined}
              />
              <Input
                type="number"
                icon={Scale}
                label="Max"
                value={weightMax}
                onChange={(e) => setWeightMax(e.target.value)}
                className="h-10"
                error={filterErrors.weight_range ? ' ' : undefined}
              />
            </div>
            {filterErrors.weight_range && (
              <p className="text-xs text-destructive mt-1 animate-in fade-in duration-300">
                {t('filters.minExceedsMax', { defaultValue: 'Min value cannot be greater than max' })}
              </p>
            )}
            <Select
              label={t('filters.weightUnit', { defaultValue: 'Weight Unit' })}
              value={filters.weight_unit || ''}
              onChange={(e) => setFilter('weight_unit', e.target.value)}
              options={[...WEIGHT_UNITS]}
              className="h-10 mt-3"
              error={filterErrors.weight_unit ? t('filters.weightUnitRequired', { defaultValue: 'Weight unit is required when filtering by weight' }) : undefined}
            />
          </FilterSection>

          <FilterSection title={t('filters.volume', { defaultValue: 'Volume' })}>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                label="Min"
                icon={Box}
                value={volumeMin}
                onChange={(e) => setVolumeMin(e.target.value)}
                className="h-10"
                error={filterErrors.volume_range ? ' ' : undefined}
              />
              <Input
                type="number"
                label="Max"
                icon={Box}
                value={volumeMax}
                onChange={(e) => setVolumeMax(e.target.value)}
                className="h-10"
                error={filterErrors.volume_range ? ' ' : undefined}
              />
            </div>
            {filterErrors.volume_range && (
              <p className="text-xs text-destructive mt-1 animate-in fade-in duration-300">
                {t('filters.minExceedsMax', { defaultValue: 'Min value cannot be greater than max' })}
              </p>
            )}
            <Select
              label={t('filters.volumeUnit', { defaultValue: 'Volume Unit' })}
              value={filters.volume_unit || ''}
              onChange={(e) => setFilter('volume_unit', e.target.value)}
              options={[...VOLUME_UNITS]}
              error={filterErrors.volume_unit ? t('filters.volumeUnitRequired', { defaultValue: 'Volume unit is required when filtering by volume' }) : undefined}
            />
          </FilterSection>

          <FilterSection title={t('filters.unitsSold', { defaultValue: 'Units Sold' })}>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                label="Min"
                icon={TrendingUp}
                value={soldMin}
                onChange={(e) => setSoldMin(e.target.value)}
                className="h-10"
                error={filterErrors.sold_range ? ' ' : undefined}
              />
              <Input
                type="number"
                label="Max"
                icon={TrendingUp}
                value={soldMax}
                onChange={(e) => setSoldMax(e.target.value)}
                className="h-10"
                error={filterErrors.sold_range ? ' ' : undefined}
              />
            </div>
            {filterErrors.sold_range && (
              <p className="text-xs text-destructive mt-1 animate-in fade-in duration-300">
                {t('filters.minExceedsMax', { defaultValue: 'Min value cannot be greater than max' })}
              </p>
            )}
          </FilterSection>
        </div>
      </FilterDrawer>
    </div>
  );
}

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