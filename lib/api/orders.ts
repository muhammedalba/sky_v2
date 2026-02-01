import { apiClient } from './client';

const ENDPOINTS = {
  BASE: process.env.NEXT_PUBLIC_ENDPOINT_ORDERS || '/order',
  STATS: process.env.NEXT_PUBLIC_ENDPOINT_ORDERS_STATS || '/order/statistics',
  COUPON: process.env.NEXT_PUBLIC_ENDPOINT_ORDERS_COUPON || '/order/applyCoupon',
  BANK_TRANSFER: process.env.NEXT_PUBLIC_ENDPOINT_ORDERS_BANK_TRANSFER || '/order/PaymentByBankTransfer',
};

export const ordersApi = {
  getAll: (params?: any) => apiClient.get(ENDPOINTS.BASE, { params }),
  getOne: (id: string) => apiClient.get(`${ENDPOINTS.BASE}/${id}`),
  updateStatus: (id: string, data: any) =>
    apiClient.patch(`${ENDPOINTS.BASE}/${id}`, data),
  delete: (id: string) => apiClient.delete(`${ENDPOINTS.BASE}/${id}`),
  getStats: () => apiClient.get(ENDPOINTS.STATS),
  applyCoupon: (data: { items: any[]; couponCode: string }) =>
    apiClient.post(ENDPOINTS.COUPON, data),
  createBankTransfer: (data: FormData) =>
    apiClient.post(ENDPOINTS.BANK_TRANSFER, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
