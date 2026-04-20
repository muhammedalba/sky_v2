import * as z from 'zod';

export const supplierSchema = z.object({
  name: z.string().min(2, 'English name is required').max(100, 'English name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  contactName: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  avatar: z.union([z.string(), z.instanceof(File), z.null()]).optional(),
  active: z.boolean(),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
