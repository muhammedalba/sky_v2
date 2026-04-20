import { apiClient } from '@/lib/api';
import { env } from '@/lib/env';

const ENDPOINTS = env.ENDPOINTS.CART;

export const cartApi = {
  getCart: () => apiClient.get(ENDPOINTS.BASE),
  addItem: (data: { productId: string; quantity: number }) => 
    apiClient.post(ENDPOINTS.ADD, data),
  removeItem: (productId: string) => 
    apiClient.delete(`${ENDPOINTS.REMOVE}/${productId}`),
  clearCart: () => apiClient.delete(ENDPOINTS.CLEAR),
};
