"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/useToast";
import { cartApi } from "@/features/cart/api";
import { useMe } from "@/features/auth/hooks/useAuth";
import { useCartStore } from "@/store/cart-store";
import { Product } from "@/types";
import { useSettings } from "@/app/providers/SettingsProvider";

// ─── Server cart (authenticated users) ──────────────────────────────────────

/**
 * Custom hook to fetch and manage the server-side cart for authenticated users.
 *
 * Uses React Query to fetch the cart data from the backend API.
 * The query is only enabled if the user is authenticated.
 *
 * @returns The query result object containing cart data, loading state, and error.
 */
export function useCart() {
  const { data: user } = useMe();

  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await cartApi.getCart();
      return response?.data ?? null;
    },
    enabled: !!user,
   
  });
}

// ─── Add to cart (guest → Zustand/localStorage | authenticated → backend) ────

/**
 * Custom hook providing a mutation to add an item to the cart.
 *
 * - For authenticated users: Sends a request to the backend API.
 * - For guest users: Adds the item to the local Zustand store (persisted via localStorage).
 *
 * Upon success, it invalidates the cart query (if authenticated), displays a success toast,
 * and opens the cart drawer.
 *
 * @returns The mutation result object for the add-to-cart operation.
 */
export function useAddToCart() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data: user } = useMe();
  const settings = useSettings();
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
        if (!settings?.features?.guestCheckout) {
          throw new Error("GUEST_CHECKOUT_DISABLED");
        }
        if (!data.product) {
          throw new Error("Product object is required for guest cart");
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
    onSuccess: async () => {
      if (user) {
        await queryClient.invalidateQueries({
          queryKey: ["cart"],
          refetchType: "all",
        });
      }
      toast.success("Added to cart");
      openCartDrawer();
    },
    onError: (error: Error) => {
      if (error.message === "GUEST_CHECKOUT_DISABLED") {
        const isAr = typeof window !== 'undefined' && window.location.pathname.split('/')[1] === 'ar';
        toast.error(
          isAr
            ? "الشراء كزائر معطل حالياً. يرجى تسجيل الدخول للإضافة إلى السلة."
            : "Guest checkout is currently disabled. Please login to add items to your cart."
        );
      } else {
        toast.error(error.message || "Failed to add to cart");
      }
    },
  });
}

// ─── Update Quantity ────────────────────────────────────────────────────────

/**
 * Custom hook providing a mutation to update the quantity of an existing cart item.
 *
 * Sends an update request to the backend API. Upon success, it invalidates the
 * cart query to trigger a background refetch, ensuring the UI remains synchronized.
 *
 * @returns The mutation result object for updating the cart item's quantity.
 */
export function useUpdateCartQuantity() {
  const queryClient = useQueryClient();
  const toast = useToast();
  
  return useMutation({
    mutationFn: async (data: {
      productId: string;
      variantId: string;
      quantity: number;
    }) => {
      const response = await cartApi.updateQuantity(data);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["cart"],
        refetchType: "all",
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update quantity");
    },
  });
}

// ─── Remove from cart ────────────────────────────────────────────────────────

/**
 * Custom hook providing a mutation to remove an item from the cart.
 *
 * Sends a delete request to the backend API using the product ID. Upon success,
 * it invalidates the cart query to refresh the cart state and displays a success toast.
 *
 * @returns The mutation result object for the remove operation.
 */
export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: async ({ productId, variantId }: { productId: string; variantId?: string }) => {
      const response = await cartApi.removeItem(productId, variantId);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["cart"],
        refetchType: "all",
      });
      toast.success("Removed from cart");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove from cart");
    },
  });
}

// ─── Clear cart ──────────────────────────────────────────────────────────────

/**
 * Custom hook providing a mutation to completely clear the user's cart.
 *
 * Sends a delete request to the backend API to remove all items. Upon success,
 * it invalidates the cart query and displays a success toast.
 *
 * @returns The mutation result object for the clear operation.
 */
export function useClearCart() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: async () => {
      const response = await cartApi.clearCart();
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["cart"],
        refetchType: "all",
      });
      toast.success("Cart cleared");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to clear cart");
    },
  });
}

// ─── Sync Guest Cart to Backend ────────────────────────────────────────────────
/**
 * Utility function to synchronize the guest's local cart with the backend.
 *
 * Retrieves all items currently stored in the local Zustand store and sends them
 * to the backend in a single bulk request. If the synchronization is successful,
 * the local cart is cleared to prevent duplicate items.
 *
 * @async
 * @returns A promise that resolves when the synchronization is complete.
 */
export const syncGuestCart = async () => {
  const localItems = useCartStore.getState().items;
  if (!localItems || localItems.length === 0) return;

  try {
    // Send all items to backend in a single request
    await cartApi.syncCart(
      localItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    );
    // Clear local cart after successful sync
    useCartStore.getState().clearCart();
  } catch (error) {
    console.error("Failed to sync guest cart", error);
  }
};

// ─── Coupon Validation (pre-checkout) ──────────────────────────────────────

export interface CouponValidationResult {
  discountAmount: number;
  totalPrice: number;
  totalPriceAfterDiscount?: number;
  message?: string;
  couponDetails: {
    couponCode: string;
    discountAmount: number;
    CouponId: string;
    couponType: string;
    discount: number;

  } | null;
}

/**
 * Hook to validate a coupon code against the current cart subtotal.
 * Does NOT consume the coupon — that happens at checkout.
 * Only works for authenticated users (guests cannot use coupons).
 */
export function useCouponValidation() {
  return useMutation({
    mutationFn: async (data: {
      code: string;
      orderAmount: number;
    }): Promise<CouponValidationResult> => {
      const response = await cartApi.validateCoupon(data);
      return response?.data;
    },
  });
}

