'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Select } from '@/shared/ui/Select';
import { SearchableSelect, SearchOption } from '@/shared/ui/form/SearchableSelect';
import { Icons } from '@/shared/ui/Icons';
import EntityPageHeader from '@/shared/ui/dashboard/EntityPageHeader';
import { useAdminSendNotification } from '@/features/notifications/hooks/useNotifications';
import { useUsers } from '@/features/users/hooks/useUsers';
import { useRoles } from '@/features/roles/hooks/useRoles';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { AdminSendNotificationDto } from '@/features/notifications/api';
import { useRouter } from 'next/navigation';
import { formatEmail } from '@/lib/utils';

const notificationSchema = z.object({
  targetType: z.enum(['direct', 'broadcast', 'role']),
  userId: z.string().optional(),
  roleId: z.string().optional(),
  action: z.string().min(2, 'Action type must be at least 2 characters'),
  message: z.string().min(5, 'Message must be at least 5 characters'),
}).superRefine((data, ctx) => {
  if (data.targetType === 'direct' && !data.userId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'User selection is required for direct notifications',
      path: ['userId']
    });
  }
  if (data.targetType === 'role' && !data.roleId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Role selection is required for role-based notifications',
      path: ['roleId']
    });
  }
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

export default function SendNotificationPage() {
  const t = useTranslations('notifications.admin');
  const tButtons = useTranslations('common.buttons');
  const tUsers = useTranslations('users');
  const router = useRouter();
  
  const { mutateAsync: sendNotification, isPending } = useAdminSendNotification();
  
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: usersData, isLoading: usersLoading } = useUsers({ limit: 20, keywords: debouncedSearchTerm });
  const { data: rolesData, isLoading: rolesLoading } = useRoles();

  const { control, handleSubmit, formState: { errors } } = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      targetType: 'broadcast',
      userId: '',
      roleId: '',
      action: 'ADMIN_ALERT',
      message: '',
    }
  });

  const targetType = useWatch({ control, name: 'targetType' });

  const onSubmit = async (data: NotificationFormValues) => {
    try {
      const payload: AdminSendNotificationDto = {
        targetType: data.targetType,
        action: data.action,
        message: data.message,
        ...(data.targetType === 'direct' && data.userId ? { userId: data.userId } : {}),
        ...(data.targetType === 'role' && data.roleId ? { roleId: data.roleId } : {})
      };
      
      await sendNotification(payload);
      router.push('/dashboard/notifications');
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };


  const searchableUserOptions: SearchOption[] = usersData?.data?.map((user: { _id: string; name: string; email: string }) => ({
    _id: user._id,
    name: `${user.name} (${formatEmail(user.email)})`
  })) || [];

  const roleOptions = rolesData?.map((role: { _id: string; name: string }) => ({
    value: role._id,
    label: tUsers.has(`roles.${role.name.toLowerCase()}`)
      ? tUsers(`roles.${role.name.toLowerCase()}`)
      : role.name
  })) || [];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <EntityPageHeader
        title={t('sendTitle')}
        subtitle={t('sendDesc')}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-xl border border-border/40">
        
        <div className="space-y-4">
          <Controller
            name="targetType"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('type')}</label>
                <Select
                  {...field}
                  options={[
                    { value: 'broadcast', label: t('typeBroadcast') },
                    { value: 'direct', label: t('typeDirect') },
                    { value: 'role', label: t('typeRole') }
                  ]}
                  error={errors.targetType?.message}
                />
              </div>
            )}
          />

          {targetType === 'direct' && (
            <Controller
              name="userId"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <SearchableSelect
                    value={field.value || ''}
                    onSelect={(val) => field.onChange(val)}
                    onSearch={(val) => setSearchTerm(val)} // Search via DB using debounced value
                    options={searchableUserOptions}
                    isLoading={usersLoading}
                    error={errors.userId?.message}
                    placeholder={t('selectUserPlaceholder')}
                    label={t('selectUser')}
                    getDisplayValue={(opt) => typeof opt.name === 'string' ? opt.name : opt.name?.en || ''}
                  />
                </div>
              )}
            />
          )}

          {targetType === 'role' && (
            <Controller
              name="roleId"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('selectRole')}</label>
                  <Select
                    {...field}
                    options={roleOptions}
                    disabled={rolesLoading}
                    error={errors.roleId?.message}
                    label={t('selectRolePlaceholder')}
                  />
                </div>
              )}
            />
          )}

          <Controller
            name="action"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('action')}</label>
                <Input
                  {...field}
                  placeholder={t('actionPlaceholder')}
                  error={errors.action?.message}
                />
              </div>
            )}
          />

          <Controller
            name="message"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('message')}</label>
                <Textarea
                  {...field}
                  placeholder={t('messagePlaceholder')}
                  error={errors.message?.message}
                  rows={4}
                />
              </div>
            )}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/notifications')}
            disabled={isPending}
          >
            {tButtons('cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="min-w-[120px]"
          >
            {isPending ? (
              <Icons.Spinner className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Icons.Send className="w-4 h-4 mr-2" />
            )}
            {t('sendButton')}
          </Button>
        </div>
      </form>
    </div>
  );
}
