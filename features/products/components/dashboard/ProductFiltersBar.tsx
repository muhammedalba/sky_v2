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

export function ProductFiltersBar() {
  const t = useTranslations('products');
  const tCommon = useTranslations('buttons');
  const { filters, setFilter, setFilters, resetFilters } = useProductFilters();
  const getTrans = useTrans();

  // ── Drawer open/close ────────────────────────────────
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // ── Local state for debounced inputs ─────────────────
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

  // ── Debounced setters ────────────────────────────────
  useEffect(() => {
    if (query === (filters.keywords || '')) return;
    const handler = setTimeout(() => setFilter('keywords', query), 500);
    return () => clearTimeout(handler);
  }, [query, setFilter, filters.keywords]);

  useEffect(() => {
    if (sku === (filters.skuSearch || '')) return;
    const handler = setTimeout(() => setFilter('skuSearch', sku), 500);
    return () => clearTimeout(handler);
  }, [sku, setFilter, filters.skuSearch]);

  useEffect(() => {
    if (color === (filters.color || '')) return;
    const handler = setTimeout(() => setFilter('color', color), 500);
    return () => clearTimeout(handler);
  }, [color, setFilter, filters.color]);

  useEffect(() => {
    if (minPrice === (filters['pricerange[min]'] || '')) return;
    const handler = setTimeout(() => setFilter('pricerange[min]', minPrice), 500);
    return () => clearTimeout(handler);
  }, [minPrice, setFilter, filters['pricerange[min]']]);

  useEffect(() => {
    if (maxPrice === (filters['pricerange[max]'] || '')) return;
    const handler = setTimeout(() => setFilter('pricerange[max]', maxPrice), 500);
    return () => clearTimeout(handler);
  }, [maxPrice, setFilter, filters['pricerange[max]']]);

  // ── Sync back if URL changes externally ──────────────
  useEffect(() => { setQuery(filters.keywords || ''); }, [filters.keywords]);
  useEffect(() => { setSku(filters.skuSearch || ''); }, [filters.skuSearch]);
  useEffect(() => { setColor(filters.color || ''); }, [filters.color]);
  useEffect(() => { setMinPrice(filters['pricerange[min]'] || ''); }, [filters['pricerange[min]']]);
  useEffect(() => { setMaxPrice(filters['pricerange[max]'] || ''); }, [filters['pricerange[max]']]);

  // ── Count active advanced filters (excluding keywords) ─
  const activeFilterCount = useMemo(() => {
    const advancedKeys: (keyof typeof filters)[] = [
      'skuSearch', 'color', 'category', 'brand', 'SubCategories',
      'pricerange[min]', 'pricerange[max]',
      'weight_min', 'weight_max', 'weight_unit',
      'volume_min', 'volume_max', 'volume_unit',
      'sold_min', 'sold_max', 'all_langs',
    ];
    return advancedKeys.filter((k) => filters[k] && filters[k] !== '').length;
  }, [filters]);

  // ── Clear all & close ────────────────────────────────
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
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1 group">
          <Icons.Search className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder={tCommon('search') || 'Search products...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-11 rtl:pl-4 rtl:pr-11 h-12 w-full bg-background/50 border-border/40 focus-visible:ring-primary shadow-sm"
          />
        </div>

        {/* Advanced Filters toggle button */}
        <Button
          variant="outline"
          onClick={() => setIsDrawerOpen(true)}
          className="h-12 px-5 gap-2.5 bg-background/50 border-border/40 font-bold relative"
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
            <FilterField label="SKU Search">
              <Input
                placeholder="Search by SKU..."
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="h-10"
              />
            </FilterField>

            <FilterField label="Color">
              <Input
                placeholder="e.g. red, blue"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10"
              />
            </FilterField>

            <FilterField label="All Languages">
              <Select
                value={filters.all_langs || ''}
                onChange={(e) => setFilter('all_langs', e.target.value)}
                options={[
                  { value: '', label: 'Default' },
                  { value: 'true', label: 'Yes' },
                  { value: 'false', label: 'No' },
                ]}
                className="h-10"
              />
            </FilterField>
          </FilterSection>

          {/* ═══ Section: Classification ════════════════ */}
          <FilterSection title={t('filters.classification', { defaultValue: 'Classification' })}>
            <FilterField label="Category">
              <SearchableSelect
                placeholder="All Categories"
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
            </FilterField>

            <FilterField label="Brand">
              <SearchableSelect
                placeholder="All Brands"
                value={filters.brand || ''}
                isLoading={isBrandsFetching}
                options={(brandsData?.data as unknown as SearchOption[]) || []}
                getDisplayValue={(opt: SearchOption) => getTrans(opt.name as LocalizedString)}
                onSearch={(term) => setBrandSearch(term)}
                onSelect={(id) => setFilter('brand', id)}
                className="h-10"
              />
            </FilterField>

            <FilterField label="Sub Category">
              <SearchableSelect
                placeholder="All Sub Categories"
                value={filters.SubCategories || ''}
                isLoading={isSubCategoriesFetching}
                options={(subCategoriesData?.data as unknown as SearchOption[]) || []}
                getDisplayValue={(opt: SearchOption) => getTrans(opt.name as LocalizedString)}
                onSearch={(term) => setSubCategorySearch(term)}
                onSelect={(id) => setFilter('SubCategories', id)}
                className="h-10"
              />
            </FilterField>
          </FilterSection>

          {/* ═══ Section: Price ═════════════════════════ */}
          <FilterSection title={t('filters.priceRange', { defaultValue: 'Price Range' })}>
            <div className="grid grid-cols-2 gap-3">
              <FilterField label="Min">
                <Input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-10"
                />
              </FilterField>
              <FilterField label="Max">
                <Input
                  type="number"
                  placeholder="999"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-10"
                />
              </FilterField>
            </div>
          </FilterSection>

          {/* ═══ Section: Weight ════════════════════════ */}
          <FilterSection title={t('filters.weight', { defaultValue: 'Weight' })}>
            <div className="grid grid-cols-2 gap-3">
              <FilterField label="Min">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.weight_min || ''}
                  onChange={(e) => setFilter('weight_min', e.target.value)}
                  className="h-10"
                />
              </FilterField>
              <FilterField label="Max">
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.weight_max || ''}
                  onChange={(e) => setFilter('weight_max', e.target.value)}
                  className="h-10"
                />
              </FilterField>
            </div>
            <FilterField label="Unit">
              <Select
                value={filters.weight_unit || ''}
                onChange={(e) => setFilter('weight_unit', e.target.value)}
                options={[
                  { value: '', label: 'Any' },
                  { value: 'kg', label: 'kg' },
                  { value: 'g', label: 'g' },
                  { value: 'lb', label: 'lb' },
                  { value: 'oz', label: 'oz' },
                ]}
                className="h-10"
              />
            </FilterField>
          </FilterSection>

          {/* ═══ Section: Volume ════════════════════════ */}
          <FilterSection title={t('filters.volume', { defaultValue: 'Volume' })}>
            <div className="grid grid-cols-2 gap-3">
              <FilterField label="Min">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.volume_min || ''}
                  onChange={(e) => setFilter('volume_min', e.target.value)}
                  className="h-10"
                />
              </FilterField>
              <FilterField label="Max">
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.volume_max || ''}
                  onChange={(e) => setFilter('volume_max', e.target.value)}
                  className="h-10"
                />
              </FilterField>
            </div>
            <FilterField label="Unit">
              <Select
                value={filters.volume_unit || ''}
                onChange={(e) => setFilter('volume_unit', e.target.value)}
                options={[
                  { value: '', label: 'Any' },
                  { value: 'l', label: 'L' },
                  { value: 'ml', label: 'ml' },
                  { value: 'gal', label: 'gal' },
                ]}
                className="h-10"
              />
            </FilterField>
          </FilterSection>

          {/* ═══ Section: Sales ═════════════════════════ */}
          <FilterSection title={t('filters.unitsSold', { defaultValue: 'Units Sold' })}>
            <div className="grid grid-cols-2 gap-3">
              <FilterField label="Min">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.sold_min || ''}
                  onChange={(e) => setFilter('sold_min', e.target.value)}
                  className="h-10"
                />
              </FilterField>
              <FilterField label="Max">
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.sold_max || ''}
                  onChange={(e) => setFilter('sold_max', e.target.value)}
                  className="h-10"
                />
              </FilterField>
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
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
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
