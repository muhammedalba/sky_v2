'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Coupon, ApiResponse } from '@/types';
import { couponsApi } from '@/features/marketing/coupons.api';

export function useCoupons(params?: Record<string, any>) {
  console.log(params)
  return useQuery({
    queryKey: ['coupons', params],
    queryFn: async () => {
      const response = await couponsApi.getAll(params) ;
      return response;
    },
  });
}

export function useCoupon(id: string, options?: { allLangs?: boolean }) {
  return useQuery({
    queryKey: ['coupons', id, options?.allLangs],
    queryFn: async () => {
      const params = options?.allLangs ? { all_langs: true } : {};
      const response =await couponsApi.getOne(id, params);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Coupon>) => {
      const response = await couponsApi.create(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },

  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Coupon> }) => {
      const response = await couponsApi.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      queryClient.invalidateQueries({ queryKey: ['coupons', variables.id] });
    }
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await couponsApi.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    }
  });
}
