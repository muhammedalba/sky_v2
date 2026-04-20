'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { useCreateBrand, useUpdateBrand } from '@/hooks/api/useBrands';
import { useState } from 'react';
import { Brand } from '@/types';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Icons } from '@/shared/ui/Icons';
import { BrandFormValues, brandSchema } from '@/lib/validations/schemas';


interface BrandFormProps {
  editingBrand: Brand | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BrandForm({ editingBrand, onSuccess, onCancel }: BrandFormProps) {
  const t = useTranslations('brands');
  const tCommon = useTranslations('buttons');
  const createMutation = useCreateBrand();
  const updateMutation = useUpdateBrand();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(editingBrand?.image||null);
console.log(editingBrand);

  const {
    register,
    handleSubmit,
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
      } else {
        await createMutation.mutateAsync(formData);
      }
      onSuccess();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
            {t('fields.name')} (English)
          </label>
          <Input
            {...register('name.en')}
            placeholder="e.g. Apple"
            className={`h-12 rounded-xl bg-secondary/10 border-none focus-visible:ring-primary/20 font-bold ${errors.name?.en ? 'ring-2 ring-red-500' : ''}`}
          />
          {errors.name?.en && (
            <p className="text-red-500 text-xs mt-1">{errors.name?.en.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
            {t('fields.name')} (Arabic)
          </label>
          <Input
            {...register('name.ar')}
            placeholder="مثال: أبل"
            dir="rtl"
            className={`h-12 rounded-xl bg-secondary/10 border-none focus-visible:ring-primary/20 font-bold ${errors.name?.ar ? 'ring-2 ring-red-500' : ''}`}
          />
          {errors.name?.ar && (
            <p className="text-red-500 text-xs mt-1">{errors.name?.ar.message}</p>
          )}
        </div>
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
              <Image width={50}  height={50} src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
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
