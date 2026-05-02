'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Category, ApiResponse } from '@/types';
import { categoriesApi } from '@/features/categories/api';

export function useCategories(
  params?: { page?: number; limit?: number; keywords?: string | null, all_langs?: boolean, fields?: string },
  options?: { enabled?: boolean }
) {

  return useQuery({
    queryKey: ['categories', params],
    queryFn: async () => {
      const response = (await categoriesApi.getAll(params)) as unknown as ApiResponse<Category[]>;
      return response;
    },
    enabled: options?.enabled !== undefined ? options.enabled : true,
    throwOnError: true,
  });
}

export function useCategory(id: string, options?: { all_langs?: boolean }) {
  return useQuery({
    queryKey: ['categories', id, options?.all_langs],
    queryFn: async () => {
      const params = options?.all_langs ? { all_langs: 'true' } : {};
      const response = (await categoriesApi.getOne(id, params)) as unknown as ApiResponse<Category>;
      return response.data;
    },
    enabled: !!id,
    throwOnError: true,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Category> | FormData) => {
      const response = await categoriesApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },   
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Category> | FormData }) => {
      const response = await categoriesApi.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories', variables.id] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await categoriesApi.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
