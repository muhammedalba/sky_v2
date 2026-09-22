import { FileAsset } from "@/shared/types/file-asset";

export interface ShippingProvider {
  _id: string;
  name: string;
  code: string;
  logo: FileAsset;
  trackingUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingRate {
  _id: string;
  scope: 'global' | 'country' | 'region' | 'city';
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
// We intentionally keep this as a distinctly-named type for semantic meaning in DTOs
export type UpdateShippingProviderDto = Partial<CreateShippingProviderDto>;

export interface CreateShippingRateDto {
  provider: string;
  scope: 'global' | 'country' | 'region' | 'city';
  country?: string;
  region?: string;
  city?: string;
  basePrice: number;
  baseWeight: number;
  additionalKgPrice: number;
  estimatedDays?: string;
  supportsCOD: boolean;
  isActive: boolean;
  freeShippingThreshold: number;
}

export type UpdateShippingRateDto = Partial<CreateShippingRateDto>;
