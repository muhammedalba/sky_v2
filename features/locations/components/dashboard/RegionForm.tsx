'use client';

import { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations, useLocale } from 'next-intl';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Switch } from '@/shared/ui/Switch';
import { Icons } from '@/shared/ui/Icons';
import { Select } from '@/shared/ui/Select';
import { useToast } from '@/shared/hooks/useToast';
import { Region } from '../../types';
import { useCountries, useCreateRegion, useUpdateRegion } from '../../hooks/useLocations';

interface RegionFormProps {
  initialCountryId?: string;
  editingRegion?: Region | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function RegionForm({ initialCountryId, editingRegion, onSuccess, onCancel }: RegionFormProps) {
  const t = useTranslations('locations');
  const tCommon = useTranslations('common');
  const tButtons = useTranslations('buttons');
  const locale = useLocale();
  const { success: toastSuccess, error: toastError } = useToast();

  // 1. تغليف المخطط بـ useMemo
  const formSchema = useMemo(() => z.object({
    name: z.object({
      ar: z.string().min(1, t('validation.nameArRequired')),
      en: z.string().min(1, t('validation.nameEnRequired')),
    }),
    country: z.string().min(1, t('validation.countryRequired')),
    isActive: z.boolean(),
  }), [t]);

  type RegionFormData = z.infer<typeof formSchema>;

  const { data: countries = [] } = useCountries(true);
  const { mutateAsync: createRegion, isPending: isCreating } = useCreateRegion();
  const { mutateAsync: updateRegion, isPending: isUpdating } = useUpdateRegion();
  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    control, // استخدام control بدلاً من watch و setValue
    formState: { errors },
  } = useForm<RegionFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: {
        ar: editingRegion?.name?.ar || '',
        en: editingRegion?.name?.en || '',
      },
      country: (typeof editingRegion?.country === 'string' ? editingRegion?.country : editingRegion?.country?._id) || initialCountryId || '',
      isActive: editingRegion?.isActive ?? true,
    },
  });

  // 2. استخدام useMemo لمصفوفة الدول لتجنب إعادة الحساب
  const countryOptions = useMemo(() => {
    return countries.map(c => ({
      label: c.name?.[locale as 'ar' | 'en'] || c.name?.ar,
      value: c._id
    }));
  }, [countries, locale]);

  const onSubmit = async (data: RegionFormData) => {
    try {
      if (editingRegion) {
        await updateRegion({ id: editingRegion._id, data }); // تمت إزالة as any
        toastSuccess(tCommon('messages.updateSuccess'));
      } else {
        await createRegion(data); // تمت إزالة as any
        toastSuccess(tCommon('messages.success'));
      }
      onSuccess?.();
    } catch (error) {
      // 3. معالجة آمنة للأخطاء
      const errorMessage = error instanceof Error ? error.message : tCommon('errors.networkError');
      toastError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('form.nameAr')}
          icon={Icons.MapPin}
          {...register('name.ar')}
          error={errors.name?.ar?.message}
          disabled={isPending}
          dir="rtl"
        />
        <Input
          label={t('form.nameEn')}
          icon={Icons.MapPin}
          {...register('name.en')}
          error={errors.name?.en?.message}
          disabled={isPending}
          dir="ltr"
        />
      </div>

      {/* 4. استخدام Controller بدلاً من watch للقائمة المنسدلة */}
      <Controller
        name="country"
        control={control}
        render={({ field }) => (
          <Select
            label={t('fields.country')}
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            options={countryOptions}
            error={errors.country?.message}
            disabled={isPending}
          />
        )}
      />

      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <div className="space-y-0.5">
          <span className="font-semibold text-base">{t('form.activateRegion')}</span>
          <p className="text-sm text-muted-foreground">
            {t('form.activateRegionDesc')}
          </p>
        </div>
        {/* 5. استخدام Controller لزر التفعيل */}
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
          {editingRegion ? tButtons('save') : tButtons('add')}
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