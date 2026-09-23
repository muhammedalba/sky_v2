"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { Product, ProductWithVariants } from "@/types";

export interface UseProductsParams {
  page?: number;
  limit?: number;
  keywords?: string; // mapping to search in old code
  skuSearch?: string;
  category?: string;
  all_langs?: boolean | string;
  color?: string;
  weight_min?: string | number;
  weight_max?: string | number;
  weight_unit?: string;
  volume_min?: string | number;
  volume_max?: string | number;
  volume_unit?: string;
  sold_min?: string | number;
  sold_max?: string | number;
  isDeleted?: string | boolean;
  fields?: string;
  [key: string]: unknown;
}

export function useProducts(
  params?: UseProductsParams,
  options?: { enabled?: boolean; refetchOnWindowFocus?: boolean },
) {
  const locale = useLocale();
  return useQuery({
    queryKey: ["products", locale, params],
    queryFn: async () => {
      const response = await productsApi.getAll(params);
      return response;
    },
    enabled: options?.enabled !== undefined ? options.enabled : true,
    // يتطابق مع next: { revalidate: 60 } في page.tsx
    // يمنع إعادة الـ fetch فور الـ hydration بعد SSR prefetch
    staleTime: 60 * 1000,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
  });
}

export function useProduct(
  id: string,
  options?: {
    all_langs?: boolean;
    initialData?: ProductWithVariants | null;
    refetchOnWindowFocus?: boolean;
    staleTime?: number;
  },
): UseQueryResult<ProductWithVariants, Error> {
  const all_langs = options?.all_langs ?? false;
  const locale = useLocale();
  return useQuery<ProductWithVariants, Error>({
    queryKey: ["products", id, locale, { all_langs }],
    queryFn: async () => {
      const params = all_langs ? { all_langs: "true" } : undefined;
      const response = await productsApi.getOne(id, params);
      return response.data as unknown as ProductWithVariants;
    },
    enabled: !!id,
    throwOnError: true,
    // ✅ إذا وُجدت بيانات أولية من SSR، لا يُرسَل أي طلب عند أول تحميل
    initialData: options?.initialData ?? undefined,
    // الافتراضي يتطابق مع مدة الكاش على السيرفر (1 ساعة)
    staleTime: options?.staleTime ?? 60 * 60 * 1000,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
  });
}

import { productsApi } from "@/features/products/api";

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Product> | FormData) => {
      const response = await productsApi.create(data);
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: Error) => {
      console.log("Backend Error:", error);
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Product> | FormData;
    }): Promise<ProductWithVariants> => {
      const response = await productsApi.update(id, data);
      return response.data as unknown as ProductWithVariants;
    },
    onSuccess: async () => {
      // 1. تحديث قائمة المنتجات (الكاش المكون من عنصرين)
      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "products" && query.queryKey.length === 3,
      });

      // 2. 🔴 الحل السحري: إزالة كاش أي منتج مفرد تماماً من الذاكرة لمنع استخدام البيانات القديمة عند إعادة فتح صفحة التعديل
      queryClient.removeQueries({
        predicate: (query) =>
          query.queryKey[0] === "products" && query.queryKey.length >= 4,
      });
      // Next.js ISR tags (products, product-<slug>) are revalidated by the backend after commit.
    },
    onError: (error: Error) => {
      console.error("Backend Error:", error);
    },
  });
}
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await productsApi.delete(id);
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useRestoreProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await productsApi.restore(id);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useHardDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await productsApi.hardDelete(id);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
