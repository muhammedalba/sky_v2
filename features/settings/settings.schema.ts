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
    workingDays: z.object({
      ar: z.string().default(''),
      en: z.string().default(''),
    }),
    workingHours: z.object({
      ar: z.string().default(''),
      en: z.string().default(''),
    }),
  }),

  // Business Address
  businessAddress: z.object({
    country: z.object({
      ar: z.string().default(''),
      en: z.string().default(''),
    }),
    city: z.object({
      ar: z.string().default(''),
      en: z.string().default(''),
    }),
    area: z.object({
      ar: z.string().default(''),
      en: z.string().default(''),
    }),
    street: z.object({
      ar: z.string().default(''),
      en: z.string().default(''),
    }),
    mailBox: z.string().default(''),
    poBox: z.string().default(''),
    vatNo: z.string().default(''),
    crNo: z.string().default(''),
  }).default({
    country: { ar: '', en: '' },
    city: { ar: '', en: '' },
    area: { ar: '', en: '' },
    street: { ar: '', en: '' },
    mailBox: '',
    poBox: '',
    vatNo: '',
    crNo: '',
  }),

  // Payments
  paymentsEnabled: z.boolean().default(true),

  // Bank Transfer Details
  bankTransferDetails: z.object({
    bankName: z.string().default(''),
    accountName: z.string().default(''),
    accountNumber: z.string().default(''),
    iban: z.string().default(''),
  }).default({
    bankName: '',
    accountName: '',
    accountNumber: '',
    iban: '',
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
  inventoryAlertsEnabled: z.boolean().default(true),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
