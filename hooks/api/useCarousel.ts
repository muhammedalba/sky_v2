'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

import { useToast } from '@/hooks/useToast';

export function useCarousel(params?: { page?: number; limit?: number, keywords?: string, all_langs?: boolean }) {
  return useQuery({
    queryKey: ['carousel', params],
    queryFn: async () => {
      const response = await api.carousel.getAll(params);
      return response;
    },
  });
}

export function useCarouselItem(id: string, options?: { all_langs?: boolean }) {
  return useQuery({
    queryKey: ['carousel', id, options?.all_langs],
    queryFn: async () => {
      const params = options?.all_langs ? { all_langs: 'true' } : {};
      const response = await api.carousel.getOne(id, params);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateCarousel() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.carousel.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carousel'] });
      toast.success('Carousel item created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create carousel item');
    },
  });
}

export function useUpdateCarousel() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const response = await api.carousel.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['carousel'] });
      queryClient.invalidateQueries({ queryKey: ['carousel', variables.id] });
      toast.success('Carousel item updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update carousel item');
    },
  });
}

export function useDeleteCarousel() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.carousel.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carousel'] });
      toast.success('Carousel item deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete carousel item');
    },
  });
}
