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
    <T extends string | number | boolean = string>(
      key: string,
      defaultValue?: T
    ): T => {
      const value = searchParams.get(key);

      if (value === null) return (defaultValue ?? '') as T;

      // محاولة ذكية لمعرفة نوع القيمة المطلوبة بناءً على القيمة الافتراضية
      if (typeof defaultValue === 'number') return Number(value) as T;
      if (typeof defaultValue === 'boolean') return (value === 'true') as T;

      return value as T;
    },
    [searchParams]
  );




  const setQueryParam = useCallback(
    (key: string, value: string | number | null) => {
      const params = new URLSearchParams(searchParams.toString());
      const oldValue = params.get(key);
      const newValue = value !== null ? String(value) : null;

      if (newValue === oldValue || (newValue === null && oldValue === null)) return;

      if (newValue === null || newValue === '') {
        params.delete(key);
      } else {
        params.set(key, newValue);
      }

      const query = params.toString();
      const url = `${pathname}${query ? `?${query}` : ''}`;

      router.push(url, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const setQueryParams = useCallback(
    (newParams: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      let hasChanged = false;

      Object.entries(newParams).forEach(([key, value]) => {
        const oldValue = params.get(key);
        const newValue = value !== null ? String(value) : null;

        if (newValue === oldValue) return;

        hasChanged = true;
        if (newValue === null || newValue === '') {
          params.delete(key);
        } else {
          params.set(key, newValue);
        }
      });

      if (!hasChanged) return;

      const query = params.toString();
      const url = `${pathname}${query ? `?${query}` : ''}`;

      router.push(url, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return { getQueryParam, setQueryParam, setQueryParams, searchParams };
}
