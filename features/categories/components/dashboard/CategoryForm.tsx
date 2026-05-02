'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Category } from '@/types';
import { categorySchema, type CategoryInput } from '@/features/categories/category.schema';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { useCreateCategory, useUpdateCategory } from '@/features/categories/hooks/useCategories';
import { useToast } from '@/shared/hooks/useToast';
import ImageUpload from '@/shared/ui/form/ImageUpload';
import { Icons } from '@/shared/ui/Icons';

interface CategoryFormProps {
  editingCategory: Category | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CategoryForm({ editingCategory, onSuccess, onCancel }: CategoryFormProps) {
  const t = useTranslations('categories');
  const tCommon = useTranslations('buttons');
  const tErrors = useTranslations('errors');
  const toast = useToast();


  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const [imagePreview, setImagePreview] = useState<string | null>(editingCategory?.image || null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const tError = (msg?: string) => (msg ? (msg.startsWith('validation.') ? t(msg) : msg) : undefined);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: {
        en: editingCategory
          ? (typeof editingCategory.name === 'string' ? editingCategory.name : editingCategory.name?.en ?? '')
          : '',
        ar: editingCategory
          ? (typeof editingCategory.name === 'string' ? editingCategory.name : editingCategory.name?.ar ?? '')
          : '',
      },
      image: editingCategory?.image || '',
    },
  });

  const onSubmit = async (data: CategoryInput) => {
    const formData = new FormData();
    formData.append('name[en]', data.name.en);
    formData.append('name[ar]', data.name.ar);
    if (imageFile) formData.append('image', imageFile);

    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({ id: editingCategory._id, data: formData });
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
      <div className="space-y-2">
        <Input
          showAiAction
          aiActionTooltip={t('aiTranslateImprove')}
          icon={Icons.Edit}
          label={t('fields.name') + (' (English)')}
          {...register('name.en')}
          error={errors.name?.en ? tErrors('required') : undefined}
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
          error={errors.name?.ar ? tErrors('required') : undefined}
          disabled={createMutation.isPending || updateMutation.isPending}
        />

      </div>
      <div className="space-y-4">
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
          className="flex-1 h-12 rounded-xl font-black shadow-lg shadow-primary/20"
          type="submit"
          isLoading={createMutation.isPending || updateMutation.isPending}
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
