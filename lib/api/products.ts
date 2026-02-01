import { apiClient } from './client';

const ENDPOINTS = {
  BASE: process.env.NEXT_PUBLIC_ENDPOINT_PRODUCTS || '/products',
  STATS: process.env.NEXT_PUBLIC_ENDPOINT_PRODUCTS_STATS || '/products/ProductsStatistics',
};

export const productsApi = {
  getAll: (params?: any) => apiClient.get(ENDPOINTS.BASE, { params }),
  getOne: (id: string) => apiClient.get(`${ENDPOINTS.BASE}/${id}`),
  create: (data: any) =>
    apiClient.post(ENDPOINTS.BASE, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    }),
  update: (id: string, data: any) =>
    apiClient.patch(`${ENDPOINTS.BASE}/${id}`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    }),
  delete: (id: string) => apiClient.delete(`${ENDPOINTS.BASE}/${id}`),
  getStats: () => apiClient.get(ENDPOINTS.STATS),
};
