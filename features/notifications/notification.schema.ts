import * as z from 'zod';

export const notificationSchema = z.object({
  targetType: z.enum(['direct', 'broadcast', 'role']),
  userId: z.string().optional(),
  roleId: z.string().optional(),
  actionType: z.string().min(1, 'Action type is required'),
  customAction: z.string().optional(),
  messageAr: z.string().min(5, 'Arabic message must be at least 5 characters'),
  messageEn: z.string().min(5, 'English message must be at least 5 characters'),
}).superRefine((data, ctx) => {
  if (data.targetType === 'direct' && !data.userId) {
    ctx.addIssue({
      code: 'custom',
      message: 'User selection is required for direct notifications',
      path: ['userId']
    });
  }
  if (data.targetType === 'role' && !data.roleId) {
    ctx.addIssue({
      code: 'custom',
      message: 'Role selection is required for role-based notifications',
      path: ['roleId']
    });
  }
  if (data.actionType === 'CUSTOM' && (!data.customAction || data.customAction.trim().length < 2)) {
    ctx.addIssue({
      code: 'custom',
      message: 'Custom action name must be at least 2 characters',
      path: ['customAction']
    });
  }
});

export type NotificationFormValues = z.infer<typeof notificationSchema>;
