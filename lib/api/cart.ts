import { apiClient } from './client';

const ENDPOINTS = {
  BASE: process.env.NEXT_PUBLIC_ENDPOINT_CART || '/cart',
  ADD: process.env.NEXT_PUBLIC_ENDPOINT_CART_ADD || '/cart/add',
  CLEAR: process.env.NEXT_PUBLIC_ENDPOINT_CART_CLEAR || '/cart/clear',
  REMOVE: process.env.NEXT_PUBLIC_ENDPOINT_CART_REMOVE || '/cart/remove',
};

export const cartApi = {
  getCart: () => apiClient.get(ENDPOINTS.BASE),
  addItem: (data: { productId: string; quantity: number }) => 
    apiClient.post(ENDPOINTS.ADD, data),
  removeItem: (productId: string) => 
    apiClient.delete(`${ENDPOINTS.REMOVE}/${productId}`),
  clearCart: () => apiClient.delete(ENDPOINTS.CLEAR),
};
