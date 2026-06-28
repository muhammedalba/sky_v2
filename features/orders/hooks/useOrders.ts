"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiResponse, Order } from "@/types";
import { ordersApi } from "@/features/orders/api";

interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  keywords?: string;
  sort?: string;
  order?: string;
  startDate?: string;
  endDate?: string;
}

export function useOrders(params?: OrderQueryParams) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: async () => {
      const response = (await ordersApi.getAll(
        params as Record<string, unknown>,
      )) as unknown as ApiResponse<Order[]>;
      return response;
    },
    throwOnError: true,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: async () => {
      const response = (await ordersApi.getOne(
        id,
      )) as unknown as ApiResponse<Order>;
      return response.data;
    },
    enabled: !!id,
    throwOnError: true,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: unknown }) => {
      const response = await ordersApi.updateStatus(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["order-stats"] });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await ordersApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-stats"] });
    },
  });
}
