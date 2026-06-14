"use client";



import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { locationsApi, checkoutApi, paymentsApi } from "../api";
import { useToast } from "@/shared/hooks/useToast";
import { useLocale } from "next-intl";
import { isAxiosError } from "axios";

export type AddressPayload = Record<string, unknown>;

// ─── Locations hooks ──────────────────────────────────────────────────────────

// Shared type for countries, regions, and cities returned by the locations API
export interface LocationItem {
  _id: string;
  name: string | { ar: string; en: string };
  [key: string]: unknown;
}

export function useCountries() {
  return useQuery({
    queryKey: ["locations", "countries"],
    queryFn: async () => {
      const res = await locationsApi.getCountries();
      return (res.data?.data ?? res.data ?? []) as LocationItem[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRegions(countryId: string | null) {
  return useQuery({
    queryKey: ["locations", "regions", countryId],
    queryFn: async () => {
      if (!countryId) return [];
      const res = await locationsApi.getRegions(countryId);
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
      if (!regionId) return [];
      const res = await locationsApi.getCities(regionId);
      return (res.data?.data ?? res.data ?? []) as LocationItem[];
    },
    enabled: !!regionId,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Payment methods ──────────────────────────────────────────────────────────

import { ALL_METHODS, type ActivePaymentMethod } from "../constants/paymentMethods";

interface ApiPaymentMethod {
  _id: string;
  code: string;
  name: string;
  isActive: boolean;
  fees: number;
  displayOrder: number;
  icon?: string;
  supportedCurrencies: string[];
}

export function useActivePaymentMethods() {
  return useQuery<ActivePaymentMethod[]>({
    queryKey: ["payment-methods"],
    queryFn: async () => {
      const res = await paymentsApi.getActiveMethods();
      const apiMethods: ApiPaymentMethod[] = res.data?.data || res.data;
      console.log("apiMethods",apiMethods);
      
      return apiMethods
        .map((apiMethod) => {
          const localMeta = ALL_METHODS.find((m) => m.code === apiMethod.code);
          if (!localMeta) return null;
          return {
            ...localMeta,
            fees: apiMethod.fees,
            _id: apiMethod.code,
          } as ActivePaymentMethod;
        })
        .filter(Boolean) as ActivePaymentMethod[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Checkout Orchestrator Hooks ──────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useCheckoutSummary(options?: Omit<UseQueryOptions<any, Error, any, any>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: ["checkout", "summary"],
    queryFn: async () => {
      const res = await checkoutApi.getSummary();  
      return res.data;
    },
    // Don't cache checkout summary as it changes based on user interactions
    staleTime: 0,
    ...options,
  });
}

export function useSetAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (address: AddressPayload) => {
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
  const locale = useLocale();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const res = await checkoutApi.placeOrder(data);
      return res.data;
    },
    onSuccess: () => {
      toast.success(locale === "ar" ? "تم تقديم طلبك بنجاح!" : "Order placed successfully!");
    },
    onError: (error: Error | unknown) => {
      let message = locale === "ar" ? "فشل تقديم الطلب" : "Failed to place order";
      if (isAxiosError(error) && error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error instanceof Error && error.message) {
        message = error.message;
      }
      toast.error(message);
    },
  });
}

// ─── Checkout Flow Orchestrator ───────────────────────────────────────────────

export function useCheckoutFlow() {
  // /checkout/address
  const { mutateAsync: setAddressAsync, isPending: settingAddress } = useSetAddress();
  // /checkout/shipping-method
  const { mutateAsync: setShippingMethodAsync, isPending: settingShipping } = useSetShippingMethod();
  // /checkout/payment-method
  const { mutateAsync: setPaymentMethodAsync, isPending: settingPayment } = useSetPaymentMethod();
  // /checkout/coupon
  const { mutateAsync: applyCouponAsync, isPending: applyingCoupon } = useApplyCoupon();
  // /checkout/place-order
  const { mutateAsync: placeOrderAsync, isPending: placingOrder } = usePlaceOrder();

  const submitAddress = async (data: AddressPayload, onSuccess?: () => void, onError?: (err: unknown) => void) => {
    try {
      await setAddressAsync(data);
      if (onSuccess) onSuccess();
    } catch (error) {
      if (onError) onError(error);
    }
  };

  const selectShipping = async (id: string, onSuccess?: () => void, onError?: (err: unknown) => void) => {
    try {
      await setShippingMethodAsync(id);
      if (onSuccess) onSuccess();
    } catch (error) {
      if (onError) onError(error);
    }
  };

  const selectPayment = async (id: string, onSuccess?: () => void, onError?: (err: unknown) => void) => {
    try {
      await setPaymentMethodAsync(id);
      if (onSuccess) onSuccess();
    } catch (error) {
      if (onError) onError(error);
    }
  };

  const applyCoupon = async (code: string, onSuccess?: (res: unknown) => void, onError?: (err: unknown) => void) => {
    try {
      const res = await applyCouponAsync(code);
      if (onSuccess) onSuccess(res);
    } catch (error) {
      if (onError) onError(error);
    }
  };

  const placeOrder = async (data: FormData) => {
    const res = await placeOrderAsync(data);
    return res;
  };

  return {
    submitAddress,
    selectShipping,
    selectPayment,
    applyCoupon,
    placeOrder,
    isSubmitting: settingAddress || settingShipping || settingPayment || applyingCoupon || placingOrder,
  };
}
