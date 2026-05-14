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
}

export interface CreateShippingProviderDto {
  name: string;
  code: string;
  logo?: string;
  trackingUrl?: string;
  isActive?: boolean;
}

export interface UpdateShippingProviderDto extends Partial<CreateShippingProviderDto> {}
