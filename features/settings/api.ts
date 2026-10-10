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

export type AppPlatform = "android" | "ios";
export type AppUpdateStatus = "up_to_date" | "optional" | "required";

/** GET /app-versions — update policy of the mobile app on one platform. */
export interface AppVersionPolicy {
  platform: AppPlatform;
  latestVersion: string;
  minSupportedVersion: string;
  blockedVersions: string[];
  storeUrl: string;
  releaseNotes: { ar: string; en: string };
  updatedAt?: string;
}

export type AppVersionPolicyInput = Partial<
  Omit<AppVersionPolicy, "platform" | "updatedAt">
>;

/** GET /app-versions/stats — registered installs per app version. */
export interface AppVersionStats {
  platform: AppPlatform;
  totalDevices: number;
  required: number;
  optional: number;
  upToDate: number;
  versions: {
    appVersion: string | null;
    devices: number;
    status: AppUpdateStatus | null;
  }[];
}

export const appVersionsApi = {
  getAll: (): Promise<ApiResponse<AppVersionPolicy[]>> =>
    apiClient.get("/app-versions"),
  getStats: (): Promise<ApiResponse<AppVersionStats[]>> =>
    apiClient.get("/app-versions/stats"),
  update: (
    platform: AppPlatform,
    data: AppVersionPolicyInput,
  ): Promise<ApiResponse<AppVersionPolicy>> =>
    apiClient.patch(`/app-versions/${platform}`, data),
  announce: (platform: AppPlatform) =>
    apiClient.post(`/app-versions/${platform}/announce`),
};

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
