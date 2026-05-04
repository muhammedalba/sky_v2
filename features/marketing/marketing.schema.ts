import * as z from 'zod';

export const carouselSchema = z.object({
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  carouselLg: z.union([z.string(), z.instanceof(File), z.null()]).optional(),
  carouselMd: z.union([z.string(), z.instanceof(File), z.null()]).optional(),
  carouselSm: z.union([z.string(), z.instanceof(File), z.null()]).optional(),
  isActive: z.boolean().optional(),
});

export const couponSchema = z.object({
  name: z.string().min(3, 'Coupon code is required (min 3 characters)'),
  discount: z.number().min(1, 'Discount must be at least 1'),
  type: z.enum(['percentage', 'fixed']),
  maxUsage: z.number().min(0).optional(),
  expires: z.string().min(1, 'Expiry date is required'),
  active: z.boolean().optional(),
  minOrderAmount: z.number().min(0).optional(),
  maxOrderAmount: z.number().min(0).optional(),
  applyTo: z.enum(['all', 'products', 'categories', 'brands']).optional(),
  applyItems: z.array(z.string()).optional(),
}).refine(data => {
  if (data.applyTo && data.applyTo !== 'all') {
    return data.applyItems && data.applyItems.length > 0;
  }
  return true;
}, {
  message: 'At least one item must be selected',
  path: ['applyItems']
});

export const promoBannerSchema = z.object({
  textEn: z.string().min(5, 'English text is required (min 5 characters)'),
  textAr: z.string().min(5, 'Arabic text is required (min 5 characters)'),
  link: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean(),
});

export type PromoBannerFormValues = z.infer<typeof promoBannerSchema>;
export type CouponFormValues = z.infer<typeof couponSchema>;
export type CarouselFormValues = z.infer<typeof carouselSchema>;
