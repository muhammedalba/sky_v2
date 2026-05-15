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
import { City } from '../../types';
import { useCreateCity, useUpdateCity } from '../../hooks/useLocations';

interface CityFormProps {
  countryId: string;
  regionId: string;
  editingCity?: City | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CityForm({ countryId, regionId, editingCity, onSuccess, onCancel }: CityFormProps) {
  const t = useTranslations('locations');
  const tCommon = useTranslations('common');
  const tButtons = useTranslations('buttons');
  const { success: toastSuccess, error: toastError } = useToast();

  // 1. تغليف المخطط بـ useMemo
  const formSchema = useMemo(() => z.object({
    name: z.object({
      ar: z.string().min(1, t('validation.nameArRequired')),
      en: z.string().min(1, t('validation.nameEnRequired')),
    }),
    postalCode: z.string().optional(),
    latitude: z.coerce.number().optional(),
    longitude: z.coerce.number().optional(),
    isDeliveryAvailable: z.boolean(),
    isActive: z.boolean(),
  }), [t]);

 type CityFormInput = z.input<typeof formSchema>;
  type CityFormOutput = z.output<typeof formSchema>;

  const { mutateAsync: createCity, isPending: isCreating } = useCreateCity();
  const { mutateAsync: updateCity, isPending: isUpdating } = useUpdateCity();
  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    control, // تم استخدام control بدلاً من watch و setValue
    formState: { errors },
  } =useForm<CityFormInput, any, CityFormOutput>({
    resolver: zodResolver(formSchema), // تمت إزالة as any
    defaultValues: {
      name: {
        ar: editingCity?.name?.ar || '',
        en: editingCity?.name?.en || '',
      },
      postalCode: editingCity?.postalCode || '',
      latitude: editingCity?.latitude || 0,
      longitude: editingCity?.longitude || 0,
      isDeliveryAvailable: editingCity?.isDeliveryAvailable ?? true,
      isActive: editingCity?.isActive ?? true,
    },
  });

  const onSubmit = async (data: CityFormOutput) => {
    try {
      const payload = {
        ...data,
        country: countryId,
        region: regionId,
      };

      if (editingCity) {
        await updateCity({ id: editingCity._id, data: payload }); // تمت إزالة as any
        toastSuccess(tCommon('messages.updateSuccess'));
      } else {
        await createCity(payload); // تمت إزالة as any
        toastSuccess(tCommon('messages.success'));
      }
      onSuccess?.();
    } catch (error) {
      // 2. التعامل الآمن مع الأخطاء
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label={t('form.postalCode')}
          {...register('postalCode')}
          error={errors.postalCode?.message}
          disabled={isPending}
        />
        <Input
          label={t('form.latitude')}
          type="number"
          step="any"
          {...register('latitude')}
          error={errors.latitude?.message}
          disabled={isPending}
        />
        <Input
          label={t('form.longitude')}
          type="number"
          step="any"
          {...register('longitude')}
          error={errors.longitude?.message}
          disabled={isPending}
        />
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <div className="space-y-0.5">
          <span className="font-semibold text-base">{t('form.deliveryAvailable')}</span>
          <p className="text-sm text-muted-foreground">
            {t('form.deliveryAvailableDesc')}
          </p>
        </div>
        {/* 3. استخدام Controller بدلاً من watch لزر التوصيل */}
        <Controller
          name="isDeliveryAvailable"
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

      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <div className="space-y-0.5">
          <span className="font-semibold text-base">{t('form.activateCity')}</span>
          <p className="text-sm text-muted-foreground">
            {t('form.activateCityDesc')}
          </p>
        </div>
        {/* 4. استخدام Controller بدلاً من watch لزر التفعيل */}
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
          {editingCity ? tButtons('save') : tButtons('add')}
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