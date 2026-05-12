'use client';

import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { Product, ApiResponse, ProductWithVariants } from '@/types';



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
  [key: string]: any;
}

export function useProducts(params?: UseProductsParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const response = await productsApi.getAll(params);
      return response;
    },
    enabled: options?.enabled !== undefined ? options.enabled : true,
  });
}

export function useProduct(id: string, options: { all_langs: true }): UseQueryResult<ProductWithVariants, Error>;
export function useProduct(id: string, options?: { all_langs?: false }): UseQueryResult<Product, Error>;
export function useProduct(id: string, options?: { all_langs?: boolean }): UseQueryResult<any, Error> {
  const all_langs = options?.all_langs ?? false;
  return useQuery({
    queryKey: ['products', id, { all_langs }],
    queryFn: async () => {
      const params = all_langs ? { all_langs: 'true' } : undefined;
      const response = await productsApi.getOne(id, params);
      return response.data;
    },
    enabled: !!id,
    throwOnError: true,
  });
}

import { productsApi } from '@/features/products/api';

export function useCreateProduct() {
  const queryClient = useQueryClient();


  return useMutation({
    mutationFn: async (data: Partial<Product> | FormData) => {
      const response = await productsApi.create(data);
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: Error) => {
      console.log("Backend Error:", error);
    }
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> | FormData }): Promise<ProductWithVariants> => {
      const response = await productsApi.update(id, data);
      return response.data as unknown as ProductWithVariants;
    },
    onSuccess: async (data, variables) => {
      // 1. تحديث قائمة المنتجات (الكاش المكون من عنصرين)
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'products' && query.queryKey.length === 2,
      });

      // 2. 🔴 الحل السحري: مسح كاش أي منتج مفرد (الكاش المكون من 3 عناصر أو أكثر)
      // هذا سيمسح الـ Slug القديم، والـ Slug الجديد، وأي شيء يخص صفحة التعديل بصمت!
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'products' && query.queryKey.length >= 3,
        refetchType: 'none', // صمت تام: امسح البيانات ولكن لا ترسل أي طلب GET الآن
      });
    },
    onError: (error: Error) => {
      console.error("Backend Error:", error);
    }
  });
}
export function useDeleteProduct() {
  const queryClient = useQueryClient();


  return useMutation({
    mutationFn: async (id: string) => {
      const response = await productsApi.delete(id);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
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
      await queryClient.invalidateQueries({ queryKey: ['products'] });
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
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    },

  });
}
