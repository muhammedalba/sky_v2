import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../api';
import { SettingsInput } from '../settings.schema';

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
        queryClient.setQueryData(['settings'], (old: any) => ({
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
  return useMutation({
    mutationFn: async () => {
      const response = await settingsApi.clearCache();
      return response.data;
    },
  });
}
