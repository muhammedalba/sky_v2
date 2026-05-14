'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
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

const formSchema = z.object({
  name: z.object({
    ar: z.string().min(1, 'الاسم بالعربية مطلوب'),
    en: z.string().min(1, 'الاسم بالإنجليزية مطلوب'),
  }),
  postalCode: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  isDeliveryAvailable: z.boolean(),
  isActive: z.boolean(),
});

type CityFormData = z.infer<typeof formSchema>;

interface CityFormProps {
  countryId: string;
  regionId: string;
  editingCity?: City | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CityForm({ countryId, regionId, editingCity, onSuccess, onCancel }: CityFormProps) {
  const tCommon = useTranslations('buttons');
  const { success: toastSuccess, error: toastError } = useToast();

  const { mutateAsync: createCity, isPending: isCreating } = useCreateCity();
  const { mutateAsync: updateCity, isPending: isUpdating } = useUpdateCity();
  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CityFormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: editingCity ? {
      name: {
        ar: editingCity.name?.ar || '',
        en: editingCity.name?.en || '',
      },
      postalCode: editingCity.postalCode || '',
      latitude: editingCity.latitude || 0,
      longitude: editingCity.longitude || 0,
      isDeliveryAvailable: editingCity.isDeliveryAvailable ?? true,
      isActive: editingCity.isActive ?? true,
    } : {
      name: { ar: '', en: '' },
      postalCode: '',
      latitude: 0,
      longitude: 0,
      isDeliveryAvailable: true,
      isActive: true,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        country: countryId,
        region: regionId,
      };

      if (editingCity) {
        await updateCity({ id: editingCity._id, data: payload as any });
        toastSuccess('تم التحديث بنجاح');
      } else {
        await createCity(payload as any);
        toastSuccess('تمت الإضافة بنجاح');
      }
      onSuccess?.();
    } catch (error: any) {
      toastError(error.message || 'حدث خطأ غير متوقع');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="اسم المدينة (بالعربية)"
          icon={Icons.MapPin}
          {...register('name.ar')}
          error={errors.name?.ar?.message}
          disabled={isPending}
          dir="rtl"
        />
        <Input
          label="City Name (English)"
          icon={Icons.MapPin}
          {...register('name.en')}
          error={errors.name?.en?.message}
          disabled={isPending}
          dir="ltr"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="الرمز البريدي"
          {...register('postalCode')}
          error={errors.postalCode?.message}
          disabled={isPending}
        />
        <Input
          label="خط العرض (Latitude)"
          type="number"
          step="any"
          {...register('latitude')}
          error={errors.latitude?.message}
          disabled={isPending}
        />
        <Input
          label="خط الطول (Longitude)"
          type="number"
          step="any"
          {...register('longitude')}
          error={errors.longitude?.message}
          disabled={isPending}
        />
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <div className="space-y-0.5">
          <span className="font-semibold text-base">تفعيل التوصيل</span>
          <p className="text-sm text-muted-foreground">
            هل التوصيل متاح لهذه المدينة؟
          </p>
        </div>
        <Switch
          checked={watch('isDeliveryAvailable')}
          onCheckedChange={(val) => setValue('isDeliveryAvailable', val)}
          disabled={isPending}
        />
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <div className="space-y-0.5">
          <span className="font-semibold text-base">تفعيل المدينة</span>
          <p className="text-sm text-muted-foreground">
            هل تريد إتاحة هذه المدينة للعملاء؟
          </p>
        </div>
        <Switch
          checked={watch('isActive')}
          onCheckedChange={(val) => setValue('isActive', val)}
          disabled={isPending}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          className="flex-1 h-12 rounded-xl font-black shadow-lg shadow-primary/20"
          type="submit"
          isLoading={isPending}
          disabled={isPending}
        >
          {editingCity ? tCommon('save') : tCommon('add')}
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
