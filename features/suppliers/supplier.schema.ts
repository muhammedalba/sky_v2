import * as z from 'zod';
import { optionalImageSchema } from '@/lib/validation';

export const supplierSchema = z.object({
  name: z.string().min(2, 'English name is required').max(100, 'English name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  contactName: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  avatar: optionalImageSchema,
  isActive: z.boolean(),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
