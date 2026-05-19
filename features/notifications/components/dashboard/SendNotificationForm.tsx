'use client';

import { useState, useMemo } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Select } from '@/shared/ui/Select';
import { SearchableSelect, SearchOption } from '@/shared/ui/form/SearchableSelect';
import { Icons } from '@/shared/ui/Icons';
import { useAdminSendNotification, useGetNotificationActions } from '@/features/notifications/hooks/useNotifications';
import { useUsers } from '@/features/users/hooks/useUsers';
import { useRoles } from '@/features/roles/hooks/useRoles';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { AdminSendNotificationDto } from '@/features/notifications/api';
import { useRouter } from 'next/navigation';
import { formatEmail } from '@/lib/utils';
import { notificationSchema, NotificationFormValues } from '@/features/notifications/notification.schema';
import { useTrans } from '@/shared/hooks/useTrans';

const FALLBACK_ACTIONS = [
  { value: 'GENERAL', label: { ar: 'إشعار عام', en: 'General Notification' } },
  { value: 'SYSTEM_UPDATE', label: { ar: 'تحديث النظام', en: 'System Update' } },
  { value: 'ADMIN_ALERT', label: { ar: 'تنبيه إداري هام', en: 'Important Admin Alert' } },
  { value: 'PROMOTION', label: { ar: 'عرض ترويجي / خصم', en: 'Promotion / Discount' } },
  { value: 'ORDER_UPDATE', label: { ar: 'تحديث حالة الطلب', en: 'Order Status Update' } },
  { value: 'CUSTOM', label: { ar: 'أخرى / إجراء مخصص', en: 'Other / Custom Action' } },
];

export default function SendNotificationForm() {
  const t = useTranslations('notifications.admin');
  const tButtons = useTranslations('common.buttons');
  const tUsers = useTranslations('users');
  const router = useRouter();
  const locale = useLocale();
  const getTrans = useTrans();

  const { mutateAsync: sendNotification, isPending } = useAdminSendNotification();
  const { data: actionsData, isLoading: actionsLoading } = useGetNotificationActions();

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
      actionType: 'ADMIN_ALERT',
      customAction: '',
      messageAr: '',
      messageEn: '',
    }
  });

  const targetType = useWatch({ control, name: 'targetType' });
  const actionType = useWatch({ control, name: 'actionType' });

  const onSubmit = async (data: NotificationFormValues) => {
    try {
      const actionValue = data.actionType === 'CUSTOM' ? data.customAction : data.actionType;
      const payload: AdminSendNotificationDto = {
        targetType: data.targetType,
        action: actionValue || 'GENERAL',
        message: {
          ar: data.messageAr,
          en: data.messageEn,
        },
        ...(data.targetType === 'direct' && data.userId ? { userId: data.userId } : {}),
        ...(data.targetType === 'role' && data.roleId ? { roleId: data.roleId } : {})
      };
      await sendNotification(payload);
      router.push('/dashboard/notifications');
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  const fallbackActions = useMemo(() =>
    FALLBACK_ACTIONS.map((act) => ({
      value: act.value,
      label: getTrans(act.label),
      icon: Icons.Bell
    })),
    [getTrans]
  );

  const actionOptions = useMemo(() =>
    actionsData?.map((act) => ({
      value: act.value,
      label: getTrans(act.label) ,
     
    })) || [],
    [actionsData, getTrans]
  );

  const searchableUserOptions: SearchOption[] = useMemo(() =>
    usersData?.data?.map((user: { _id: string; name: string; email: string }) => ({
      _id: user._id,
      name: `${user.name} (${formatEmail(user.email)})`
    })) || [],
    [usersData?.data]
  );

  const roleOptions = useMemo(() =>
    rolesData?.map((role: { _id: string; name: string }) => ({
      value: role._id,
      label: tUsers.has(`roles.${role.name.toLowerCase()}`)
        ? tUsers(`roles.${role.name.toLowerCase()}`)
        : role.name,
      icon: Icons.User
    })) || [],
    [rolesData, tUsers]
  );

  const targetTypeOptions = useMemo(() => [
    { value: 'broadcast', label: t('typeBroadcast'), icon: Icons.Globe },
    { value: 'direct', label: t('typeDirect'), icon: Icons.User },
    { value: 'role', label: t('typeRole'), icon: Icons.Users }
  ], [t]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-xl border border-border/40">
      <div className="space-y-4">
        <Controller
          name="targetType"
          control={control}
          render={({ field }) => (
            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium">{t('type')}</label>
              <Select
                {...field}
                options={targetTypeOptions}
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
              <div className="space-y-2" >
                <SearchableSelect
                  value={field.value || ''}
                  onSelect={(val) => field.onChange(val)}
                  onSearch={(val) => setSearchTerm(val)}
                  options={searchableUserOptions}
                  isLoading={usersLoading}
                  error={errors.userId?.message}
                  placeholder={t('selectUserPlaceholder')}
                  icon={Icons.User}
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
              <div className="space-y-2 ">
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
          name="actionType"
          control={control}
          render={({ field }) => (
            <div className="space-y-2 ">
              <Select
                {...field}
                options={actionsData ? actionOptions : fallbackActions}
                disabled={actionsLoading}
                error={errors.actionType?.message}
                icon={Icons.Bell}
                label={t('action')}
              />
            </div>
          )}
        />

        {actionType === 'CUSTOM' && (
          <Controller
            name="customAction"
            control={control}
            render={({ field }) => (
              <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">

                <Input
                  {...field}
                  label={locale === 'ar' ? 'اسم الإجراء المخصص (باللغة الإنجليزية، مثل: SPECIAL_OFFER)' : 'Custom Action Name (English, e.g. SPECIAL_OFFER)'}
                  placeholder={locale === 'ar' ? 'أدخل اسم الإجراء المخصص' : 'Enter custom action name'}
                  error={errors.customAction?.message}
                  className="uppercase"
                  icon={Icons.Bell}

                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
                    field.onChange(value);
                  }}
                />
              </div>
            )}
          />
        )}

        <Controller
          name="messageAr"
          control={control}
          render={({ field }) => (
            <div className="space-y-4 pt-4">
              <Textarea
                {...field}
                label={t('messageAr')}
                placeholder={t('messageArPlaceholder')}
                error={errors.messageAr?.message}
                rows={4}
                className="text-right font-sans"
                dir="rtl"
                icon={Icons.MessageCircle}
              />
            </div>
          )}
        />

        <Controller
          name="messageEn"
          control={control}
          render={({ field }) => (
            <div className="space-y-2 pt-4">
              <Textarea
                {...field}
                label={t('messageEn')}
                placeholder={t('messageEnPlaceholder')}
                error={errors.messageEn?.message}
                rows={4}
                className="text-left font-sans"
                dir="ltr"
                icon={Icons.MessageCircle}
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
  );
}
