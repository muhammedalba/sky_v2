'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/hooks/useToast';
import { cartApi } from '@/features/cart/api';
import { useMe } from '@/features/auth/hooks/useAuth';
import { useCartStore } from '@/store/cart-store';
import { Product } from '@/types';

// ─── Server cart (authenticated users) ──────────────────────────────────────

export function useCart() {
  const { data: user } = useMe();

  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await cartApi.getCart();
      return response.data?.data ?? null;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Add to cart (guest → Zustand/localStorage | authenticated → backend) ────

export function useAddToCart() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data: user } = useMe();
  const addLocalItem = useCartStore((state) => state.addItem);
  const openCartDrawer = useCartStore((state) => state.openCartDrawer);

  return useMutation({
    mutationFn: async (data: {
      productId: string;
      variantId: string;
      quantity: number;
      product?: Product; // required for guest mode
    }) => {
      // Guest: save to Zustand store (persisted in localStorage) — no backend call
      if (!user) {
        if (!data.product) {
          throw new Error('Product object is required for guest cart');
        }
        addLocalItem(data.product, data.variantId, data.quantity);
        return null;
      }

      // Authenticated: send to backend
      const response = await cartApi.addItem({
        productId: data.productId,
        variantId: data.variantId,
        quantity: data.quantity,
      });
      return response.data;
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      }
      toast.success('Added to cart');
      openCartDrawer();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add to cart');
    },
  });
}

// ─── Remove from cart ────────────────────────────────────────────────────────

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

// ─── Clear cart ──────────────────────────────────────────────────────────────

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

// ─── Sync Guest Cart to Backend ────────────────────────────────────────────────
export const syncGuestCart = async () => {
  const localItems = useCartStore.getState().items;
  if (!localItems || localItems.length === 0) return;

  try {
    // Send all items to backend
    await Promise.all(
      localItems.map(item =>
        cartApi.addItem({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })
      )
    );
    // Clear local cart after successful sync
    useCartStore.getState().clearCart();
  } catch (error) {
    console.error('Failed to sync guest cart', error);
  }
};
