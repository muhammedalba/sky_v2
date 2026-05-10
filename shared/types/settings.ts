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
  addressAr: string;
  addressEn: string;
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
  freeShippingThreshold: number;
  minOrderAmount: number;
  vatRate: number;
  taxesIncluded: boolean;
  maintenance: MaintenanceMode;
  features: FeatureFlags;
  gateways: Gateways;
  debugMode: boolean;
  
  // Legacy support for common fields
  supportPhone?: string;
  supportEmail?: string;
  address?: LocalizedString;
}

export type SettingsContextType = StoreSettings;
