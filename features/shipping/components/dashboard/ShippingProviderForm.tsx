import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Switch } from '@/shared/ui/Switch';
import { ShippingProvider } from '../../types';
import { useCreateShippingProvider, useUpdateShippingProvider } from '../../hooks/useShippingProviders';
import { useToast } from '@/shared/hooks/useToast';
import { Icons } from '@/shared/ui/Icons';
import ImageUpload from '@/shared/ui/form/ImageUpload';

const formSchema = z.object({
  name: z.string().min(1, 'الاسم بالعربية مطلوب'),
  code: z.string().min(1, 'كود الشركة مطلوب'),
  logo: z.any().optional(),
  trackingUrl: z.string().optional(),
  isActive: z.boolean(),
});

type ShippingProviderFormData = z.infer<typeof formSchema>;

interface ShippingProviderFormProps {
  editingProvider?: ShippingProvider | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ShippingProviderForm({ editingProvider, onSuccess, onCancel }: ShippingProviderFormProps) {
  const t = useTranslations('shipping');
  const tCommon = useTranslations('buttons');
  const { success: toastSuccess, error: toastError } = useToast();

  const { mutateAsync: createProvider, isPending: isCreating } = useCreateShippingProvider();
  const { mutateAsync: updateProvider, isPending: isUpdating } = useUpdateShippingProvider();
  const isPending = isCreating || isUpdating;

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(editingProvider?.logo || null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ShippingProviderFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: editingProvider ? {
      name:editingProvider.name || '',
      code: editingProvider.code || '',
      logo: editingProvider.logo || '',
      trackingUrl: editingProvider.trackingUrl || '',
      isActive: editingProvider.isActive ?? true,
    } : {
      name: "",
      code: '',
      logo: '',
      trackingUrl: '',
      isActive: true,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const payload: any = {
        name: data.name,
        code: data.code,
        trackingUrl: data.trackingUrl || '',
        isActive: data.isActive,
      };

      if (imageFile) {
        payload.logo = imageFile;
      }

      if (editingProvider) {
        await updateProvider({ id: editingProvider._id, data: payload as any });
        toastSuccess('تم التحديث بنجاح');
      } else {
        await createProvider(payload as any);
        toastSuccess('تمت الإضافة بنجاح');
      }
      onSuccess?.();
    } catch (error: any) {
      toastError(error.message || 'حدث خطأ غير متوقع');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
      <div className="space-y-2">
        <Input
          label="اسم شركة الشحن"
          icon={Icons.Edit}
          {...register('name')}
          error={errors.name?.message}
          disabled={isPending}
          dir="rtl"
        />
      </div>

      <div className="space-y-2">
        <Input
          label="كود الشركة (Code)"
          {...register('code')}
          error={errors.code?.message}
          disabled={isPending}
          dir="ltr"
        />
      </div>

      <div className="space-y-2">
        <Input
          label="رابط التتبع (Tracking URL)"
          {...register('trackingUrl')}
          error={errors.trackingUrl?.message}
          disabled={isPending}
          dir="ltr"
        />
        <p className="text-xs text-muted-foreground mt-1">استخدم {"{tracking_number}"} في الرابط ليتم استبدالها برقم التتبع لاحقاً</p>
      </div>

      <div className="space-y-2">
        <ImageUpload
          value={imagePreview || undefined}
          onChange={(file) => {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setValue('logo', file, { shouldValidate: true });
          }}
          onRemove={() => {
            setImageFile(null);
            setImagePreview(null);
            setValue('logo', undefined, { shouldValidate: true });
          }}
          error={errors?.logo?.message as string | undefined}
        />
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <div className="space-y-0.5">
          <span className="font-semibold text-base">تفعيل الشركة</span>
          <p className="text-sm text-muted-foreground">
            هل تريد إتاحة هذه الشركة للعملاء؟
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
          {editingProvider ? tCommon('save') : tCommon('add')}
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
