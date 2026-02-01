import { apiClient } from './client';

const ENDPOINTS = {
  BASE: process.env.NEXT_PUBLIC_ENDPOINT_COUPONS || '/coupons',
};

export const couponsApi = {
  getAll: (params?: any) => apiClient.get(ENDPOINTS.BASE, { params }),
  getOne: (id: string) => apiClient.get(`${ENDPOINTS.BASE}/${id}`),
  create: (data: any) => apiClient.post(ENDPOINTS.BASE, data),
  update: (id: string, data: any) => apiClient.patch(`${ENDPOINTS.BASE}/${id}`, data),
  delete: (id: string) => apiClient.delete(`${ENDPOINTS.BASE}/${id}`),
};
