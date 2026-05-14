'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Switch } from '@/shared/ui/Switch';
import { Icons } from '@/shared/ui/Icons';
import { Select } from '@/shared/ui/Select';
import { useToast } from '@/shared/hooks/useToast';
import { Region } from '../../types';
import { useCountries, useCreateRegion, useUpdateRegion } from '../../hooks/useLocations';

const formSchema = z.object({
  name: z.object({
    ar: z.string().min(1, 'الاسم بالعربية مطلوب'),
    en: z.string().min(1, 'الاسم بالإنجليزية مطلوب'),
  }),
  country: z.string().min(1, 'الدولة مطلوبة'),
  isActive: z.boolean(),
});

type RegionFormData = z.infer<typeof formSchema>;

interface RegionFormProps {
  initialCountryId?: string;
  editingRegion?: Region | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function RegionForm({ initialCountryId, editingRegion, onSuccess, onCancel }: RegionFormProps) {
  const tCommon = useTranslations('buttons');
  const { success: toastSuccess, error: toastError } = useToast();

  const { data: countries = [] } = useCountries();
  const { mutateAsync: createRegion, isPending: isCreating } = useCreateRegion();
  const { mutateAsync: updateRegion, isPending: isUpdating } = useUpdateRegion();
  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegionFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: editingRegion ? {
      name: {
        ar: editingRegion.name?.ar || '',
        en: editingRegion.name?.en || '',
      },
      country: (typeof editingRegion.country === 'string' ? editingRegion.country : editingRegion.country?._id) || '',
      isActive: editingRegion.isActive ?? true,
    } : {
      name: { ar: '', en: '' },
      country: initialCountryId || '',
      isActive: true,
    },
  });

  const onSubmit = async (data: RegionFormData) => {
    try {
      if (editingRegion) {
        await updateRegion({ id: editingRegion._id, data: data as any });
        toastSuccess('تم تحديث المنطقة بنجاح');
      } else {
        await createRegion(data as any);
        toastSuccess('تمت إضافة المنطقة بنجاح');
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
          label="اسم المنطقة (بالعربية)"
          icon={Icons.MapPin}
          {...register('name.ar')}
          error={errors.name?.ar?.message}
          disabled={isPending}
          dir="rtl"
        />
        <Input
          label="Region Name (English)"
          icon={Icons.MapPin}
          {...register('name.en')}
          error={errors.name?.en?.message}
          disabled={isPending}
          dir="ltr"
        />
      </div>

      <Select
        label="الدولة"
        value={watch('country')}
        onChange={(e) => setValue('country', e.target.value)}
        options={countries.map(c => ({ label: c.name?.ar, value: c._id }))}
        error={errors.country?.message}
        disabled={isPending}
      />

      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <div className="space-y-0.5">
          <span className="font-semibold text-base">تفعيل المنطقة</span>
          <p className="text-sm text-muted-foreground">
            إتاحة المنطقة لاختيار المدن التابعة لها
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
          {editingRegion ? tCommon('save') : tCommon('add')}
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
