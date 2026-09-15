'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useProductFilters, ProductFilters } from '../../hooks/useProductFilters';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useBrands } from '@/features/brands/hooks/useBrands';
import { useSubCategories } from '@/features/categories/hooks/useSubCategories';
import { useTrans } from '@/shared/hooks/useTrans';
import { LocalizedString } from '@/types';
import { SearchOption, SearchableSelect } from '@/shared/ui/form/SearchableSelect';
import EntitySearchBar from '@/shared/ui/dashboard/EntitySearchBar';
import { FilterDrawer } from '@/shared/ui/FilterDrawer';
import { SettingsIcon } from '@/shared/ui/Icons';
import {
  HashIcon as Hash,
  PaletteIcon as Palette,
  TagIcon as Tag,
  BriefcaseIcon as Briefcase,
  LayersIcon as Layers,
  DollarSignIcon as DollarSign,
  ScaleIcon as Scale,
  BoxIcon as Box,
  TrendingUpIcon as TrendingUp,
  CheckIcon as Check,
} from '@/shared/ui/Icons';
import { WEIGHT_UNITS, VOLUME_UNITS, ADVANCED_FILTER_KEYS } from '@/shared/constants/product-constants';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { cn } from '@/lib/utils';

const COLOR_SWATCHES: {
  value: string;
  swatchClass: string;
  light?: boolean;
}[] = [
  { value: 'Black', swatchClass: 'bg-black' },
  { value: 'Blue', swatchClass: 'bg-blue-600' },
  { value: 'Grey', swatchClass: 'bg-gray-200', light: true },
  { value: 'Red', swatchClass: 'bg-red-500' },
  { value: 'Green', swatchClass: 'bg-emerald-700' },
  { value: 'Yellow', swatchClass: 'bg-yellow-300', light: true },
];

