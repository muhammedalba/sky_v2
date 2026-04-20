import * as z from 'zod';

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

export type ProfileInput = z.infer<typeof profileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
