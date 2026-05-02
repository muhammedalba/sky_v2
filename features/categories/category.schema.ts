import * as z from 'zod';

export const categorySchema = z.object({
  name: z.object({
    en: z.string().min(2, 'required'),
    ar: z.string().min(2, 'required'),
  }),
  image: z.any().refine((val) => val instanceof File || (typeof val === 'string' && val.length > 0), {
    message: 'required',
  }).optional(),
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
