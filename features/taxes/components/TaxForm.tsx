'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Switch } from '@/shared/ui/Switch';
import { Select } from '@/shared/ui/Select';
import { useToast } from '@/shared/hooks/useToast';
import { Tax, useCreateTax, useUpdateTax } from '../hooks/useTaxes';
import { useCountries } from '@/features/locations/hooks/useLocations';

const formSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب'),
  percentage: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0).max(100)
  ),
  country: z.string().optional(),
  taxNumber: z.string().optional(),
  isIncludedInPrice: z.boolean().default(false),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
});

// تعريف النوع يدوياً لتجاوز مشكلة z.preprocess مع TypeScript
interface TaxFormData {
  name: string;
  percentage: number;
  country?: string;
  taxNumber?: string;
  isIncludedInPrice: boolean;
  isActive: boolean;
  description?: string;
}

interface TaxFormProps {
  editingTax?: Tax | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TaxForm({ editingTax, onSuccess, onCancel }: TaxFormProps) {
  const t = useTranslations('taxes');
  const tCommon = useTranslations('buttons');
  const { success: toastSuccess, error: toastError } = useToast();

  const { data: countriesResponse } = useCountries();
  const countries = Array.isArray(countriesResponse)
    ? countriesResponse
    : (countriesResponse as any)?.data || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TaxFormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: 'VAT',
      percentage: 15,
      country: '',
      taxNumber: '',
      isIncludedInPrice: false,
      isActive: true,
      description: '',
    },
  });

  useEffect(() => {
    if (editingTax) {
      reset({
        name: editingTax.name,
        percentage: editingTax.percentage,
        country:
          typeof editingTax.country === 'object'
            ? editingTax.country?._id
            : editingTax.country || '',
        taxNumber: editingTax.taxNumber || '',
        isIncludedInPrice: editingTax.isIncludedInPrice,
        isActive: editingTax.isActive,
        description: editingTax.description || '',
      });
    }
  }, [editingTax, reset]);

  const createMutation = useCreateTax();
  const updateMutation = useUpdateTax();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (data: TaxFormData) => {
    try {
      const payload: any = { ...data };
      // إذا لم تُحدد دولة، نحذف الحقل ليصبح ضريبة افتراضية عامة
      if (!payload.country) delete payload.country;

      if (editingTax) {
        await updateMutation.mutateAsync({ id: editingTax._id, data: payload });
        toastSuccess('تم', 'تم تحديث الضريبة بنجاح');
      } else {
        await createMutation.mutateAsync(payload);
        toastSuccess('تم', 'تم إضافة الضريبة بنجاح');
      }
      onSuccess?.();
    } catch (err: any) {
      toastError('خطأ', err.response?.data?.message || 'حدث خطأ غير متوقع');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('fields.name')}
          {...register('name')}
          error={errors.name?.message}
          dir="rtl"
          placeholder="مثال: ضريبة القيمة المضافة"
        />

        <Input
          type="number"
          step="0.01"
          label={t('fields.percentage')}
          {...register('percentage')}
          error={errors.percentage?.message}
          dir="rtl"
        />

        <Select
          label={t('fields.country')}
          value={watch('country')}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setValue('country', e.target.value, { shouldValidate: true })
          }
          options={[
            { value: '', label: t('globalFallback') },
            ...countries.map((c: any) => ({
              value: c._id,
              label: c.name?.ar || c.name,
            })),
          ]}
          dir="rtl"
        />

        <Input
          label={t('fields.taxNumber')}
          {...register('taxNumber')}
          error={errors.taxNumber?.message}
          dir="rtl"
        />
      </div>

      <Input
        label={t('fields.description')}
        {...register('description')}
        error={errors.description?.message}
        dir="rtl"
      />

      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">{t('fields.isIncludedInPrice')}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('fields.isIncludedInPriceDesc')}
            </p>
          </div>
          <Switch
            checked={watch('isIncludedInPrice')}
            onCheckedChange={(val: boolean) => setValue('isIncludedInPrice', val)}
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="font-medium text-sm">{t('fields.isActive')}</p>
          <Switch
            checked={watch('isActive')}
            onCheckedChange={(val: boolean) => setValue('isActive', val)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          {tCommon('cancel')}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? tCommon('saving') : tCommon('save')}
        </Button>
      </div>
    </form>
  );
}
