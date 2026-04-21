'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Category, ApiResponse } from '@/types';
import { useToast } from '../useToast';

export function useCategories(
  params?: { page?: number; limit?: number; keywords?: string | null, all_langs?: boolean, fields?: string },
  options?: { enabled?: boolean }
) {

  return useQuery({
    queryKey: ['categories', params],
    queryFn: async () => {
      const response = (await api.categories.getAll(params)) as unknown as ApiResponse<Category[]>;
      return response;
    },
    enabled: options?.enabled !== undefined ? options.enabled : true,
  });
}

export function useCategory(id: string, options?: { all_langs?: boolean }) {
  return useQuery({
    queryKey: ['categories', id, options?.all_langs],
    queryFn: async () => {
      const params = options?.all_langs ? { all_langs: 'true' } : {};
      const response = (await api.categories.getOne(id, params)) as unknown as ApiResponse<Category>;
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: async (data: Partial<Category> | FormData) => {
      const response = await api.categories.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create Category');
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Category> | FormData }) => {
      const response = await api.categories.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories', variables.id] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update Category');
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.categories.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete Category');
    },
  });
}
