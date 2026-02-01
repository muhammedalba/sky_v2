import { apiClient } from './client';

const ENDPOINTS = {
  BASE: process.env.NEXT_PUBLIC_ENDPOINT_SUPPLIERS || '/supplier',
  STATS: process.env.NEXT_PUBLIC_ENDPOINT_SUPPLIERS_STATS || '/supplier/statistics',
};

export const suppliersApi = {
  getAll: (params?: any) => apiClient.get(ENDPOINTS.BASE, { params }),
  getOne: (id: string) => apiClient.get(`${ENDPOINTS.BASE}/${id}`),
  create: (data: FormData) => apiClient.post(ENDPOINTS.BASE, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id: string, data: FormData) => apiClient.patch(`${ENDPOINTS.BASE}/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id: string) => apiClient.delete(`${ENDPOINTS.BASE}/${id}`),
  getStats: () => apiClient.get(ENDPOINTS.STATS),
};
