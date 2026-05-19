'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { carouselApi } from '@/features/marketing/carousel.api';

export function useCarousel(params?: { page?: number; limit?: number, keywords?: string, all_langs?: boolean, isActive?: boolean }) {
  const locale = useLocale();
  return useQuery({
    queryKey: ['carousel', locale, params],
    queryFn: async () => {
      const response = await carouselApi.getAll(params);
      return response;
    },
  });
}

export function useCarouselItem(id: string, options?: { all_langs?: boolean }) {
  const locale = useLocale();
  return useQuery({
    queryKey: ['carousel', id, locale, options?.all_langs],
    queryFn: async () => {
      const params = options?.all_langs ? { all_langs: 'true' } : {};
      const response = await carouselApi.getOne(id, params);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateCarousel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await carouselApi.create(data);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['carousel'] });
    },
  });
}

export function useUpdateCarousel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const response = await carouselApi.update(id, data);
      return response.data;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['carousel'] });
      await queryClient.invalidateQueries({ queryKey: ['carousel', variables.id] });
    },
  });
}

export function useDeleteCarousel() {
  const queryClient = useQueryClient();


  return useMutation({
    mutationFn: async (id: string) => {
      const response = await carouselApi.delete(id);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['carousel'] });
    },
  });
}
