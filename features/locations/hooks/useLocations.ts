import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Country, Region, City } from '../types';
import { apiClient } from '@/lib/api/client';

// ================= Countries =================

export const useCountries = () => {
  return useQuery<Country[]>({
    queryKey: ['countries'],
    queryFn: async () => {
      const response = await apiClient.get('/locations/countries');
      return response.data?.data || response.data || [];
    },
  });
};

export const useCreateCountry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Country>) => {
      const response = await apiClient.post('/locations/countries', data);
      return response.data?.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
    },
  });
};

export const useUpdateCountry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Country> }) => {
      const response = await apiClient.patch(`/locations/countries/${id}`, data);
      return response.data?.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
    },
  });
};

// ================= Regions =================

export const useRegions = (countryId?: string) => {
  return useQuery<Region[]>({
    queryKey: ['regions', countryId],
    queryFn: async () => {
      if (!countryId) return [];
      const response = await apiClient.get(`/locations/regions/${countryId}`);
      return response.data?.data || response.data || [];
    },
    enabled: !!countryId,
  });
};

export const useCreateRegion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Region>) => {
      const response = await apiClient.post('/locations/regions', data);
      return response.data?.data || response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
    },
  });
};

export const useUpdateRegion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Region> }) => {
      const response = await apiClient.patch(`/locations/regions/${id}`, data);
      return response.data?.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
    },
  });
};

// ================= Cities =================

export const useCities = (regionId?: string) => {
  return useQuery<City[]>({
    queryKey: ['cities', regionId],
    queryFn: async () => {
      if (!regionId) return [];
      const response = await apiClient.get(`/locations/cities/${regionId}`);
      return response.data?.data || response.data || [];
    },
    enabled: !!regionId,
  });
};

export const useCreateCity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<City>) => {
      const response = await apiClient.post('/locations/cities', data);
      return response.data?.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
    },
  });
};

export const useUpdateCity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<City> }) => {
      const response = await apiClient.patch(`/locations/cities/${id}`, data);
      return response.data?.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
    },
  });
};
