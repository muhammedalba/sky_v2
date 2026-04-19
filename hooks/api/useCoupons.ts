'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Coupon } from '@/types';
import { useToast } from '@/hooks/useToast';

export function useCoupons(params?: { page?: number; limit?: number; keywords?: string }) {
  return useQuery({
    queryKey: ['coupons', params],
    queryFn: async () => {
      const response = await api.coupons.getAll(params);
      return response.data;
    },
  });
}

export function useCoupon(id: string, options?: { allLangs?: boolean }) {
  return useQuery({
    queryKey: ['coupons', id, options?.allLangs],
    queryFn: async () => {
      const params = options?.allLangs ? { all_langs: true } : {};
      const response = await api.coupons.getOne(id, params);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: Partial<Coupon>) => {
      const response = await api.coupons.create(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Coupon created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create coupon');
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Coupon> }) => {
      const response = await api.coupons.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      queryClient.invalidateQueries({ queryKey: ['coupons', variables.id] });
      toast.success('Coupon updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update coupon');
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.coupons.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Coupon deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete coupon');
    },
  });
}
