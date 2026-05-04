import * as z from 'zod';

export const profileSchema = z.object({
  name: z.string().min(2, 'required'),
  email: z.string().email('invalidEmail'),
  avatar: z.any().optional(),
  phone: z.string().max(15, 'invalidPhone').min(11, 'invalidPhone').optional(),
});

export const changePasswordSchema = z.object({
  password: z.string().min(6, 'invalidPassword'),
  confirmPassword: z.string().min(6, 'invalidPassword'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'passwordMismatch',
  path: ['confirmPassword'],
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// الحقول الأساسية المشتركة
const baseUserFields = {
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'user', 'manager']),
  isActive: z.boolean(),
  phone: z.string().optional(),
  avatar: z.any().optional(),
};

// مخطط الإنشاء (كلمة المرور إجبارية)
export const createUserSchema = z.object({
  ...baseUserFields,
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// مخطط التعديل (كلمة المرور اختيارية)
export const editUserSchema = z.object({
  ...baseUserFields,
  password: z.string().optional().refine((val) => !val || val.length >= 6, {
    message: 'Password must be at least 6 characters',
  }),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type UserFormValues = z.infer<typeof editUserSchema>;
