'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Switch } from '@/shared/ui/Switch';
import { ShippingRate } from '../../types';
import { useCreateShippingRate, useUpdateShippingRate } from '../../hooks/useShippingRates';
import { useShippingProviders } from '../../hooks/useShippingProviders';
import { useToast } from '@/shared/hooks/useToast';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Select } from '@/shared/ui/Select';
import { useCountries, useRegions, useCities } from '@/features/locations/hooks/useLocations';

const formSchema = z.object({
  provider: z.string().min(1, 'اختر شركة الشحن'),
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  basePrice: z.coerce.number().min(0, 'السعر الأساسي غير صحيح'),
  baseWeight: z.coerce.number().min(0, 'الوزن الأساسي غير صحيح'),
  additionalKgPrice: z.coerce.number().min(0, 'سعر الكيلو الإضافي غير صحيح'),
  estimatedDays: z.string().optional(),
  supportsCOD: z.boolean(),
  isActive: z.boolean(),
});

type ShippingRateFormData = z.infer<typeof formSchema>;

interface ShippingRateFormProps {
  editingRate?: ShippingRate | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ShippingRateForm({ editingRate, onSuccess, onCancel }: ShippingRateFormProps) {
  const t = useTranslations('shippingRates');
  const tCommon = useTranslations('buttons');
  const { success: toastSuccess, error: toastError } = useToast();

  const { data: providersResponse } = useShippingProviders({ limit: 100 });
  const providers = Array.isArray(providersResponse) ? providersResponse : (providersResponse as any)?.data || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ShippingRateFormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      provider: editingRate?.provider?._id || '',
      country: editingRate?.country?._id || '',
      region: editingRate?.region?._id || '',
      city: editingRate?.city?._id || '',
      basePrice: editingRate?.basePrice || 0,
      baseWeight: editingRate?.baseWeight || 15,
      additionalKgPrice: editingRate?.additionalKgPrice || 0,
      estimatedDays: editingRate?.estimatedDays || '',
      supportsCOD: editingRate?.supportsCOD ?? false,
      isActive: editingRate?.isActive ?? true,
    },
  });

  const selectedCountry = watch('country');
  const selectedRegion = watch('region');

  const { data: countries } = useCountries();
  const { data: regions } = useRegions(selectedCountry);
  const { data: cities } = useCities(selectedRegion);

  const { mutateAsync: createRate, isPending: isCreating } = useCreateShippingRate();
  const { mutateAsync: updateRate, isPending: isUpdating } = useUpdateShippingRate();
  const isPending = isCreating || isUpdating;

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        country: data.country || undefined,
        region: data.region || undefined,
        city: data.city || undefined,
      };

      if (editingRate) {
        await updateRate({ id: editingRate._id, payload });
        toastSuccess('تم تحديث التسعيرة بنجاح');
      } else {
        await createRate(payload);
        toastSuccess('تمت إضافة التسعيرة بنجاح');
      }
      onSuccess?.();
    } catch (error: any) {
      toastError(error.message || 'حدث خطأ غير متوقع');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Select 
            label={t('fields.provider')}
            value={watch('provider')} 
            onChange={(e) => setValue('provider', e.target.value, { shouldValidate: true })}
            options={providers.map((p: any) => ({
              value: p._id,
              label: typeof p.name === 'string' ? p.name : p.name?.ar || p.name?.en
            }))}
            error={errors.provider?.message}
            dir="rtl"
          />
        </div>

        <div className="space-y-2">
          <Select 
            label={t('fields.country')}
            value={watch('country')} 
            onChange={(e) => {
              setValue('country', e.target.value, { shouldValidate: true });
              setValue('region', '');
              setValue('city', '');
            }}
            options={countries?.map((c: any) => ({
              value: c._id,
              label: c.name?.ar || c.name
            })) || []}
            dir="rtl"
          />
        </div>

        <div className="space-y-2">
          <Select 
            label={t('fields.region')}
            value={watch('region')} 
            onChange={(e) => {
              setValue('region', e.target.value, { shouldValidate: true });
              setValue('city', '');
            }}
            options={regions?.map((r: any) => ({
              value: r._id,
              label: r.name?.ar || r.name
            })) || []}
            dir="rtl"
          />
        </div>

        <div className="space-y-2">
          <Select 
            label={t('fields.city')}
            value={watch('city')} 
            onChange={(e) => setValue('city', e.target.value, { shouldValidate: true })}
            options={cities?.map((c: any) => ({
              value: c._id,
              label: c.name?.ar || c.name
            })) || []}
            dir="rtl"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label={t('fields.basePrice')}
          type="number"
          step="0.01"
          {...register('basePrice')}
          error={errors.basePrice?.message}
        />
        <Input
          label={t('fields.baseWeight')}
          type="number"
          step="0.1"
          {...register('baseWeight')}
          error={errors.baseWeight?.message}
        />
        <Input
          label={t('fields.additionalKgPrice')}
          type="number"
          step="0.01"
          {...register('additionalKgPrice')}
          error={errors.additionalKgPrice?.message}
        />
      </div>

      <div className="space-y-2">
        <Input
          label={t('fields.estimatedDays')}
          {...register('estimatedDays')}
          error={errors.estimatedDays?.message}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
          <div className="space-y-0.5">
            <span className="font-semibold text-base">{t('fields.supportsCOD')}</span>
            <p className="text-sm text-muted-foreground">{t('fields.supportsCOD')}</p>
          </div>
          <Switch
            checked={watch('supportsCOD')}
            onCheckedChange={(val) => setValue('supportsCOD', val)}
            disabled={isPending}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
          <div className="space-y-0.5">
            <span className="font-semibold text-base">{t('fields.isActive')}</span>
            <p className="text-sm text-muted-foreground">{t('fields.isActive')}</p>
          </div>
          <Switch
            checked={watch('isActive')}
            onCheckedChange={(val) => setValue('isActive', val)}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          className="flex-1 h-12 rounded-xl font-black shadow-lg shadow-primary/20"
          type="submit"
          isLoading={isPending}
          disabled={isPending}
        >
          {editingRate ? tCommon('save') : tCommon('add')}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-xl px-6 font-bold"
          onClick={onCancel}
          disabled={isPending}
        >
          {tCommon('cancel')}
        </Button>
      </div>
    </form>
  );
}
