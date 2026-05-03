'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Supplier, ApiResponse } from '@/types';
import { suppliersApi } from '@/features/suppliers/api';

export function useSuppliers(
  params?: { page?: number; limit?: number; keywords?: string },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: async () => {
      const response = (await suppliersApi.getAll(params)) as unknown as ApiResponse<Supplier[]>;
      return response;
    },
    enabled: options?.enabled !== undefined ? options.enabled : true,
  });
}

export function useSupplier(id: string, options?: { allLangs?: boolean }) {
  return useQuery({
    queryKey: ['suppliers', id, options?.allLangs],
    queryFn: async () => {
      const params = options?.allLangs ? { all_langs: true } : {};
      const response = (await suppliersApi.getOne(id, params)) as unknown as ApiResponse<Supplier>;
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();


  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await suppliersApi.create(data);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();


  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const response = await suppliersApi.update(id, data);
      return response.data;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['suppliers']});
      await queryClient.invalidateQueries({ queryKey: ['suppliers', variables.id] });
    },

  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();


  return useMutation({
    mutationFn: async (id: string) => {
      const response = await suppliersApi.delete(id);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['suppliers']});
    },
  });
}
