'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Category } from '@/types';
import { categorySchema, type CategoryInput } from '@/features/categories/category.schema';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Icons } from '@/shared/ui/Icons';
import { useCreateCategory, useUpdateCategory } from '@/features/categories/hooks/useCategories';
import { useToast } from '@/shared/hooks/useToast';
import Image from 'next/image';

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

  const [imagePreview, setImagePreview] = useState<string | null>(editingCategory?.image||null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: {
        en: editingCategory ? (typeof editingCategory.name === 'string' ? editingCategory.name : editingCategory.name?.en || '') : '',
        ar: editingCategory ? (typeof editingCategory.name === 'string' ? editingCategory.name : editingCategory.name?.ar || '') : '',
      },
      image: editingCategory?.image || '',
    },
  });

  const onSubmit = async (data: CategoryInput) => {
    try {
      const formData = new FormData();
      formData.append('name[en]', data.name.en);
      formData.append('name[ar]', data.name.ar);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editingCategory) {
        await updateMutation.mutateAsync({ id: editingCategory._id, data: formData });
        toast.success(t('messages.updateSuccess'));
      } else {
        await createMutation.mutateAsync(formData);
        toast.success(t('messages.createSuccess'));
      }
      onSuccess();
    } catch (error) {
      const errorMessage = (error as any)?.response?.data?.message || 'Failed to save category';
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
          {t('fields.name')} (English)
        </label>
        <Input
          placeholder="e.g. Electronics"
          className={`h-12 rounded-xl bg-secondary/10 border-none focus-visible:ring-primary/20 font-bold ${errors.name?.en ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          {...register('name.en')}
        />
        {errors.name?.en && <div className="text-destructive text-xs mt-1">{tErrors('required')}</div>}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
          {t('fields.name')} (Arabic)
        </label>
        <Input
          placeholder="مثال: إلكترونيات"
          className={`h-12 rounded-xl bg-secondary/10 border-none focus-visible:ring-primary/20 font-bold ${errors.name?.ar ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          {...register('name.ar')}
        />
        {errors.name?.ar && <div className="text-destructive text-xs mt-1">{tErrors('required')}</div>}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
          {t('fields.image')}
        </label>
        <div className="space-y-3">
          <Input
            type="file"
            accept="image/*"
            className="h-12 rounded-xl bg-secondary/10 border-none focus-visible:ring-primary/20 font-bold file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setImageFile(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                  setImagePreview(reader.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
           
          />
          {(imagePreview )&& (
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-border/40 shadow-md">
              <Image width={50}  height={50}  src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setImageFile(null);
                }}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1.5 hover:bg-destructive/90 transition-colors shadow-lg"
              >
                <Icons.X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
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
        >
          {tCommon('cancel')}
        </Button>
      </div>
    </form>
  );
}
