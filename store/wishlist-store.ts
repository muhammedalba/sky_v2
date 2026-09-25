import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product } from "@/types";

export interface WishlistItem {
  productId: string;
  product: Product; // kept for UI display; backend only needs the ID
  addedAt: number;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (product) =>
        set((state) => {
          if (state.items.some((item) => item.productId === product._id)) {
            return state;
          }
          return {
            items: [
              ...state.items,
              { productId: product._id, product, addedAt: Date.now() },
            ],
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),

      toggleItem: (product) =>
        set((state) => {
          const exists = state.items.some(
            (item) => item.productId === product._id,
          );
          return {
            items: exists
              ? state.items.filter((item) => item.productId !== product._id)
              : [
                  ...state.items,
                  { productId: product._id, product, addedAt: Date.now() },
                ],
          };
        }),

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "wishlist-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
