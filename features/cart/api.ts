import { apiClient } from "@/lib/api/client";
import { env } from "@/lib/env";

const ENDPOINTS = env.ENDPOINTS.CART;

export const cartApi = {
  getCart: () => apiClient.get(ENDPOINTS.BASE),
  addItem: (data: { productId: string; variantId: string; quantity: number }) =>
    apiClient.post(ENDPOINTS.ADD, data),
  updateQuantity: (data: {
    productId: string;
    variantId: string;
    quantity: number;
  }) => apiClient.patch(`${ENDPOINTS.BASE}/update-quantity`, data),
  removeItem: (productId: string, variantId?: string) =>
    apiClient.delete(
      variantId
        ? `${ENDPOINTS.REMOVE}/${productId}/${variantId}`
        : `${ENDPOINTS.REMOVE}/${productId}`,
    ),
  clearCart: () => apiClient.delete(ENDPOINTS.CLEAR),
  syncCart: (
    items: Array<{
      productId: string;
      variantId: string;
      quantity: number;
    }>,
  ) => apiClient.post(`${ENDPOINTS.BASE}/sync`, { items }),
  validateCoupon: (data: { code: string; orderAmount: number }) =>
    apiClient.post(`${ENDPOINTS.BASE}/validate-coupon`, data),
};
