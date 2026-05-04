'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { useCreateBrand, useUpdateBrand } from '@/features/brands/hooks/useBrands';
import { useState } from 'react';
import { Brand } from '@/types';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Icons } from '@/shared/ui/Icons';
import { BrandFormValues, brandSchema } from '@/features/brands/brand.schema';
import { useToast } from '@/shared/hooks/useToast';
import ImageUpload from '@/shared/ui/form/ImageUpload';


interface BrandFormProps {
  editingBrand: Brand | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BrandForm({ editingBrand, onSuccess, onCancel }: BrandFormProps) {
  const t = useTranslations('brands');
  const tCommon = useTranslations('buttons');
  const tErrors = useTranslations('errors');
  const createMutation = useCreateBrand();
  const updateMutation = useUpdateBrand();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(editingBrand?.image || null);
  const toast = useToast();
  const tError = (msg?: string) => (msg ? (msg.startsWith('validation.') ? t(msg) : msg) : undefined);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: {
        en: editingBrand ? (typeof editingBrand.name === 'string' ? editingBrand.name : editingBrand.name?.en || '') : '',
        ar: editingBrand ? (typeof editingBrand.name === 'string' ? editingBrand.name : editingBrand.name?.ar || '') : '',
      },
      image: editingBrand?.image || '',
    },
  });

  const onSubmit = async (data: BrandFormValues) => {
    const formData = new FormData();
    formData.append('name[en]', data.name.en);
    formData.append('name[ar]', data.name.ar);

    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (editingBrand) {
        await updateMutation.mutateAsync({ id: editingBrand._id, data: formData });
        toast.success(t('messages.updateSuccess'), data.name.en);
      } else {
        await createMutation.mutateAsync(formData);
        toast.success(t('messages.createSuccess'), data.name.en);
      }
      onSuccess();

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || t('messages.error'), data.name.en);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Input
            showAiAction
            aiActionTooltip={t('aiTranslateImprove')}
            icon={Icons.Edit}
            label={t('fields.name') + (' (English)')}
            {...register('name.en')}
            error={(errors.name?.en?.message)}
            disabled={createMutation.isPending || updateMutation.isPending}
          />
        </div>

        <div className="space-y-2">
          <Input
            label={t('fields.name') + (' (Arabic)')}
            showAiAction
            aiActionTooltip={t('aiTranslateImprove')}
            icon={Icons.Edit}
            {...register('name.ar')}
            error={errors.name?.ar?.message}
            disabled={createMutation.isPending || updateMutation.isPending}
            dir="rtl"
          />
        </div>
      </div>

      <div className="space-y-2">
        <ImageUpload
          value={imagePreview || undefined}
          onChange={(file) => {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setValue('image', file, { shouldValidate: true });
          }}
          onRemove={() => {
            setImageFile(null);
            setImagePreview(null);
            setValue('image', undefined, { shouldValidate: true });
          }}
          error={tError(errors?.image?.message as string | undefined)}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          className="flex-1 h-12 rounded-xl font-black shadow-lg shadow-primary/20 "
          type="submit"
          isLoading={createMutation.isPending || updateMutation.isPending}
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {tCommon('save')}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-xl px-6 font-bold"
          onClick={onCancel}
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {tCommon('cancel')}
        </Button>
      </div>
    </form>
  );
}
