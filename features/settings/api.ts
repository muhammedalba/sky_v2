import { apiClient } from '@/lib/api/client';
import { ApiResponse } from '@/types';
import { SettingsInput } from './settings.schema';

export const settingsApi = {
  get: (): Promise<ApiResponse<SettingsInput>> => apiClient.get('/settings'),
  update: (data: FormData | Partial<SettingsInput>): Promise<ApiResponse<SettingsInput>> => {
    const headers = data instanceof FormData 
      ? { 'Content-Type': 'multipart/form-data' } 
      : { 'Content-Type': 'application/json' };
      
    return apiClient.patch('/settings', data, { headers });
  },
  clearCache: () => apiClient.patch('/settings/clear-cache'),
};
