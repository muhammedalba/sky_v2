'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateBrand, useUpdateBrand } from '@/hooks/api/useBrands';
import { useState } from 'react';
import ImageUpload from '@/components/ui/form/ImageUpload';
import { Brand } from '@/types';
import { useTranslations } from 'next-intl';

const brandSchema = z.object({
  nameEn: z.string().min(2, 'English name is required'),
  nameAr: z.string().min(2, 'Arabic name is required'),
  image: z.union([z.string(), z.instanceof(File), z.null()]).optional(),
});

type BrandFormValues = z.infer<typeof brandSchema>;

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

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors }
  } = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      nameEn: (editingBrand?.name && typeof editingBrand.name === 'object') ? (editingBrand.name as { en?: string }).en || '' : (typeof editingBrand?.name === 'string' ? editingBrand.name : ''),
      nameAr: (editingBrand?.name && typeof editingBrand.name === 'object') ? (editingBrand.name as { ar?: string }).ar || '' : '',
      image: editingBrand?.image || '',
    },
  });

  const onSubmit = async (data: BrandFormValues) => {
    const formData = new FormData();
    
    // Send name as nested object with ar/en
    const nameObject = {
      en: data.nameEn,
      ar: data.nameAr,
    };
    formData.append('name', JSON.stringify(nameObject));
    
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
            {...register('nameEn')} 
            placeholder="e.g. Apple" 
            className={`h-12 rounded-xl bg-secondary/10 border-none focus-visible:ring-primary/20 font-bold ${errors.nameEn ? 'ring-2 ring-red-500' : ''}`}
          />
          {errors.nameEn && (
            <p className="text-red-500 text-xs mt-1">{errors.nameEn.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
            {t('fields.name')} (Arabic)
          </label>
          <Input 
            {...register('nameAr')} 
            placeholder="مثال: أبل" 
            dir="rtl" 
            className={`h-12 rounded-xl bg-secondary/10 border-none focus-visible:ring-primary/20 font-bold ${errors.nameAr ? 'ring-2 ring-red-500' : ''}`}
          />
          {errors.nameAr && (
            <p className="text-red-500 text-xs mt-1">{errors.nameAr.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
          {t('fields.image')}
        </label>
        <ImageUpload
          value={imageFile ? URL.createObjectURL(imageFile) : ((getValues('image') && typeof getValues('image') === 'string') ? getValues('image') as string : '')}
          onChange={(file) => setImageFile(file)}
          onRemove={() => {
            setImageFile(null);
            setValue('image', '');
          }}
          className="bg-secondary/10 p-4 rounded-2xl border-none"
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
          >
            {tCommon('cancel')}
          </Button>
      </div>
    </form>
  );
}