export function ProductFiltersBar() {
  const t = useTranslations('products');
  const tCommon = useTranslations('buttons');
  const { filters, setFilter, setFilters, resetFilters, filterErrors } = useProductFilters();
  const getTrans = useTrans();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // ── Local states for inputs (synced with external filters during render) ──
  const [inputs, setInputs] = useState(() => ({
    sku: filters.skuSearch || '',
    color: filters.color || '',
    minPrice: filters['pricerange[min]'] || '',
    maxPrice: filters['pricerange[max]'] || '',
    weightMin: filters.weight_min || '',
    weightMax: filters.weight_max || '',
    volumeMin: filters.volume_min || '',
    volumeMax: filters.volume_max || '',
    soldMin: filters.sold_min || '',
    soldMax: filters.sold_max || '',
  }));

  const [prevFilters, setPrevFilters] = useState(filters);

  // Synchronize with external filter changes (e.g., resetFilters or URL navigation) during render
  if (prevFilters !== filters) {
    setPrevFilters(filters);
    setInputs({
      sku: filters.skuSearch || '',
      color: filters.color || '',
      minPrice: filters['pricerange[min]'] || '',
      maxPrice: filters['pricerange[max]'] || '',
      weightMin: filters.weight_min || '',
      weightMax: filters.weight_max || '',
      volumeMin: filters.volume_min || '',
      volumeMax: filters.volume_max || '',
      soldMin: filters.sold_min || '',
      soldMax: filters.sold_max || '',
    });
  }

  // ── Search states for taxonomy ──
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [subCategorySearch, setSubCategorySearch] = useState('');

  // ── API Fetching ──
  const { data: categoriesData, isFetching: isCategoriesFetching } = useCategories(
    { keywords: categorySearch },
    { enabled: isDrawerOpen }
  );
  const { data: brandsData, isFetching: isBrandsFetching } = useBrands(
    { keywords: brandSearch },
    { enabled: isDrawerOpen }
  );
  const { data: subCategoriesData, isFetching: isSubCategoriesFetching } = useSubCategories(
    { keywords: subCategorySearch },
    { enabled: isDrawerOpen }
  );

  // Debounce timers reference to avoid race conditions and ghost re-writes on reset
  const debounceTimersRef = useRef<Record<string, NodeJS.Timeout>>({});

  const clearAllTimers = useCallback(() => {
    Object.values(debounceTimersRef.current).forEach((timer) => clearTimeout(timer));
    debounceTimersRef.current = {};
  }, []);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  // Event-driven debounced input changes
  const handleFieldChange = useCallback(
    (key: keyof ProductFilters, inputKey: keyof typeof inputs, value: string) => {
      setInputs((prev) => ({ ...prev, [inputKey]: value }));

      if (debounceTimersRef.current[key]) {
        clearTimeout(debounceTimersRef.current[key]);
      }

      debounceTimersRef.current[key] = setTimeout(() => {
        setFilter(key, value || null);
        delete debounceTimersRef.current[key];
      }, 500);
    },
    [setFilter]
  );

  // Handle color swatch click
  const handleColorSwatchClick = useCallback((swatchValue: string) => {
    if (debounceTimersRef.current.color) {
      clearTimeout(debounceTimersRef.current.color);
      delete debounceTimersRef.current.color;
    }
    const newValue =
      inputs.color.trim().toLowerCase() === swatchValue.toLowerCase()
        ? ''
        : swatchValue;
    setInputs((prev) => ({ ...prev, color: newValue }));
    setFilter('color', newValue || null);
  }, [inputs.color, setFilter]);

  // Active filters count
  const activeFilterCount = useMemo(() => {
    return ADVANCED_FILTER_KEYS?.reduce((count, key) => {
      const val = filters[key as keyof typeof filters];
      return val && val !== '' ? count + 1 : count;
    }, 0);
  }, [filters]);

  // Reset all filters
  const handleClearAll = useCallback(() => {
    clearAllTimers();

    setCategorySearch('');
    setBrandSearch('');
    setSubCategorySearch('');

    resetFilters();
  }, [clearAllTimers, resetFilters]);

  // Commit all drawer inputs immediately and close
  const handleApplyFilters = useCallback(() => {
    clearAllTimers();

    setFilters({
      skuSearch: inputs.sku || null,
      color: inputs.color || null,
      'pricerange[min]': inputs.minPrice || null,
      'pricerange[max]': inputs.maxPrice || null,
      weight_min: inputs.weightMin || null,
      weight_max: inputs.weightMax || null,
      volume_min: inputs.volumeMin || null,
      volume_max: inputs.volumeMax || null,
      sold_min: inputs.soldMin || null,
      sold_max: inputs.soldMax || null,
    });

    setIsDrawerOpen(false);
  }, [clearAllTimers, inputs, setFilters]);

  return (
    <div className="space-y-4 w-full">
      {/* ── Primary Search Row ── */}
      <div className="flex flex-col md:flex-row gap-3 items-center">
        <EntitySearchBar
          placeholder={tCommon('search') || 'Search products...'}
          onSearch={(val) => setFilter('keywords', val)}
          defaultValue={filters.keywords || ''}
        />

        <Button
          variant="outline"
          onClick={() => setIsDrawerOpen(true)}
          className="h-12 px-5 gap-2.5 bg-background/50 border-border/40 font-bold relative title-gradient"
          id="advanced-filters-toggle"
        >
          <SettingsIcon className="w-4 h-4 text-foreground/60" />
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
              onClick={handleApplyFilters}
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
              value={inputs.sku}
              onChange={(e) => handleFieldChange('skuSearch', 'sku', e.target.value)}
              icon={Hash}
              className="h-10"
            />
          </FilterSection>

          <FilterSection title={t('filters.color', { defaultValue: 'Color' })}>
            <div className="flex items-center gap-2.5 flex-wrap">
              {COLOR_SWATCHES.map((swatch) => {
                const isSelected =
                  inputs.color.trim().toLowerCase() === swatch.value.toLowerCase();
                return (
                  <button
                    key={swatch.value}
                    type="button"
                    aria-label={swatch.value}
                    aria-pressed={isSelected}
                    onClick={() => handleColorSwatchClick(swatch.value)}
                    className={cn(
                      'relative h-8 w-8 rounded-full border transition-transform hover:scale-110',
                      swatch.swatchClass,
                      swatch.light ? 'border-border' : 'border-transparent',
                      isSelected &&
                        'ring-2 ring-offset-2 ring-primary ring-offset-background',
                    )}
                  >
                    {isSelected && (
                      <Check
                        className={cn(
                          'absolute inset-0 m-auto h-4 w-4',
                          swatch.light ? 'text-foreground' : 'text-white',
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <Input
              icon={Palette}
              placeholder={t('filters.colorPlaceholder', { defaultValue: 'e.g. red, blue...' })}
              value={inputs.color}
              maxLength={30}
              onChange={(e) => handleFieldChange('color', 'color', e.target.value)}
              className="h-10 mt-3"
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
              onSearch={(term: string) => setCategorySearch(term)}
              onSelect={(id: string | number) => setFilters({ category: String(id), SubCategories: '' })}
              className="h-10 mt-7"
            />
            <SearchableSelect
              label="Search Brands"
              icon={Briefcase}
              value={filters.brand || ''}
              isLoading={isBrandsFetching}
              options={(brandsData?.data as unknown as SearchOption[]) || []}
              getDisplayValue={(opt: SearchOption) => getTrans(opt.name as LocalizedString)}
              onSearch={(term: string) => setBrandSearch(term)}
              onSelect={(id: string | number) => setFilter('brand', String(id))}
              className="h-10 my-5 mt-7"
            />
            <SearchableSelect
              icon={Layers}
              label="Search Sub Categories"
              value={filters.SubCategories || ''}
              isLoading={isSubCategoriesFetching}
              options={(subCategoriesData?.data as unknown as SearchOption[]) || []}
              getDisplayValue={(opt: SearchOption) => getTrans(opt.name as LocalizedString)}
              onSearch={(term: string) => setSubCategorySearch(term)}
              onSelect={(id: string | number) => setFilter('SubCategories', String(id))}
              className="h-10 mt-7"
            />
          </FilterSection>

          <FilterSection title={t('filters.priceRange', { defaultValue: 'Price Range' })}>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Min Price"
                icon={DollarSign}
                type="number"
                min="0"
                value={inputs.minPrice}
                onChange={(e) => handleFieldChange('pricerange[min]', 'minPrice', e.target.value)}
                className="h-10"
                error={filterErrors.price_range ? ' ' : undefined}
              />
              <Input
                label="Max price"
                icon={DollarSign}
                type="number"
                min="0"
                value={inputs.maxPrice}
                onChange={(e) => handleFieldChange('pricerange[max]', 'maxPrice', e.target.value)}
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
                min="0"
                icon={Scale}
                label="Min"
                value={inputs.weightMin}
                onChange={(e) => handleFieldChange('weight_min', 'weightMin', e.target.value)}
                className="h-10"
                error={filterErrors.weight_range ? ' ' : undefined}
              />
              <Input
                type="number"
                min="0"
                icon={Scale}
                label="Max"
                value={inputs.weightMax}
                onChange={(e) => handleFieldChange('weight_max', 'weightMax', e.target.value)}
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
              error={
                filterErrors.weight_unit
                  ? t('filters.weightUnitRequired', { defaultValue: 'Weight unit is required when filtering by weight' })
                  : undefined
              }
            />
          </FilterSection>

          <FilterSection title={t('filters.volume', { defaultValue: 'Volume' })}>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                min="0"
                label="Min"
                icon={Box}
                value={inputs.volumeMin}
                onChange={(e) => handleFieldChange('volume_min', 'volumeMin', e.target.value)}
                className="h-10"
                error={filterErrors.volume_range ? ' ' : undefined}
              />
              <Input
                type="number"
                min="0"
                label="Max"
                icon={Box}
                value={inputs.volumeMax}
                onChange={(e) => handleFieldChange('volume_max', 'volumeMax', e.target.value)}
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
              error={
                filterErrors.volume_unit
                  ? t('filters.volumeUnitRequired', { defaultValue: 'Volume unit is required when filtering by volume' })
                  : undefined
              }
            />
          </FilterSection>

          <FilterSection title={t('filters.unitsSold', { defaultValue: 'Units Sold' })}>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                min="0"
                label="Min"
                icon={TrendingUp}
                value={inputs.soldMin}
                onChange={(e) => handleFieldChange('sold_min', 'soldMin', e.target.value)}
                className="h-10"
                error={filterErrors.sold_range ? ' ' : undefined}
              />
              <Input
                type="number"
                min="0"
                label="Max"
                icon={TrendingUp}
                value={inputs.soldMax}
                onChange={(e) => handleFieldChange('sold_max', 'soldMax', e.target.value)}
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