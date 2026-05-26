import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product } from "@/types";

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  product: Product; // kept for UI display; backend only needs IDs + qty
}

interface CartState {
  items: CartItem[];
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  addItem: (product: Product, variantId: string, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (
    productId: string,
    variantId: string,
    quantity: number,
  ) => void;
  clearCart: () => void;
  mergeGuestCart: (guestItems: CartItem[]) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isCartDrawerOpen: false,

      openCartDrawer: () => set({ isCartDrawerOpen: true }),
      closeCartDrawer: () => set({ isCartDrawerOpen: false }),

      addItem: (product, variantId = "", quantity = 1) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) =>
              item.productId === product._id && item.variantId === variantId,
          );
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.productId === product._id && item.variantId === variantId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { productId: product._id, variantId, quantity, product },
            ],
          };
        }),

      removeItem: (productId, variantId = "") =>
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(item.productId === productId && item.variantId === variantId),
          ),
        })),

      updateQuantity: (productId, variantId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.variantId === variantId
              ? { ...item, quantity }
              : item,
          ),
        })),

      clearCart: () => set({ items: [] }),

      mergeGuestCart: (guestItems) =>
        set((state) => {
          const merged = [...state.items];
          guestItems.forEach((guestItem) => {
            const existingIndex = merged.findIndex(
              (item) =>
                item.productId === guestItem.productId &&
                item.variantId === guestItem.variantId,
            );
            if (existingIndex > -1) {
              merged[existingIndex].quantity += guestItem.quantity;
            } else {
              merged.push(guestItem);
            }
          });
          return { items: merged };
        }),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
