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
  getActiveMethods: (currency?: string, countryId?: string) =>
    apiClient.get('/payments', { params: { currency, countryId } }),
};

// ─── Checkout Orchestrator ──────────────────────────────────────────────────
export const checkoutApi = {
  getSummary: () => apiClient.get('/checkout/summary'),
  setAddress: (address: Record<string, unknown>) => apiClient.post('/checkout/address', { address }),
  setShippingMethod: (shippingProviderId: string) =>
    apiClient.post('/checkout/shipping-method', { shippingProviderId }),
  setPaymentMethod: (paymentMethodId: string) =>
    apiClient.post('/checkout/payment-method', { paymentMethodId }),
  applyCoupon: (couponCode: string) =>
    apiClient.post('/checkout/coupon', { couponCode }),
  placeOrder: (data: FormData) =>
    apiClient.post('/checkout/place-order', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
