import { FileAsset } from "./file-asset";

export interface LocalizedString {
  ar: string;
  en: string;
}

export interface MaintenanceMode {
  enabled: boolean;
  message: LocalizedString;
}

export interface FeatureFlags {
  reviews: boolean;
  coupons: boolean;
  guestCheckout: boolean;
  wishlist: boolean;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  whatsapp?: string;
}

export interface contactInfo {
  email: string;
  phones: string[];
  workingDays?: LocalizedString;
  workingHours?: LocalizedString;
}

export interface BusinessAddress {
  country: LocalizedString;
  city: LocalizedString;
  area: LocalizedString;
  street: LocalizedString;
  mailBox: string;
  poBox: string;
  vatNo: string;
  crNo: string;
}

export interface Gateways {
  stripe: boolean;
  paypal: boolean;
  bankTransfer: boolean;
  cod: boolean;
}

export interface StoreSettings {
  siteName: LocalizedString;
  siteDescription: LocalizedString;
  logo: FileAsset;
  favicon: FileAsset;
  metaTitle: LocalizedString;
  metaDescription: LocalizedString;
  googleAnalyticsId: string;
  socialLinks: SocialLinks;
  contactInfo: contactInfo;
  businessAddress: BusinessAddress;
  currencyCode: string;
  currencySymbol: string;
  exchangeRate: number;
  freeShippingThreshold: number;
  minOrderAmount: number;
  vatRate: number;
  taxesIncluded: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: LocalizedString;
  allowRegistration: boolean;
  autoBackup: boolean;
  googleMapsApiKey: string;
  features: FeatureFlags;
  gateways: Gateways;
  enablePerformance: boolean;
  hasCustomShippingRates?: boolean;
  hasCustomTaxes?: boolean;

  // Legacy support for common fields
  supportPhone?: string;
  supportEmail?: string;
}

export type SettingsContextType = StoreSettings;
