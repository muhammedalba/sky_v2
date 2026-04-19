'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PromoBanner } from '@/types';
import { useToast } from '@/hooks/useToast';

export function usePromoBanners(params?: { all_langs?: boolean }) {
  return useQuery({
    queryKey: ['promoBanners', params],
    queryFn: async () => {
      const response = await api.promoBanner.getBanners(params);
      return response;
    },
  });
}

export function useActivePromoBanner() {
  return useQuery({
    queryKey: ['promoBanners', 'active'],
    queryFn: async () => {
      const response = await api.promoBanner.getActive();
      return response.data;
    },
  });
}

export function usePromoBanner(id: string, options?: { all_langs?: boolean }) {
  return useQuery({
    queryKey: ['promoBanners', id, options?.all_langs],
    queryFn: async () => {
      const params = options?.all_langs ? { all_langs: 'true' } : {};
      const response = await api.promoBanner.getOne(id, params);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreatePromoBanner() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: Partial<PromoBanner>) => {
      const response = await api.promoBanner.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promoBanners'] });
      toast.success('Promo banner created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create promo banner');
    },
  });
}

export function useUpdatePromoBanner() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PromoBanner> }) => {
      const response = await api.promoBanner.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['promoBanners'] });
      queryClient.invalidateQueries({ queryKey: ['promoBanners', variables.id] });
      toast.success('Promo banner updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update promo banner');
    },
  });
}

export function useDeletePromoBanner() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.promoBanner.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promoBanners'] });
      toast.success('Promo banner deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete promo banner');
    },
  });
}
