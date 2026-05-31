export interface ShippingProvider {
  _id: string;
  name: string;
  code: string;
  logo: string;
  trackingUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingRate {
  _id: string;
  provider: ShippingProvider;
  country?: { _id: string; name: { ar: string; en: string } };
  region?: { _id: string; name: { ar: string; en: string } };
  city?: { _id: string; name: { ar: string; en: string } };
  basePrice: number;
  baseWeight: number;
  additionalKgPrice: number;
  estimatedDays: string;
  supportsCOD: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  freeShippingThreshold?: number;
}

export interface CreateShippingProviderDto {
  name: string;
  code: string;
  logo?: File;
  trackingUrl?: string;
  isActive?: boolean;
}
// We intentionally keep this interface for semantic meaning in DTOs
export interface UpdateShippingProviderDto extends Partial<CreateShippingProviderDto> {}
