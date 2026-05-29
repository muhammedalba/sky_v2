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
  address?: LocalizedString;
  workingDays?: LocalizedString;
  workingHours?: LocalizedString;
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
  logo: string;
  favicon: string;
  metaTitle: LocalizedString;
  metaDescription: LocalizedString;
  googleAnalyticsId: string;
  socialLinks: SocialLinks;
  contactInfo: contactInfo;
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
  debugMode: boolean;
  hasCustomShippingRates?: boolean;
  hasCustomTaxes?: boolean;
  
  // Legacy support for common fields
  supportPhone?: string;
  supportEmail?: string;
  address?: LocalizedString;
}

export type SettingsContextType = StoreSettings;
