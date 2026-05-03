'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product, ApiResponse } from '@/types';

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

export function useProduct(id: string, options?: { all_langs?: boolean }) {
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
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> | FormData }) => {
      const response = await productsApi.update(id, data);
      return response.data;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
      
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
