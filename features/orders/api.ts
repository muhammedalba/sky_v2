import { apiClient } from '@/lib/api/client';
import { env } from '@/lib/env';
import { ApiResponse, Order } from '@/types';
import { createCrudApi } from '@/shared/api/factory';

const ENDPOINTS = env.ENDPOINTS.ORDERS;
const baseCrud = createCrudApi<Order>(ENDPOINTS.BASE);

export const ordersApi = {
  ...baseCrud,
  updateStatus: (id: string, data: Record<string, unknown>) =>
    apiClient.patch<ApiResponse<Order>>(`${ENDPOINTS.BASE}/${id}`, data),
  getStats: () => apiClient.get(ENDPOINTS.STATS),
  applyCoupon: (data: { items: Record<string, unknown>[]; couponCode: string }) =>
    apiClient.post(ENDPOINTS.COUPON, data),
  createBankTransfer: (data: FormData) =>
    apiClient.post(ENDPOINTS.BANK_TRANSFER, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
