import { apiClient } from '@/lib/api/client';
import { ApiResponse } from '@/types';
import { Role, PermissionGroup } from './types';

export const rolesApi = {
  getAll: () =>
    apiClient.get<Role[]>('/roles'),

  getPermissionsList: () =>
    apiClient.get<PermissionGroup[]>('/roles/permissions-list'),
 
  create: (data: Partial<Role>) =>
    apiClient.post<ApiResponse<Role>>('/roles', data),

  update: (id: string, data: Partial<Role>) =>
    apiClient.put<ApiResponse<Role>>(`/roles/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/roles/${id}`),

  getMyPermissions: () =>
    apiClient.get<ApiResponse<{
      permissions: string[];
      level: number;
      isSuperAdmin: boolean;
    }>>('/roles/my-permissions'),
};
