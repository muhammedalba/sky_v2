import { createCrudApi } from '@/shared/api/factory';
import { env } from '@/lib/env';
import { apiClient } from '@/lib/api/client';

const BASE = env.ENDPOINTS.PAYMENTS.BASE;
const ALL = env.ENDPOINTS.PAYMENTS.ALL;

export const adminPaymentsApi = {
  ...createCrudApi(BASE, false),
  getAll: (params?: Record<string, any>) => apiClient.get(ALL, { params }),
};
