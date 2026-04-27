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
  [key: string]: any;
}

export function useProducts(params?: UseProductsParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const response = await productsApi.getAll(params);
      return response;
    },
    throwOnError: true,
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

import { useToast } from '@/shared/hooks/useToast';
import { productsApi } from '@/features/products/api';

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: Partial<Product> | FormData) => {
      const response = await productsApi.create(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create product');
      console.log("Backend Error:", error);
    }
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> | FormData }) => {
      const response = await productsApi.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
      toast.success('Product updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update product');
      console.error("Backend Error:", error);
    }
  });
}
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await productsApi.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete product');
    }
  });
}

export function useRestoreProduct() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await productsApi.restore(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product restored successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to restore product');
    }
  });
}

export function useHardDeleteProduct() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await productsApi.hardDelete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product permanently deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete product permanently');
    }
  });
}
