"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { locationsApi, paymentsApi, checkoutApi } from "../api";
import { useToast } from "@/shared/hooks/useToast";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

// ─── Locations hooks ──────────────────────────────────────────────────────────

export function useCountries() {
  return useQuery({
    queryKey: ["locations", "countries"],
    queryFn: async () => {
      const res = await locationsApi.getCountries();
      return res.data?.data ?? res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRegions(countryId: string | null) {
  return useQuery({
    queryKey: ["locations", "regions", countryId],
    queryFn: async () => {
      const res = await locationsApi.getRegions(countryId!);
      return res.data?.data ?? res.data ?? [];
    },
    enabled: !!countryId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCities(regionId: string | null) {
  return useQuery({
    queryKey: ["locations", "cities", regionId],
    queryFn: async () => {
      const res = await locationsApi.getCities(regionId!);
      return res.data?.data ?? res.data ?? [];
    },
    enabled: !!regionId,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Payment methods ──────────────────────────────────────────────────────────

export function useActivePaymentMethods() {
  return useQuery({
    queryKey: ["payments", "active"],
    queryFn: async () => {
      const res = await paymentsApi.getActiveMethods();
      return res.data?.data ?? res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Checkout Orchestrator Hooks ──────────────────────────────────────────────

export function useCheckoutSummary() {
  return useQuery({
    queryKey: ["checkout", "summary"],
    queryFn: async () => {
      const res = await checkoutApi.getSummary();
      return res.data;
    },
    // Don't cache checkout summary as it changes based on user interactions
    staleTime: 0,
  });
}

export function useSetAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (address: any) => {
      const res = await checkoutApi.setAddress(address);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkout", "summary"] });
    },
  });
}

export function useSetShippingMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (shippingProviderId: string) => {
      const res = await checkoutApi.setShippingMethod(shippingProviderId);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkout", "summary"] });
    },
  });
}

export function useSetPaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (paymentMethodId: string) => {
      const res = await checkoutApi.setPaymentMethod(paymentMethodId);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkout", "summary"] });
    },
  });
}

export function useApplyCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (couponCode: string) => {
      const res = await checkoutApi.applyCoupon(couponCode);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkout", "summary"] });
    },
  });
}

// ─── Place order ──────────────────────────────────────────────────────────────

export function usePlaceOrder() {
  const toast = useToast();
  const router = useRouter();
  const locale = useLocale();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const res = await checkoutApi.placeOrder(data);
      return res.data;
    },
    onSuccess: (data) => {
      const orderId = data?.data?._id ?? data?._id;
      toast.success(locale === "ar" ? "تم تقديم طلبك بنجاح!" : "Order placed successfully!");
      if (orderId) {
        router.push(`/${locale}/account/orders/${orderId}`);
      } else {
        router.push(`/${locale}/account/orders`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || (locale === "ar" ? "فشل تقديم الطلب" : "Failed to place order"));
    },
  });
}
