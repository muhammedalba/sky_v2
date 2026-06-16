import * as z from 'zod';

export const paymentMethodSchema = z.object({
  name: z.object({
    ar: z.string().min(2, 'Arabic name is required'),
    en: z.string().min(2, 'English name is required'),
  }),
  code: z.string().min(2, 'Code is required').toLowerCase(),
  type: z.enum(['card', 'wallet', 'bank_transfer', 'cash_on_delivery', 'bnpl']),
  provider: z.string().min(2, 'Provider is required'),
  description: z.object({
    ar: z.string().optional().default(''),
    en: z.string().optional().default(''),
  }).optional(),
  feeType: z.enum(['fixed', 'percentage']).default('fixed'),
  config: z.record(z.string(), z.any()).default({}),
  fixedFee: z.coerce.number().min(0).default(0),
  percentageFee: z.coerce.number().min(0).max(100).default(0),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  requiresOnlineConfirmation: z.boolean().default(false),
  passFeesToCustomer: z.boolean().default(false),
  displayOrder: z.coerce.number().min(0).default(0),
  supportedCurrencies: z.array(z.string()).default(['SAR']),
  supportedCountries: z.array(z.string()).default([]),
  requiresAdditionalInfo: z.boolean().default(false),
  icon: z.string().optional(),
});

export type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;