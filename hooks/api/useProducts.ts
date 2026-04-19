'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Product, ApiResponse } from '@/types';

export function useProducts(params?: { page?: number; limit?: number; keywords?: string; category?: string; all_langs?: boolean }) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const response = await api.products.getAll(params);
      // The API returns { data: [...] } inside the axios data object
      return response as unknown as ApiResponse<Product[]>;
    },
  });
}

export function useProduct(id: string, options?: { all_langs?: boolean }) {
  const all_langs = options?.all_langs ?? false;
  return useQuery({
    queryKey: ['products', id, { all_langs }],
    queryFn: async () => {
      const params = all_langs ? { all_langs: 'true' } : undefined;
      const response = await api.products.getOne(id, params);
      return response as unknown as ApiResponse<Product>;
    },
    enabled: !!id,
  });
}

import { useToast } from '@/hooks/useToast';

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: Partial<Product> | FormData) => {
      const response = await api.products.create(data);
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
      const response = await api.products.update(id, data);
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
      const response = await api.products.delete(id);
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
      const response = await api.products.restore(id);
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
      const response = await api.products.hardDelete(id);
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
