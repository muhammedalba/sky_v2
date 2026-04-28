'use client';

import { useMemo, useCallback } from 'react';
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

export function useProductFilters() {
  const { getQueryParam, setQueryParams, setQueryParam } = useQueryState();

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
  const apiParams = useMemo(() => {
    const params: Record<string, string | number> = {};
    
    // We map queryString to queryString (or keyword if backend prefers, but standard NestJS QueryString usually looks for the object. Let's pass it as queryString)
    // The prompt says: GET /products?queryString=&all_langs=&...
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        params[key] = value;
      }
    });

    return params;
  }, [filters]);

  return {
    filters,
    apiParams,
    setFilter,
    setFilters,
    resetFilters,
  };
}
