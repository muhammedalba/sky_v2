import { env } from '@/lib/env';
import { StoreSettings } from '../types/settings';

/**
 * Enterprise Grade Settings Service
 * Handles server-side fetching with Next.js Cache API
 */
export async function getStoreSettings(): Promise<StoreSettings | null> {
  const endpoint = `${env.API_URL}${env.ENDPOINTS.SETTINGS.BASE}`;

  try {
    const response = await fetch(endpoint, {
      next: { 
        revalidate: 3600, 
        tags: ['settings', 'public-settings'] 
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`[SettingsService] Failed to fetch settings: ${response.statusText}`);
      return { 
        ...DEFAULT_SETTINGS, 
        maintenanceMode: true,
        maintenanceMessage: { 
          ar: 'الموقع قيد الصيانة حالياً. يرجى المحاولة لاحقاً.', 
          en: 'The site is currently under maintenance. Please try again later.' 
        } 
      };
    }

    const data = await response.json();
    return { ...DEFAULT_SETTINGS, ...data };
  } catch (error) {
    console.error('[SettingsService] Connection error:', error);
    return { 
      ...DEFAULT_SETTINGS, 
      maintenanceMode: true,
      maintenanceMessage: { 
        ar: 'الموقع قيد الصيانة حالياً. يرجى المحاولة لاحقاً.', 
        en: 'The site is currently under maintenance. Please try again later.' 
      } 
    };
  }
}

/**
 * Fallback Settings
 * Provides safe defaults in case the API is unreachable
 */
export const DEFAULT_SETTINGS: StoreSettings = {
  siteName: { ar: 'سكاي جالاكسي', en: 'Sky Galaxy' },
  siteDescription: { ar: 'متجر إلكتروني احترافي', en: 'Professional E-commerce Store' },
  logo: '/assets/images/auth-logo.png',
  favicon: '/favicon.ico',
  metaTitle: { ar: 'سكاي جالاكسي', en: 'Sky Galaxy' },
  metaDescription: { ar: 'متجر إلكتروني احترافي', en: 'Professional E-commerce Store' },
  googleAnalyticsId: '',
  socialLinks: {
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    tiktok: '',
    whatsapp: '',
  },
  contactInfo: {
    email: '',
    phones: [],
    addressAr: '',
    addressEn: '',
  },
  currencyCode: 'SAR',
  currencySymbol: 'ر.س',
  freeShippingThreshold: 0,
  minOrderAmount: 0,
  vatRate: 15,
  taxesIncluded: true,
  maintenanceMode: false,
  maintenanceMessage: { ar: 'الموقع قيد الصيانة حالياً', en: 'Site under maintenance' },
  allowRegistration: true,
  autoBackup: false,
  googleMapsApiKey: '',
  features: {
    reviews: true,
    coupons: true,
    guestCheckout: true,
    wishlist: true,
  },
  gateways: {
    stripe: true,
    paypal: false,
    bankTransfer: true,
    cod: true,
  },
  debugMode: false,
};
