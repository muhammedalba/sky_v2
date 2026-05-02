'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/hooks/useToast';
import { subCategoriesApi } from '../subCategories.api';

export function useSubCategories(
  params?: { page?: number; limit?: number; keywords?: string; category?: string; all_langs?: boolean },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['subCategories', params],
    queryFn: async () => {
      const response = await subCategoriesApi.getAll(params);
      console.log("subCategories Response:", response);
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
      const response = await subCategoriesApi.getOne(id, params);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateSubCategory() {
  const queryClient = useQueryClient();


  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await subCategoriesApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subCategories'] });
    },
 
  });
}

export function useUpdateSubCategory() {
  const queryClient = useQueryClient();


  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await subCategoriesApi.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subCategories'] });
      queryClient.invalidateQueries({ queryKey: ['subCategories', variables.id] });
    },

  });
}

export function useDeleteSubCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await subCategoriesApi.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subCategories'] });
    },
  });
}
