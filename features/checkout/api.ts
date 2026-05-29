import { apiClient } from '@/lib/api/client';

// ─── Locations ───────────────────────────────────────────────────────────────
export const locationsApi = {
  getCountries: () => apiClient.get('/locations/countries?isActive=true'),
  getRegions: (countryId: string) =>
    apiClient.get(`/locations/regions/${countryId}?isActive=true`),
  getCities: (regionId: string) =>
    apiClient.get(`/locations/cities/${regionId}?isActive=true`),
};

// ─── Payments ────────────────────────────────────────────────────────────────
export const paymentsApi = {
  getActiveMethods: () => apiClient.get('/payments'),
};

// ─── Checkout ────────────────────────────────────────────────────────────────
export interface CheckoutPreviewPayload {
  cityId: string;
  items: {
    productId: string;
    variantId: string;
    quantity: number;
    weight: number;
    price: number;
  }[];
  paymentMethodId: string;
  shippingProviderId: string;
  couponCode?: string;
}

export const checkoutApi = {
  preview: (data: CheckoutPreviewPayload) =>
    apiClient.post('/checkout/preview', data),
};

// ─── Orders ──────────────────────────────────────────────────────────────────
export const orderApi = {
  placeOrder: (data: FormData | Record<string, unknown>) =>
    apiClient.post('/order/placeOrder', data),
  payByBankTransfer: (data: FormData) =>
    apiClient.post('/order/PaymentByBankTransfer', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
