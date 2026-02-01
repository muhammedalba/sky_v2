import { apiClient } from './client';
import { ApiResponse, PromoBanner } from '@/types';

const ENDPOINTS = {
  BASE: process.env.NEXT_PUBLIC_ENDPOINT_PROMO_BANNER || '/promo-banner',
  ACTIVE: process.env.NEXT_PUBLIC_ENDPOINT_PROMO_BANNER_ACTIVE || '/promo-banner/active',
};

export const promoBannerApi = {
  getBanners: () => apiClient.get<ApiResponse<PromoBanner[]>>(ENDPOINTS.BASE),
  getActive: () => apiClient.get(ENDPOINTS.ACTIVE),
  getOne: (id: string) => apiClient.get(`${ENDPOINTS.BASE}/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post(ENDPOINTS.BASE, data),
  update: (id: string, data: Record<string, unknown>) => apiClient.patch(`${ENDPOINTS.BASE}/${id}`, data),
  delete: (id: string) => apiClient.delete(`${ENDPOINTS.BASE}/${id}`),
};
