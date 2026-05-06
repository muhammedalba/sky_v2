import * as z from 'zod';
import { optionalImageSchema } from '@/lib/validation';

export const categorySchema = z.object({
  name: z.object({
    en: z.string().min(2, 'required'),
    ar: z.string().min(2, 'required'),
  }),
  image: optionalImageSchema,
});

export const subCategorySchema = z.object({
  name: z.object({
    en: z.string().min(2, 'English name is required'),
    ar: z.string().min(2, 'Arabic name is required'),
  }),
  category: z.string().min(1, 'Parent category is required'),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type SubCategoryFormValues = z.infer<typeof subCategorySchema>;
