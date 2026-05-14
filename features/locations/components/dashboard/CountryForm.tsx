'use client';

import { useForm } from 'react-hook-form';
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

const formSchema = z.object({
  name: z.object({
    ar: z.string().min(1, 'الاسم بالعربية مطلوب'),
    en: z.string().min(1, 'الاسم بالإنجليزية مطلوب'),
  }),
  code: z.string().min(2, 'كود الدولة مطلوب').max(5),
  phoneCode: z.string().min(1, 'كود الهاتف مطلوب'),
  currency: z.string().min(1, 'العملة مطلوبة'),
  isActive: z.boolean(),
});

type CountryFormData = z.infer<typeof formSchema>;

interface CountryFormProps {
  editingCountry?: Country | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CountryForm({ editingCountry, onSuccess, onCancel }: CountryFormProps) {
  const tCommon = useTranslations('buttons');
  const { success: toastSuccess, error: toastError } = useToast();

  const { mutateAsync: createCountry, isPending: isCreating } = useCreateCountry();
  const { mutateAsync: updateCountry, isPending: isUpdating } = useUpdateCountry();
  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CountryFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: editingCountry ? {
      name: {
        ar: editingCountry.name?.ar || '',
        en: editingCountry.name?.en || '',
      },
      code: editingCountry.code || '',
      phoneCode: editingCountry.phoneCode || '',
      currency: editingCountry.currency || 'SAR',
      isActive: editingCountry.isActive ?? true,
    } : {
      name: { ar: '', en: '' },
      code: '',
      phoneCode: '',
      currency: 'SAR',
      isActive: true,
    },
  });

  const onSubmit = async (data: CountryFormData) => {
    try {
      if (editingCountry) {
        await updateCountry({ id: editingCountry._id, data: data as any });
        toastSuccess('تم تحديث الدولة بنجاح');
      } else {
        await createCountry(data as any);
        toastSuccess('تمت إضافة الدولة بنجاح');
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
          label="اسم الدولة (بالعربية)"
          icon={Icons.Globe}
          {...register('name.ar')}
          error={errors.name?.ar?.message}
          disabled={isPending}
          dir="rtl"
        />
        <Input
          label="Country Name (English)"
          icon={Icons.Globe}
          {...register('name.en')}
          error={errors.name?.en?.message}
          disabled={isPending}
          dir="ltr"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="كود الدولة (ISO)"
          placeholder="مثلاً: SA"
          {...register('code')}
          error={errors.code?.message}
          disabled={isPending}
        />
        <Input
          label="كود الهاتف"
          placeholder="مثلاً: +966"
          {...register('phoneCode')}
          error={errors.phoneCode?.message}
          disabled={isPending}
        />
        <Input
          label="العملة"
          placeholder="مثلاً: SAR"
          {...register('currency')}
          error={errors.currency?.message}
          disabled={isPending}
        />
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <div className="space-y-0.5">
          <span className="font-semibold text-base">تفعيل الدولة</span>
          <p className="text-sm text-muted-foreground">
            إتاحة الدولة في خيارات الشحن والعناوين
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
          {editingCountry ? tCommon('save') : tCommon('add')}
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
