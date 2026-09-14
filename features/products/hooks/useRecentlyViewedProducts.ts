"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { productsApi } from "@/features/products/api";
import { useRecentlyViewedStore } from "@/store/recently-viewed-store";
import { Product } from "@/types";

export function useRecentlyViewedProducts(excludeId?: string) {
  const locale = useLocale();
  const ids = useRecentlyViewedStore((state) => state.ids).filter(
    (id) => id !== excludeId,
  );

  const { data, isLoading } = useQuery({
    queryKey: ["products", "by-ids", ids, locale],
    queryFn: async () => {
      const response = await productsApi.getManyByIds(ids);
      return response.data || [];
    },
    enabled: ids.length > 0,
  });

  // The backend's $in query doesn't preserve input order, so re-sort to the
  // store's most-recent-first order using the fetched products.
  const products = useMemo(() => {
    if (!data?.length) return [];
    const byId = new Map(data.map((product) => [product._id, product]));
    return ids
      .map((id) => byId.get(id))
      .filter((product): product is Product => !!product);
  }, [data, ids]);

  return { products, isLoading: ids.length > 0 && isLoading };
}
