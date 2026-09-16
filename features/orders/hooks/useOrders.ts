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

export function useMyOrders(
  params?: OrderQueryParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["orders", "my-orders", params],
    queryFn: async () => {
      const response = (await ordersApi.getMyOrders(
        params as Record<string, unknown>,
      )) as unknown as ApiResponse<Order[]>;
      return response;
    },
    enabled: options?.enabled,
    // Matches the backend's own response cache for this route
    // (@CacheTTL(30000) on GET /order/my-orders) — switching tabs back and
    // forth within this window reuses the cached result instead of firing
    // a new request each time.
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    throwOnError: true,
  });
}

export function useMyOrder(id: string) {
  return useQuery({
    queryKey: ["orders", "my-orders", id],
    queryFn: async () => {
      const response = (await ordersApi.getMyOrder(
        id,
      )) as unknown as ApiResponse<Order>;
      return response.data;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    // Not found / not-owned is an expected, recoverable outcome for a
    // detail page (stale link, typo'd id) — surface it via `isError` so the
    // page can render a friendly empty state instead of crashing to the
    // nearest error boundary.
    throwOnError: false,
    retry: false,
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

export function useUpdateOrderDetails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const response = await ordersApi.updateOrderDetails(id, data);
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
