import { apiClient } from '@/lib/api/client';
import { env } from '@/lib/env';
import { ApiResponse, User } from '@/types';
import { createCrudApi } from '@/shared/api/factory';

const ENDPOINTS = env.ENDPOINTS.USERS;
const baseCrud = createCrudApi<User>(ENDPOINTS.BASE);

export const usersApi = {
  ...baseCrud,
  updateRole: (id: string, roleId: string) =>
    apiClient.patch<ApiResponse<User>>(`${ENDPOINTS.BASE}/${id}`, { role: roleId }),
  getStats: () => apiClient.get(ENDPOINTS.STATS),
  getRoles: () => apiClient.get<any[]>(env.ENDPOINTS.ROLES.BASE),
};
