'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Brand, ApiResponse } from '@/types';
import { brandsApi } from '@/features/brands/api';

export function useBrands(
  params?: { page?: number; limit?: number; keywords?: string, all_langs?: boolean },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['brands', params],
    queryFn: async () => {
      const response = (await brandsApi.getAll(params)) as unknown as ApiResponse<Brand[]>;
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
      const response = (await brandsApi.getOne(id, params)) as unknown as ApiResponse<Brand>;
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await brandsApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (error: Error) => {
      console.log(error.message);
    },
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const response = await brandsApi.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['brands', variables.id] });
    },
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();


  return useMutation({
    mutationFn: async (id: string) => {
      const response = await brandsApi.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
}
