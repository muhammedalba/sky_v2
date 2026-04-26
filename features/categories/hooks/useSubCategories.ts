'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/hooks/useToast';
import { supCategoriesApi } from '@/features/categories/supCategories.api';

export function useSubCategories(
  params?: { page?: number; limit?: number; keywords?: string, all_langs?: boolean },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['subCategories', params],
    queryFn: async () => {
      const response = await supCategoriesApi.getAll(params);
      console.log("Response:", response);
      return response;
    },
    enabled: options?.enabled !== undefined ? options.enabled : true,
  });
}

export function useSubCategory(id: string, options?: { all_langs?: boolean }) {
  return useQuery({
    queryKey: ['subCategories', id, options?.all_langs],
    queryFn: async () => {
      const params = options?.all_langs ? { all_langs: 'true' } : {};
      const response = await supCategoriesApi.getOne(id, params);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateSubCategory() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await supCategoriesApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subCategories'] });
      toast.success('Sub-category created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create sub-category');
    },
  });
}

export function useUpdateSubCategory() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await supCategoriesApi.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subCategories'] });
      queryClient.invalidateQueries({ queryKey: ['subCategories', variables.id] });
      toast.success('Sub-category updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update sub-category');
    },
  });
}

export function useDeleteSubCategory() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await supCategoriesApi.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subCategories'] });
      toast.success('Sub-category deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete sub-category');
    },
  });
}
