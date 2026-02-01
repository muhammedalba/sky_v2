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

export const productSchema = z.object({
  title: z.string().min(2, 'required'),
  description: z.string().min(10, 'required'),
  price: z.coerce.number().positive('required'),
  quantity: z.coerce.number().int().nonnegative('required'),
  category: z.string().min(1, 'required'),
  sku: z.string().optional(),
  brand: z.string().optional(),
  imageCover: z.any().optional(),
  images: z.any().array().optional(),
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

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type OrderStatusInput = z.infer<typeof orderStatusSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type VerifyResetCodeInput = z.infer<typeof verifyResetCodeSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
