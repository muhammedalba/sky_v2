'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PromoBanner, ApiResponse } from '@/types';
import { useToast } from '@/shared/hooks/useToast';
import { promoBannerApi } from '@/features/marketing/promoBanner.api';

export function usePromoBanners(params?: { all_langs?: boolean }) {
  return useQuery({
    queryKey: ['promoBanners', params],
    queryFn: async () => {
      const response = (await promoBannerApi.getBanners(params)) as unknown as ApiResponse<PromoBanner[]>;
      return response;
    },
  });
}

export function useActivePromoBanner() {
  return useQuery({
    queryKey: ['promoBanners', 'active'],
    queryFn: async () => {
      const response = (await promoBannerApi.getActive()) as unknown as ApiResponse<PromoBanner | null>;
      return response.data;
    },
  });
}

export function usePromoBanner(id: string, options?: { all_langs?: boolean }) {
  return useQuery({
    queryKey: ['promoBanners', id, options?.all_langs],
    queryFn: async () => {
      const params = options?.all_langs ? { all_langs: 'true' } : {};
      const response = (await promoBannerApi.getOne(id, params)) as unknown as ApiResponse<PromoBanner>;
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
      const response = await promoBannerApi.create(data);
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
      const response = await promoBannerApi.update(id, data);
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
      const response = await promoBannerApi.delete(id);
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
