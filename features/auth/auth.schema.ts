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

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type VerifyResetCodeInput = z.infer<typeof verifyResetCodeSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
