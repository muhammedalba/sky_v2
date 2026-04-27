'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const getTrans = useTrans();

  // Local state for debounced inputs
  const [query, setQuery] = useState(filters.keywords || '');
  const [sku, setSku] = useState(filters.skuSearch || '');
  const [color, setColor] = useState(filters.color || '');
  const [minPrice, setMinPrice] = useState(filters['pricerange[min]'] || '');
  const [maxPrice, setMaxPrice] = useState(filters['pricerange[max]'] || '');

  // Search states for taxonomy filters
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [subCategorySearch, setSubCategorySearch] = useState('');

  // Fetching data for filters
  const { data: categoriesData, isFetching: isCategoriesFetching } = useCategories({ keywords: categorySearch }, { enabled: isExpanded });
  const { data: brandsData, isFetching: isBrandsFetching } = useBrands({ keywords: brandSearch }, { enabled: isExpanded });
  const { data: subCategoriesData, isFetching: isSubCategoriesFetching } = useSubCategories(
    { keywords: subCategorySearch }, 
    { enabled: isExpanded }
  );

  // Debounced setters
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

  // Sync back if URL changes externally
  useEffect(() => { setQuery(filters.keywords || ''); }, [filters.keywords]);
  useEffect(() => { setSku(filters.skuSearch || ''); }, [filters.skuSearch]);
  useEffect(() => { setColor(filters.color || ''); }, [filters.color]);
  useEffect(() => { setMinPrice(filters['pricerange[min]'] || ''); }, [filters['pricerange[min]']]);
  useEffect(() => { setMaxPrice(filters['pricerange[max]'] || ''); }, [filters['pricerange[max]']]);

  return (
    <div className="space-y-4 w-full">
      {/* Primary Search Row */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder={tCommon('search') || 'Search products...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-11 h-12 w-full bg-background/50 border-border/40 focus-visible:ring-primary shadow-sm"
          />
        </div>
        <Button 
          variant="outline" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-12 px-4 gap-2 bg-background/50 border-border/40 font-semibold"
        >
          <Icons.Settings className="w-4 h-4" />
          {isExpanded ? 'Hide Filters' : 'Advanced Filters'}
        </Button>
      </div>

      {/* Advanced Filters Grid */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 bg-background/50 backdrop-blur-sm rounded-2xl border border-border/40 shadow-sm animate-in fade-in slide-in-from-top-2">
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">SKU Search</label>
            <Input 
              placeholder="Search by SKU..." 
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Color</label>
            <Input 
              placeholder="e.g. red, blue" 
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Category</label>
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
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Brand</label>
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
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Sub Category</label>
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
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">All Languages</label>
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
          </div>

          {/* Price Filters */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Price Range</label>
            <div className="flex gap-2">
              <Input 
                type="number" 
                placeholder="Min" 
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="h-10"
              />
              <Input 
                type="number" 
                placeholder="Max" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          {/* Weight Filters */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Weight Range</label>
            <div className="flex gap-2">
              <Input 
                type="number" 
                placeholder="Min" 
                value={filters.weight_min || ''}
                onChange={(e) => setFilter('weight_min', e.target.value)}
                className="h-10"
              />
              <Input 
                type="number" 
                placeholder="Max" 
                value={filters.weight_max || ''}
                onChange={(e) => setFilter('weight_max', e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Weight Unit</label>
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
          </div>

          {/* Volume Filters */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Volume Range</label>
            <div className="flex gap-2">
              <Input 
                type="number" 
                placeholder="Min" 
                value={filters.volume_min || ''}
                onChange={(e) => setFilter('volume_min', e.target.value)}
                className="h-10"
              />
              <Input 
                type="number" 
                placeholder="Max" 
                value={filters.volume_max || ''}
                onChange={(e) => setFilter('volume_max', e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Volume Unit</label>
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
          </div>

          {/* Sold Filters */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Units Sold Range</label>
            <div className="flex gap-2">
              <Input 
                type="number" 
                placeholder="Min" 
                value={filters.sold_min || ''}
                onChange={(e) => setFilter('sold_min', e.target.value)}
                className="h-10"
              />
              <Input 
                type="number" 
                placeholder="Max" 
                value={filters.sold_max || ''}
                onChange={(e) => setFilter('sold_max', e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-end justify-end md:col-span-2 lg:col-span-3 xl:col-span-4 mt-2">
            <Button 
              variant="secondary" 
              onClick={() => {
                resetFilters();
                setCategorySearch('');
                setBrandSearch('');
                setSubCategorySearch('');
              }} 
              className="font-bold rounded-xl"
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
