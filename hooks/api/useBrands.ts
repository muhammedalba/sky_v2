'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

import { useToast } from '@/hooks/useToast';

export function useBrands(
  params?: { page?: number; limit?: number; keywords?: string, all_langs?: boolean },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['brands', params],
    queryFn: async () => {
      const response = await api.brands.getAll(params);
      return response;
    },
    enabled: options?.enabled !== undefined ? options.enabled : true,
  });
}

export function useBrand(id: string, options?: { all_langs?: boolean }) {
  return useQuery({
    queryKey: ['brands', id, options?.all_langs],
    queryFn: async () => {
      const params = options?.all_langs ? { all_langs: 'true' } : {};
      const response = await api.brands.getOne(id, params);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.brands.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Brand created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create brand');
      console.log(error.message);
    },
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const response = await api.brands.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['brands', variables.id] });
      toast.success('Brand updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update brand');
    },
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.brands.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Brand deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete brand');
    },
  });
}
