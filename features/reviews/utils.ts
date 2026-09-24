import { isAxiosError } from 'axios';

/** Extracts the translated backend message from an API error (falls back to `fallback`). */
export function getReviewErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }
  return fallback;
}

/** HTTP status of an API error, if any. */
export function getErrorStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
}
