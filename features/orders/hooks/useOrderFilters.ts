'use client';

import { useCallback, useMemo } from 'react';
import { useQueryState } from '@/shared/hooks/useQueryState';
import { OrderFilters } from '@/features/orders/types';

const DEFAULT_FILTERS: OrderFilters = {
  search: '',
  status: '',
  paymentStatus: '',
  paymentMethod: '',
  dateFrom: '',
  dateTo: '',
};

export function useOrderFilters() {
  const { getQueryParam, setQueryParams } = useQueryState();

  const filters: OrderFilters = useMemo(
    () => ({
      search: getQueryParam('search', ''),
      status: getQueryParam('status', ''),
      paymentStatus: getQueryParam('paymentStatus', ''),
      paymentMethod: getQueryParam('paymentMethod', ''),
      dateFrom: getQueryParam('dateFrom', ''),
      dateTo: getQueryParam('dateTo', ''),
    }),
    [getQueryParam],
  );

  const sortField = getQueryParam('sortBy', 'createdAt');
  const sortDirection = getQueryParam('sortDir', 'desc');

  const setFilter = useCallback(
    (key: keyof OrderFilters, value: string) => {
      setQueryParams({ [key]: value || null, page: '1' });
    },
    [setQueryParams],
  );

  const setSorting = useCallback(
    (field: string, direction: string) => {
      setQueryParams({ sortBy: field, sortDir: direction });
    },
    [setQueryParams],
  );

  const resetFilters = useCallback(() => {
    setQueryParams({
      search: null,
      status: null,
      paymentStatus: null,
      paymentMethod: null,
      dateFrom: null,
      dateTo: null,
      page: '1',
    });
  }, [setQueryParams]);

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(
      ([, value]) => value !== '' && value !== DEFAULT_FILTERS['' as keyof OrderFilters],
    ).length;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  return {
    filters,
    sortField,
    sortDirection,
    setFilter,
    setSorting,
    resetFilters,
    activeFilterCount,
    hasActiveFilters,
  };
}
