'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';


import { Supplier, ApiResponse } from '@/types';
import { useToast } from '@/shared/hooks/useToast';
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
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await suppliersApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create supplier');
      console.log("Backend Error:", error);
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const response = await suppliersApi.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers', variables.id] });
      toast.success('Supplier updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update supplier');
      console.log("Backend Error:", error);
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await suppliersApi.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete supplier');
    },
  });
}
