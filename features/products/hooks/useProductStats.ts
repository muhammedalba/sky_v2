import { productsApi } from '@/features/products/api';
import { useQuery } from '@tanstack/react-query';

export function useProductStats(params?: { startDate?: string; endDate?: string })  {
  return useQuery({
    queryKey: ['products', 'statistics', params],
    queryFn: async () => {
      const response = await productsApi.getStats(params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
