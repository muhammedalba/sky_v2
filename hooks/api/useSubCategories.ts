'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/useToast';

// Define a type locally if not in types/index.ts yet, or use 'any' temporarily if unsure
export interface SubCategory {
  _id: string;
  name: string | { en: string; ar: string };
  category: string; // ID of parent category
  // add other fields
}

export function useSubCategories(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ['subCategories', params],
    queryFn: async () => {
      const response = await api.supCategories.getAll(params);
      return response.data;
    },
  });
}

export function useSubCategory(id: string) {
  return useQuery({
    queryKey: ['subCategories', id],
    queryFn: async () => {
      const response = await api.supCategories.getOne(id);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateSubCategory() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.supCategories.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subCategories'] });
      toast.success('Sub-category created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create sub-category');
    },
  });
}

export function useUpdateSubCategory() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.supCategories.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subCategories'] });
      queryClient.invalidateQueries({ queryKey: ['subCategories', variables.id] });
      toast.success('Sub-category updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update sub-category');
    },
  });
}

export function useDeleteSubCategory() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.supCategories.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subCategories'] });
      toast.success('Sub-category deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete sub-category');
    },
  });
}
