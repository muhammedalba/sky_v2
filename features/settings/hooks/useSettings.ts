import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../api';
import { SettingsInput } from '../settings.schema';

type CachedSettings = SettingsInput | undefined;

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await settingsApi.get();
      return response.data;
    },
    // Axis 3: Optimized Caching
    staleTime: 5 * 60 * 1000,        // 5 minutes
    gcTime: 30 * 60 * 1000,          // 30 minutes
    refetchOnWindowFocus: false,     // Don't refetch when switching tabs
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData | Partial<SettingsInput>) => {
      const response = await settingsApi.update(data);
      return response.data;
    },
    // Axis 3: Optimistic Updates
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['settings'] });

      // Snapshot the previous value
      const previousSettings = queryClient.getQueryData(['settings']);

      // Optimistically update to the new value
      // Note: If newData is FormData, we don't optimistically update since it's hard to merge
      if (!(newData instanceof FormData)) {
        queryClient.setQueryData(['settings'], (old: CachedSettings) => ({
          ...old,
          ...newData,
        }));
      }

      return { previousSettings };
    },
    onError: (err, newData, context) => {
      // Rollback to the previous value on error
      if (context?.previousSettings) {
        queryClient.setQueryData(['settings'], context.previousSettings);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

export function useClearSettingsCache() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await settingsApi.clearCache();
      return response.data;
    },
    // The backend dropped its whole response cache; refetch everything this
    // browser holds too, so the admin immediately sees fresh data everywhere.
    onSuccess: () => queryClient.invalidateQueries(),
  });
}

/** Backend response-cache statistics (admin, needs VIEW_SETTINGS). */
export function useCacheStats(enabled = true) {
  return useQuery({
    queryKey: ['settings', 'cache-stats'],
    queryFn: async () => (await settingsApi.getCacheStats()).data,
    enabled,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}
