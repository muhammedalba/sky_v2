import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/types';

export interface CartItem {
  productId: string;
  quantity: number;
  product: Product; // Keep for UI display, but backend only gets ID and Qty
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  mergeGuestCart: (guestItems: CartItem[]) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      
      addItem: (product, quantity = 1) => 
        set((state) => {
          const existingItem = state.items.find((item) => item.productId === product._id);
          if (existingItem) {
            return {
              items: state.items.map((item) => 
                item.productId === product._id 
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return {
            items: [...state.items, { productId: product._id, quantity, product }],
          };
        }),

      removeItem: (productId) => 
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),

      updateQuantity: (productId, quantity) => 
        set((state) => ({
          items: state.items.map((item) => 
            item.productId === productId ? { ...item, quantity } : item
          ),
        })),

      clearCart: () => set({ items: [] }),

      mergeGuestCart: (guestItems) => 
        set((state) => {
          const merged = [...state.items];
          guestItems.forEach((guestItem) => {
            const existingIndex = merged.findIndex((item) => item.productId === guestItem.productId);
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
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
