import { apiClient } from '@/lib/api/client';
import { env } from '@/lib/env';
import { ApiResponse, Order } from '@/types';

const ENDPOINTS = env.ENDPOINTS.ORDERS;

export const ordersApi = {
  getAll: (params?: Record<string, unknown>) => apiClient.get<ApiResponse<Order[]>>(ENDPOINTS.BASE, { params }),
  getOne: (id: string) => apiClient.get<ApiResponse<Order>>(ENDPOINTS.BASE + '/' + id),
  updateStatus: (id: string, data: Record<string, unknown>) =>
    apiClient.patch<ApiResponse<Order>>(ENDPOINTS.BASE + '/' + id, data),
  delete: (id: string) => apiClient.delete(ENDPOINTS.BASE + '/' + id),
  getStats: () => apiClient.get(ENDPOINTS.STATS),
  applyCoupon: (data: { items: Record<string, unknown>[]; couponCode: string }) =>
    apiClient.post(ENDPOINTS.COUPON, data),
  createBankTransfer: (data: FormData) =>
    apiClient.post(ENDPOINTS.BANK_TRANSFER, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
