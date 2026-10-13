/** One audit log entry as `GET /audit-logs` returns it (no before/after data). */
export interface AuditLog {
  _id: string;
  action: string;
  module: string;
  userId?: string;
  userEmail: string;
  ipAddress: string;
  createdAt: string;
}

/** `GET /audit-logs/:id` — the entry plus its (server-redacted) data. */
export interface AuditLogDetails extends AuditLog {
  previousData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
}

export interface AuditFilterOptions {
  modules: string[];
  actions: string[];
}

export interface AuditLogQuery {
  page?: number;
  limit?: number;
  module?: string;
  action?: string;
  userEmail?: string;
  /** ISO 8601 bounds on `createdAt` (inclusive). */
  from?: string;
  to?: string;
}
