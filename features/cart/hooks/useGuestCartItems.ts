"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { productsApi } from "@/features/products/api";
import { CartItem, useCartStore } from "@/store/cart-store";

/**
 * Guest cart items with product data in the current locale.
 *
 * The store persists a product snapshot taken at add-to-cart time, so its
 * name/price are frozen in the language (and state) of that moment. This hook
 * refetches the products by id with the locale in the query key and overlays
 * the fresh data. The snapshot stays as a fallback while loading, on error,
 * or when a product no longer exists.
 */
export function useGuestCartItems(): CartItem[] {
  const locale = useLocale();
  const items = useCartStore((state) => state.items);

  const ids = useMemo(
    () => Array.from(new Set(items.map((item) => item.productId))),
    [items],
  );

  const { data } = useQuery({
    queryKey: ["products", "by-ids", ids, locale],
    queryFn: async () => {
      const response = await productsApi.getManyByIds(ids);
      return response.data || [];
    },
    enabled: ids.length > 0,
  });

  return useMemo(() => {
    if (!data?.length) return items;
    const byId = new Map(data.map((product) => [product._id, product]));
    return items.map((item) => {
      const fresh = byId.get(item.productId);
      if (!fresh) return item;
      return {
        ...item,
        product: {
          ...item.product,
          ...fresh,
          variants: fresh.variants?.length
            ? fresh.variants
            : item.product?.variants,
        },
      };
    });
  }, [items, data]);
}
