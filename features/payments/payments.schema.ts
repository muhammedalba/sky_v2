import * as z from 'zod';

export const paymentMethodSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  code: z.string().min(2, 'Code is required').toLowerCase(),
  type: z.enum(['card', 'wallet', 'bank_transfer', 'cash_on_delivery', 'bnpl']),
  provider: z.string().min(2, 'Provider is required'),
  description: z.string().optional(),
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