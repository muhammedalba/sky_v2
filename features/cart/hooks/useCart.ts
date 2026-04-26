'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/hooks/useToast';
import { cartApi } from '@/features/cart/api';

export function useCart() {
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await cartApi.getCart();
      return response.data.data;
    },
    // Don't refetch too aggressively
    staleTime: 1000 * 60 * 5, 
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: { productId: string; quantity: number; color?: string }) => {
      const response = await cartApi.addItem(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add to cart');
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await cartApi.removeItem(productId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Removed from cart');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove from cart');
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async () => {
      const response = await cartApi.clearCart();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Cart cleared');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to clear cart');
    },
  });
}
