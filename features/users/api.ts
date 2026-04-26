import { apiClient } from '@/lib/api/client';
import { env } from '@/lib/env';
import { ApiResponse, User } from '@/types';
import { createCrudApi } from '@/shared/api/factory';

const ENDPOINTS = env.ENDPOINTS.USERS;
const baseCrud = createCrudApi<User>(ENDPOINTS.BASE);

export const usersApi = {
  ...baseCrud,
  create: (data: Record<string, unknown> | FormData) =>
    apiClient.post<ApiResponse<User>>(ENDPOINTS.CREATE, data),
  update: (id: string, data: Record<string, unknown> | FormData) =>
    apiClient.put<ApiResponse<User>>(`${ENDPOINTS.BASE}/${id}`, data),
  updateRole: (id: string, role: string) =>
    apiClient.put<ApiResponse<User>>(`${ENDPOINTS.BASE}/${id}`, { role }),
  getStats: () => apiClient.get(ENDPOINTS.STATS),
};
