'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { auditApi } from '@/features/audit/api';
import { AuditLogQuery } from '@/features/audit/types';

export const auditKeys = {
  all: ['audit-logs'] as const,
  list: (params: AuditLogQuery) => ['audit-logs', 'list', params] as const,
  filters: ['audit-logs', 'filters'] as const,
  detail: (id: string) => ['audit-logs', 'detail', id] as const,
};

/** Paginated, filtered audit log (VIEW_AUDIT_LOGS). */
export function useAuditLogs(params: AuditLogQuery) {
  return useQuery({
    queryKey: auditKeys.list(params),
    queryFn: () => auditApi.getAll(params),
    // keep the current page visible while the next one loads
    placeholderData: keepPreviousData,
  });
}

/** Distinct modules / actions for the filter dropdowns. */
export function useAuditFilterOptions() {
  return useQuery({
    queryKey: auditKeys.filters,
    queryFn: async () => (await auditApi.getFilters()).data,
    staleTime: 5 * 60 * 1000,
  });
}

/** One entry with its before/after data (VIEW_AUDIT_LOG_DETAILS). Entries never change. */
export function useAuditLogDetails(id: string | null) {
  return useQuery({
    queryKey: auditKeys.detail(id ?? ''),
    queryFn: async () => (await auditApi.getOne(id!)).data,
    enabled: !!id,
    staleTime: Infinity,
  });
}
