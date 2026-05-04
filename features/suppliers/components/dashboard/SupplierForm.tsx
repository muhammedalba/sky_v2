'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { useCreateSupplier, useUpdateSupplier } from '@/features/suppliers/hooks/useSuppliers';
import { useState } from 'react';
import ImageUpload from '@/shared/ui/form/ImageUpload';
import { Supplier } from '@/types';
import { SupplierFormValues, supplierSchema } from '@/features/suppliers/supplier.schema';
import { Switch } from '@/shared/ui/Switch';
import { useTranslations, useLocale } from 'next-intl';
import { useToast } from '@/shared/hooks/useToast';
import { Icons } from '@/shared/ui/Icons';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/shared/ui/Textarea';
import FormStickyHeader from '@/shared/ui/dashboard/FormStickyHeader';
import { cn } from '@/lib/utils';

interface SupplierFormProps {
  editingSupplier?: Supplier | null;
  mode: 'create' | 'edit';
}

export default function SupplierForm({ editingSupplier, mode }: SupplierFormProps) {
  // locale
  const locale = useLocale();
  // translations
  const t = useTranslations('suppliers');
  const tButtons = useTranslations('buttons');

  // hooks
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const toast = useToast();
  const router = useRouter();

  // states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(editingSupplier?.avatar || null);
  const formId = mode === 'create' ? 'create-supplier-form' : 'edit-supplier-form';

  // form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: editingSupplier?.name || '',
      email: editingSupplier?.email || '',
      phone: editingSupplier?.phone || '',
      address: editingSupplier?.address || '',
      avatar: editingSupplier?.avatar || null,
      contactName: editingSupplier?.contactName || '',
      website: editingSupplier?.website ? String(editingSupplier.website) : '',
      isActive: editingSupplier?.isActive ?? true,
    },
  });

  // handlers
  const onSubmit = async (data: SupplierFormValues) => {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.email) formData.append('email', data.email);
    if (data.phone) formData.append('phone', data.phone);
    if (data.address) formData.append('address', data.address);
    if (data.contactName) formData.append('contactName', data.contactName);
    if (data.website) formData.append('website', data.website);
    formData.append('isActive', String(data.isActive));

    if (imageFile) {
      formData.append('avatar', imageFile);
    }

    try {
      if (editingSupplier) {
        await updateMutation.mutateAsync({ id: editingSupplier._id, data: formData });
        toast.success(t('messages.updateSuccess'));
      } else {
        await createMutation.mutateAsync(formData);
        toast.success(t('messages.createSuccess'));
      }
      router.push(`/${locale}/dashboard/suppliers`);

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || t('messages.error'));
    }
  };
  // 
  const handleCancel = () => {
      router.back();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">

      <FormStickyHeader
        title={mode === 'create' ? t('createSupplier') : t('editSupplier') || ''}
        subtitle={mode === 'create' ? t('subtitle') : editingSupplier?.name || ''}
        cancelLabel={tButtons('cancel')}
        saveLabel={tButtons('save')}
        formId={formId}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        backUrl={`/${locale}/dashboard/suppliers`}
      />

      <form onSubmit={handleSubmit(onSubmit)} id={formId} className="space-y-6 pt-4 bg-background/50 backdrop-blur-sm p-8 rounded-3xl border border-border/40 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
          <Input
            label={t('fields.name')}
            icon={Icons.Edit}
            {...register('name')}
            error={errors.name?.message}
            disabled={createMutation.isPending || updateMutation.isPending}
          />

          <Input
            label="Contact Name"
            icon={Icons.User}
            {...register('contactName')}
            error={errors.contactName?.message}
            disabled={createMutation.isPending || updateMutation.isPending}
          />

          <Input
            label="Email"
            type="email"
            icon={Icons.Mail}
            {...register('email')}
            error={errors.email?.message}
            disabled={createMutation.isPending || updateMutation.isPending}
          />

          <Input
            label="Phone"
            icon={Icons.Phone}
            {...register('phone')}
            error={errors.phone?.message}
            disabled={createMutation.isPending || updateMutation.isPending}
          />


          <Input
            label="Website"
            icon={Icons.Globe}
            {...register('website')}
            error={errors.website?.message}
            disabled={createMutation.isPending || updateMutation.isPending}
          />

          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2.5 bg-background border rounded-xl h-12 shadow-inner">
              <Switch {...register('isActive')} />
              <span className={cn(
                "text-sm font-medium transition-colors",
                watch('isActive') ? "text-green-600 dark:text-green-400" : "text-destructive"
              )}>
                {watch('isActive') ? t('fields.active') : t('fields.inactive')}
              </span>
            </div>
          </div>

          <div className="md:col-span-2">
            <Textarea
              label={t('fields.address')}
              icon={Icons.MapPin}
              {...register('address')}
              error={errors.address?.message}
              disabled={createMutation.isPending || updateMutation.isPending}
            />
          </div>
        </div>

        <div className="space-y-2 ">
          <label className="text-sm font-medium">{t('fields.logo')}</label>
          <ImageUpload
            value={imagePreview || undefined}
            onChange={(file) => {
              setImageFile(file);
              setImagePreview(URL.createObjectURL(file));
              setValue('avatar', file, { shouldValidate: true });
            }}
            onRemove={() => {
              setImageFile(null);
              setImagePreview(null);
              setValue('avatar', null, { shouldValidate: true });
            }}
            error={errors?.avatar?.message as string | undefined}
          />
        </div>

        <div className="flex gap-3 pt-6 border-t border-border/40">
          <Button
            className="flex-1 h-12 rounded-xl font-black shadow-lg shadow-primary/20 "
            type="submit"
            isLoading={createMutation.isPending || updateMutation.isPending}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {tButtons('save')}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-xl px-8 font-bold"
            onClick={handleCancel}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {tButtons('cancel')}
          </Button>
        </div>
      </form>
    </div>
  );
}
