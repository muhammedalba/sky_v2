'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

/**
 * A hook to manage state in the URL query parameters.
 * Highly useful for pagination, search, and filtering in dashboards.
 */
export function useQueryState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getQueryParam = useCallback(
    (key: string, defaultValue: string = '') => {
      return searchParams.get(key) || defaultValue;
    },
    [searchParams]
  );

  const setQueryParam = useCallback(
    (key: string, value: string | number | null) => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }

      const query = params.toString();
      const url = `${pathname}${query ? `?${query}` : ''}`;
      
      // We use scroll: false to prevent the page from jumping to top
      router.push(url, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const setQueryParams = useCallback(
    (newParams: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      const query = params.toString();
      const url = `${pathname}${query ? `?${query}` : ''}`;
      
      router.push(url, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return { getQueryParam, setQueryParam, setQueryParams, searchParams };
}
