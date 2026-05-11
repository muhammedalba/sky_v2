import * as z from 'zod';
import { optionalImageSchema } from '@/lib/validation';

export const settingsSchema = z.object({
  // Store Info
  siteName: z.object({
    ar: z.string().min(1, 'errors.required'),
    en: z.string().min(1, 'errors.required'),
  }),
  siteDescription: z.object({
    ar: z.string().min(1, 'errors.required'),
    en: z.string().min(1, 'errors.required'),
  }),
  logo: optionalImageSchema,
  favicon: optionalImageSchema,

  // Regional (Currency)
  currencyCode: z.string().min(1, 'errors.required'),
  currencySymbol: z.string().min(1, 'errors.required'),
  exchangeRate: z.coerce.number().min(0, 'errors.min').default(1),

  // SEO
  metaTitle: z.object({
    ar: z.string().default(''),
    en: z.string().default(''),
  }),
  metaDescription: z.object({
    ar: z.string().default(''),
    en: z.string().default(''),
  }),
  googleAnalyticsId: z.string().default(''),

  // Social Links
  socialLinks: z.object({
    facebook: z.string().url('validation.invalidUrl').or(z.literal('')).default(''),
    instagram: z.string().url('validation.invalidUrl').or(z.literal('')).default(''),
    twitter: z.string().url('validation.invalidUrl').or(z.literal('')).default(''),
    linkedin: z.string().url('validation.invalidUrl').or(z.literal('')).default(''),
    youtube: z.string().url('validation.invalidUrl').or(z.literal('')).default(''),
    tiktok: z.string().url('validation.invalidUrl').or(z.literal('')).default(''),
    whatsapp: z.string().default(''),
  }),

  // Contact Info
  contactInfo: z.object({
    email: z.string().email('errors.invalidEmail').or(z.literal('')).default(''),
    phones: z.array(z.string()).default([]),
    addressAr: z.string().default(''),
    addressEn: z.string().default(''),
  }),

  // Gateways
  gateways: z.object({
    stripe: z.boolean().default(false),
    paypal: z.boolean().default(false),
    bankTransfer: z.boolean().default(false),
    cod: z.boolean().default(false),
  }),

  // Shipping
  freeShippingThreshold: z.coerce.number().min(0).default(0),
  vatRate: z.coerce.number().min(0).max(100).default(15),
  taxesIncluded: z.boolean().default(false),

  // Features
  features: z.object({
    reviews: z.boolean().default(true),
    coupons: z.boolean().default(true),
    guestCheckout: z.boolean().default(true),
    wishlist: z.boolean().default(true),
  }),

  // Advanced
  maintenanceMode: z.boolean().default(false),
  maintenanceMessage: z.object({
    ar: z.string().default('الموقع قيد الصيانة').optional(),
    en: z.string().default('Site under maintenance').optional(),
  }).default({
    ar: 'الموقع قيد الصيانة',
    en: 'Site under maintenance',
  }).optional(),
  allowRegistration: z.boolean().default(true),
  autoBackup: z.boolean().default(false),
  googleMapsApiKey: z.string().default(''),
  minOrderAmount: z.coerce.number().min(0).default(0),
  debugMode: z.boolean().default(false),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
