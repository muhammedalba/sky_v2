import { apiClient } from './client';

const ENDPOINTS = {
  BASE: process.env.NEXT_PUBLIC_ENDPOINT_PROMO_BANNER || '/promo-banner',
  ACTIVE: process.env.NEXT_PUBLIC_ENDPOINT_PROMO_BANNER_ACTIVE || '/promo-banner/active',
};

export const promoBannerApi = {
  getBanners: () => apiClient.get(ENDPOINTS.BASE),
  getActive: () => apiClient.get(ENDPOINTS.ACTIVE),
  getOne: (id: string) => apiClient.get(`${ENDPOINTS.BASE}/${id}`),
  create: (data: any) => apiClient.post(ENDPOINTS.BASE, data),
  update: (id: string, data: any) => apiClient.patch(`${ENDPOINTS.BASE}/${id}`, data),
  delete: (id: string) => apiClient.delete(`${ENDPOINTS.BASE}/${id}`),
};
