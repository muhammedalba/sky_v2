'use client';

import { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Switch } from '@/shared/ui/Switch';
import { Icons } from '@/shared/ui/Icons';
import { useToast } from '@/shared/hooks/useToast';
import { Country } from '../../types';
import { useCreateCountry, useUpdateCountry } from '../../hooks/useLocations';

interface CountryFormProps {
  editingCountry?: Country | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CountryForm({ editingCountry, onSuccess, onCancel }: CountryFormProps) {
  const t = useTranslations('locations');
  const tCommon = useTranslations('common');
  const tButtons = useTranslations('buttons');
  const { success: toastSuccess, error: toastError } = useToast();

  // 1. تغليف المخطط بـ useMemo لمنع إعادة إنشائه مع كل Render
  const formSchema = useMemo(() => z.object({
    name: z.object({
      ar: z.string().min(1, t('validation.nameArRequired')),
      en: z.string().min(1, t('validation.nameEnRequired')),
    }),
    code: z.string().min(2, t('validation.countryCodeRequired')).max(5),
    phoneCode: z.string().min(1, t('validation.phoneCodeRequired')),
    currency: z.string().min(1, t('validation.currencyRequired')),
    isActive: z.boolean(),
  }), [t]);

  type CountryFormData = z.infer<typeof formSchema>;

  const { mutateAsync: createCountry, isPending: isCreating } = useCreateCountry();
  const { mutateAsync: updateCountry, isPending: isUpdating } = useUpdateCountry();
  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    control, // تم إضافة control لاستخدامه مع الـ Switch
    formState: { errors },
  } = useForm<CountryFormData>({
    resolver: zodResolver(formSchema),
    // 2. تنظيف واختصار القيم الافتراضية
    defaultValues: {
      name: {
        ar: editingCountry?.name?.ar || '',
        en: editingCountry?.name?.en || '',
      },
      code: editingCountry?.code || '',
      phoneCode: editingCountry?.phoneCode || '',
      currency: editingCountry?.currency || 'SAR',
      isActive: editingCountry?.isActive ?? true,
    },
  });

  const onSubmit = async (data: CountryFormData) => {
    try {
      // 3. التخلص من (as any) للحفاظ على صرامة الأنواع
      if (editingCountry) {
        await updateCountry({ id: editingCountry._id, data });
        toastSuccess(tCommon('messages.updateSuccess'));
      } else {
        await createCountry(data);
        toastSuccess(tCommon('messages.success'));
      }
      onSuccess?.();
    } catch (error) {
      // 4. كتابة آمنة لمعالجة الأخطاء بدلاً من error: any
      const errorMessage = error instanceof Error ? error.message : tCommon('errors.networkError');
      toastError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('form.nameAr')}
          icon={Icons.Globe}
          {...register('name.ar')}
          error={errors.name?.ar?.message}
          disabled={isPending}
          dir="rtl"
        />
        <Input
          label={t('form.nameEn')}
          icon={Icons.Globe}
          {...register('name.en')}
          error={errors.name?.en?.message}
          disabled={isPending}
          dir="ltr"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label={t('form.countryCode')}
          placeholder="ISO: SA"
          {...register('code')}
          error={errors.code?.message}
          disabled={isPending}
        />
        <Input
          label={t('form.phoneCode')}
          placeholder="+966"
          {...register('phoneCode')}
          error={errors.phoneCode?.message}
          disabled={isPending}
        />
        <Input
          label={t('form.currency')}
          placeholder="SAR"
          {...register('currency')}
          error={errors.currency?.message}
          disabled={isPending}
        />
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <div className="space-y-0.5">
          <span className="font-semibold text-base">{t('form.activateCountry')}</span>
          <p className="text-sm text-muted-foreground">
            {t('form.activateCountryDesc')}
          </p>
        </div>
        {/* 5. استخدام Controller لربط Switch بحالة الفورم دون التسبب بـ Re-render كامل */}
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={isPending}
            />
          )}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          className="flex-1 h-12 rounded-xl font-black shadow-lg shadow-primary/20"
          type="submit"
          isLoading={isPending}
          disabled={isPending}
        >
          {editingCountry ? tButtons('save') : tButtons('add')}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-xl px-6 font-bold"
          onClick={onCancel}
          disabled={isPending}
        >
          {tButtons('cancel')}
        </Button>
      </div>
    </form>
  );
}