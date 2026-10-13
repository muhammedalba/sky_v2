/** Human-readable size (B / KB / MB / GB). */
export function formatBytes(bytes: number | null | undefined): string | null {
  if (bytes == null) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

/** Message set by the API client's error interceptor, if any. */
export const errorMessage = (err: unknown): string | undefined =>
  (err as { message?: string })?.message || undefined;

/** HTTP status of a failed API call (axios error), if any. */
export const httpStatus = (err: unknown): number | undefined =>
  (err as { response?: { status?: number } })?.response?.status;
