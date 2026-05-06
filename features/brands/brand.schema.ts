import * as z from 'zod';
import { optionalImageSchema } from '@/lib/validation';

export const brandSchema = z.object({
  name: z.object({
    en: z.string().min(2, 'English name is required'),
    ar: z.string().min(2, 'Arabic name is required'),
  }),
  image: optionalImageSchema,
});

export type BrandFormValues = z.infer<typeof brandSchema>;
