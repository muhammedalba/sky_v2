import * as z from 'zod';

export const loginSchema = z.object({
  email: z.string().email('invalidEmail'),
  password: z.string().min(6, 'invalidPassword'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'required'),
  email: z.string().email('invalidEmail'),
  password: z.string().min(6, 'invalidPassword'),
  confirmPassword: z.string().min(6, 'invalidPassword'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'passwordMismatch',
  path: ['confirmPassword'],
});

export const categorySchema = z.object({
  name: z.object({
    en: z.string().min(2, 'required'),
    ar: z.string().min(2, 'required'),
  }),
  image: z.any().optional(),
});

export const attributeDefinitionSchema = z.object({
  name: z.string().min(1, 'required'),
  type: z.enum(['string', 'number']).default('string'),
  allowedUnits: z.array(z.string()).optional(),
  required: z.boolean().default(true),
  allowedValues: z.array(z.string()).default([]),
});

// ─── Component DTO (A+B compound products) ─────────────
export const componentSchema = z.object({
  name: z.string().min(1, 'required'),
  value: z.coerce.number().positive('required'),
  unit: z.string().min(1, 'required'),
});
// measurement value schema
const MeasurementValueSchema = z.object({
  value: z.number(),
  unit: z.string(),
});
// ─── Variant schemas ─────────────────────────────────────
export const variantSchema = z.object({
  sku: z.string().optional(),
  barcode: z.string().optional(),
  price: z.coerce.number().min(1, 'required'),
  priceAfterDiscount: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0).default(1),
  // attributes: z.record(z.string(), z.unknown()).default({}),
  // تعديل هذا الجزء داخل variants
  attributes: z.record(
    z.string(), // 👈 أضف هذا: يمثل أن مفاتيح الـ Object ستكون نصوصاً (مثل "color" أو "weight")
    z.union([z.string(), MeasurementValueSchema, z.any()]) // 👈 هذا يمثل القيم المسموحة
  ).optional(),
  components: z.array(componentSchema).optional(),
  label: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateVariantSchema = variantSchema.extend({
  _id: z.string(),
}).partial().required({ _id: true });

// ─── Shared product base fields ─────────────────────────
const productBaseSchema = z.object({
  title: z.object({
    en: z.string().min(3, 'required').max(200, 'required'),
    ar: z.string().min(3, 'required').max(200, 'required'),
  }),
  description: z.object({
    en: z.string().min(15, 'required').max(1000, 'required'),
    ar: z.string().min(15, 'required').max(1000, 'required'),
  }),
  isUnlimitedStock: z.boolean().default(true),
  disabled: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  category: z.string(),
  supCategories: z.array(z.string()).min(1, 'required'),
  brand: z.string().optional(),
  supplier: z.string().optional(),
  allowedAttributes: z.array(attributeDefinitionSchema).optional(),
});

// ─── CREATE: variants as simple array ────────────────────
export const createProductSchema = productBaseSchema.extend({
  variants: z.array(variantSchema).min(1, 'At least one variant is required'),
});

// ─── EDIT: variant operations object ─────────────────────
export const editProductSchema = productBaseSchema.extend({
  variantsToCreate: z.array(variantSchema).optional().default([]),
  variantsToUpdate: z.array(updateVariantSchema).optional().default([]),
  variantsToDelete: z.array(z.string()).optional().default([]),
});

export const orderStatusSchema = z.object({
  status: z.string().min(1, 'required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('invalidEmail'),
});

export const verifyResetCodeSchema = z.object({
  resetCode: z.string().min(1, 'required'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'invalidPassword'),
  confirmPassword: z.string().min(6, 'invalidPassword'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'passwordMismatch',
  path: ['confirmPassword'],
});

export const profileSchema = z.object({
  name: z.string().min(2, 'required'),
  email: z.string().email('invalidEmail'),
  avatar: z.any().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'invalidPassword'),
  password: z.string().min(6, 'invalidPassword'),
  confirmPassword: z.string().min(6, 'invalidPassword'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'passwordMismatch',
  path: ['confirmPassword'],
});
export const brandSchema = z.object({
  name: z.object({
    en: z.string().min(2, 'English name is required'),
    ar: z.string().min(2, 'Arabic name is required'),
  }),
  image: z.union([z.string(), z.instanceof(File), z.null()]).optional(),
});

export const carouselSchema = z.object({
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  carouselLg: z.union([z.string(), z.instanceof(File), z.null()]).optional(),
  carouselMd: z.union([z.string(), z.instanceof(File), z.null()]).optional(),
  carouselSm: z.union([z.string(), z.instanceof(File), z.null()]).optional(),
});
export const couponSchema = z.object({
  name: z.string().min(3, 'Coupon code is required (min 3 characters)'),
  discount: z.number().min(1, 'Discount must be at least 1'),
  type: z.enum(['percentage', 'fixed']),
  limit: z.number().optional(),
  expires: z.string().optional(),
});

export const promoBannerSchema = z.object({
  textEn: z.string().min(5, 'English text is required (min 5 characters)'),
  textAr: z.string().min(5, 'Arabic text is required (min 5 characters)'),
  link: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean(),
});

export const subCategorySchema = z.object({
  name: z.object({
    en: z.string().min(2, 'English name is required'),
    ar: z.string().min(2, 'Arabic name is required'),
  }),
  category: z.string().min(1, 'Parent category is required'),
});
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
export type SubCategoryFormValues = z.infer<typeof subCategorySchema>;
export type PromoBannerFormValues = z.infer<typeof promoBannerSchema>;
export type CouponFormValues = z.infer<typeof couponSchema>;
export type CarouselFormValues = z.infer<typeof carouselSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof createProductSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type EditProductInput = z.infer<typeof editProductSchema>;
export type VariantInput = z.infer<typeof variantSchema>;
export type ComponentInput = z.infer<typeof componentSchema>;
export type OrderStatusInput = z.infer<typeof orderStatusSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type VerifyResetCodeInput = z.infer<typeof verifyResetCodeSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type BrandFormValues = z.infer<typeof brandSchema>;