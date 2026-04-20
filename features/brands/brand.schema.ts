import * as z from 'zod';

export const brandSchema = z.object({
  name: z.object({
    en: z.string().min(2, 'English name is required'),
    ar: z.string().min(2, 'Arabic name is required'),
  }),
  image: z.union([z.string(), z.instanceof(File), z.null()]).optional(),
});

export type BrandFormValues = z.infer<typeof brandSchema>;
