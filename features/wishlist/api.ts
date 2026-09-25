import { apiClient } from "@/lib/api/client";
import { env } from "@/lib/env";

const ENDPOINTS = env.ENDPOINTS.WISHLIST;

export const wishlistApi = {
  getWishlist: () => apiClient.get(ENDPOINTS.BASE),
  getIds: () => apiClient.get(ENDPOINTS.IDS),
  addItem: (productId: string) => apiClient.post(ENDPOINTS.ADD, { productId }),
  removeItem: (productId: string) =>
    apiClient.delete(`${ENDPOINTS.REMOVE}/${productId}`),
  clearWishlist: () => apiClient.delete(ENDPOINTS.CLEAR),
  syncWishlist: (productIds: string[]) =>
    apiClient.post(ENDPOINTS.SYNC, { productIds }),
};
