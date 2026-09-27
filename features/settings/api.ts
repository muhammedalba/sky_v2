import { apiClient } from '@/lib/api/client';
import { ApiResponse } from '@/types';
import { SettingsInput } from './settings.schema';

/** GET /settings/cache-stats — backend response-cache counters (per instance). */
export interface CacheStats {
  entries: number | null;
  maxEntries: number;
  since: string;
  hits: number;
  misses: number;
  coalesced: number;
  hitRate: number | null;
  invalidations: number;
}

export const settingsApi = {
  get: (): Promise<ApiResponse<SettingsInput>> => apiClient.get('/settings'),
  update: (data: FormData | Partial<SettingsInput>): Promise<ApiResponse<SettingsInput>> => {
    const headers = data instanceof FormData 
      ? { 'Content-Type': 'multipart/form-data' } 
      : { 'Content-Type': 'application/json' };
      
    return apiClient.patch('/settings', data, { headers });
  },
  clearCache: () => apiClient.patch('/settings/clear-cache'),
  getCacheStats: (): Promise<ApiResponse<CacheStats>> =>
    apiClient.get('/settings/cache-stats'),
};
