import { apiClient } from '@/lib/api/client';
import { env } from '@/lib/env';
import { ApiResponse } from '@/types';
import { AuditFilterOptions, AuditLog, AuditLogDetails, AuditLogQuery } from './types';

const BASE = env.ENDPOINTS.AUDIT_LOGS.BASE;

/** Read-only: the audit log cannot be edited or deleted from the dashboard. */
export const auditApi = {
  getAll: (params?: AuditLogQuery) =>
    apiClient.get(BASE, { params }) as unknown as Promise<ApiResponse<AuditLog[]>>,

  getFilters: () =>
    apiClient.get(`${BASE}/filters`) as unknown as Promise<ApiResponse<AuditFilterOptions>>,

  getOne: (id: string) =>
    apiClient.get(`${BASE}/${id}`) as unknown as Promise<ApiResponse<AuditLogDetails>>,
};
