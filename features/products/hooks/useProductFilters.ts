'use client';

import { useMemo, useCallback, useState } from 'react';
import { useQueryState } from '@/shared/hooks/useQueryState';

export interface ProductFilters {
  keywords: string;
  skuSearch: string;
  color: string;
  'pricerange[min]': string;
  'pricerange[max]': string;
  category: string;
  brand: string;
  SubCategories: string;
  weight_min: string;
  weight_max: string;
  weight_unit: string;
  volume_min: string;
  volume_max: string;
  volume_unit: string;
  sold_min: string;
  sold_max: string;
}

export interface FilterErrors {
  weight_unit?: string;
  volume_unit?: string;
  weight_range?: string;
  volume_range?: string;
  price_range?: string;
  sold_range?: string;
}

export function useProductFilters() {
  const { getQueryParam, setQueryParams } = useQueryState();
  const [filterErrors, setFilterErrors] = useState<FilterErrors>({});

  const filters = useMemo<ProductFilters>(() => ({
    keywords: getQueryParam('keywords', ''),
    skuSearch: getQueryParam('skuSearch', ''),
    color: getQueryParam('color', ''),
    'pricerange[min]': getQueryParam('pricerange[min]', ''),
    'pricerange[max]': getQueryParam('pricerange[max]', ''),
    category: getQueryParam('category', ''),
    brand: getQueryParam('brand', ''),
    SubCategories: getQueryParam('SubCategories', ''),
    weight_min: getQueryParam('weight_min', ''),
    weight_max: getQueryParam('weight_max', ''),
    weight_unit: getQueryParam('weight_unit', ''),
    volume_min: getQueryParam('volume_min', ''),
    volume_max: getQueryParam('volume_max', ''),
    volume_unit: getQueryParam('volume_unit', ''),
    sold_min: getQueryParam('sold_min', ''),
    sold_max: getQueryParam('sold_max', ''),
  }), [getQueryParam]);

  const setFilter = useCallback((key: keyof ProductFilters, value: string | number | null) => {
    // When a filter changes, we typically want to reset the page to 1
    setQueryParams({ [key]: value, page: 1 });
  }, [setQueryParams]);

  const setFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setQueryParams({ ...newFilters, page: 1 });
  }, [setQueryParams]);

  const resetFilters = useCallback(() => {
    const defaultFilters: Record<keyof ProductFilters, null> = {
      keywords: null,
      skuSearch: null,
      color: null,
      'pricerange[min]': null,
      'pricerange[max]': null,
      category: null,
      brand: null,
      SubCategories: null,
      weight_min: null,
      weight_max: null,
      weight_unit: null,
      volume_min: null,
      volume_max: null,
      volume_unit: null,
      sold_min: null,
      sold_max: null,
    };
    setQueryParams({ ...defaultFilters, page: 1 });
  }, [setQueryParams]);

  // Derived state to pass directly to API
  // Client-side validation mirrors backend variant-query-builder.ts rules:
  //   - weight_min/max requires weight_unit
  //   - volume_min/max requires volume_unit
  // Invalid combos are stripped from params to prevent 400 errors.
  const apiParams = useMemo(() => {
    const params: Record<string, string | number> = {};
    const errors: FilterErrors = {};

    const hasWeight = filters.weight_min !== '' || filters.weight_max !== '';
    const hasVolume = filters.volume_min !== '' || filters.volume_max !== '';

    // --- Range inversion checks (min > max) ---
    const weightMinVal = filters.weight_min !== '' ? Number(filters.weight_min) : null;
    const weightMaxVal = filters.weight_max !== '' ? Number(filters.weight_max) : null;
    const weightRangeInvalid = weightMinVal !== null && weightMaxVal !== null && weightMinVal > weightMaxVal;

    const volumeMinVal = filters.volume_min !== '' ? Number(filters.volume_min) : null;
    const volumeMaxVal = filters.volume_max !== '' ? Number(filters.volume_max) : null;
    const volumeRangeInvalid = volumeMinVal !== null && volumeMaxVal !== null && volumeMinVal > volumeMaxVal;

    const priceMinVal = filters['pricerange[min]'] !== '' ? Number(filters['pricerange[min]']) : null;
    const priceMaxVal = filters['pricerange[max]'] !== '' ? Number(filters['pricerange[max]']) : null;
    const priceRangeInvalid = priceMinVal !== null && priceMaxVal !== null && priceMinVal > priceMaxVal;

    const soldMinVal = filters.sold_min !== '' ? Number(filters.sold_min) : null;
    const soldMaxVal = filters.sold_max !== '' ? Number(filters.sold_max) : null;
    const soldRangeInvalid = soldMinVal !== null && soldMaxVal !== null && soldMinVal > soldMaxVal;

    // Validate: weight range requires unit
    if (hasWeight && !filters.weight_unit) {
      errors.weight_unit = 'weight_unit_required';
    }
    // Validate: volume range requires unit
    if (hasVolume && !filters.volume_unit) {
      errors.volume_unit = 'volume_unit_required';
    }
    // Validate: min must not exceed max
    if (weightRangeInvalid) errors.weight_range = 'min_exceeds_max';
    if (volumeRangeInvalid) errors.volume_range = 'min_exceeds_max';
    if (priceRangeInvalid) errors.price_range = 'min_exceeds_max';
    if (soldRangeInvalid) errors.sold_range = 'min_exceeds_max';

    // Build clean params, skipping invalid combos
    Object.entries(filters).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) return;

      // Skip weight params when unit is missing or range invalid
      if (hasWeight && !filters.weight_unit || weightRangeInvalid) {
        if (['weight_min', 'weight_max', 'weight_unit'].includes(key)) return;
      }
      // Skip volume params when unit is missing or range invalid
      if (hasVolume && !filters.volume_unit || volumeRangeInvalid) {
        if (['volume_min', 'volume_max', 'volume_unit'].includes(key)) return;
      }
      // Skip price params when range invalid
      if (priceRangeInvalid) {
        if (['pricerange[min]', 'pricerange[max]'].includes(key)) return;
      }
      // Skip sold params when range invalid
      if (soldRangeInvalid) {
        if (['sold_min', 'sold_max'].includes(key)) return;
      }

      params[key] = value;
    });

    // Batch-update errors (only if changed to avoid infinite loops)
    setFilterErrors((prev) => {
      const prevKeys = Object.keys(prev).sort().join(',');
      const newKeys = Object.keys(errors).sort().join(',');
      return prevKeys === newKeys ? prev : errors;
    });

    return params;
  }, [filters]);

  return {
    filters,
    apiParams,
    filterErrors,
    setFilter,
    setFilters,
    resetFilters,
  };
}
