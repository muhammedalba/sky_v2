import { apiClient } from './client';
import { ApiResponse, Carousel } from '@/types';

const ENDPOINTS = {
  BASE: process.env.NEXT_PUBLIC_ENDPOINT_CAROUSEL || '/carousel',
};

export const carouselApi = {
  getAll: (params?: Record<string, unknown>) => apiClient.get<ApiResponse<Carousel[]>>(ENDPOINTS.BASE, { params }),
  getOne: (id: string) => apiClient.get<ApiResponse<Carousel>>(ENDPOINTS.BASE + '/' + id),
  create: (data: FormData) => apiClient.post<ApiResponse<Carousel>>(ENDPOINTS.BASE, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id: string, data: FormData) => apiClient.patch<ApiResponse<Carousel>>(ENDPOINTS.BASE + '/' + id, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id: string) => apiClient.delete(ENDPOINTS.BASE + '/' + id),
};
