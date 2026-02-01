'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useCreateBrand, useUpdateBrand } from '@/hooks/api/useBrands';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import ImageUpload from '@/components/ui/form/ImageUpload';
import { Brand } from '@/types';
import { useTranslations } from 'next-intl';

const brandSchema = z.object({
  nameEn: z.string().min(2, 'English name is required'),
  nameAr: z.string().min(2, 'Arabic name is required'),
  image: z.any().optional(), // File or string URL
});

type BrandFormValues = z.infer<typeof brandSchema>;

interface BrandFormProps {
  initialData?: Brand;
  locale: string;
}

export default function BrandForm({ initialData, locale }: BrandFormProps) {
  const router = useRouter();
  const createMutation = useCreateBrand();
  const updateMutation = useUpdateBrand();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      nameEn: (initialData?.name && typeof initialData.name === 'object') ? (initialData.name as any).en || '' : (typeof initialData?.name === 'string' ? initialData.name : ''),
      nameAr: (initialData?.name && typeof initialData.name === 'object') ? (initialData.name as any).ar || '' : '',
      image: initialData?.image || '',
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
      if (initialData) {
        await updateMutation.mutateAsync({ id: initialData._id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      router.push(`/${locale}/dashboard/brands`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name (English)</label>
            <Input {...form.register('nameEn')} placeholder="Brand Name" />
            {form.formState.errors.nameEn && (
              <p className="text-red-500 text-sm">{form.formState.errors.nameEn.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Name (Arabic)</label>
            <Input {...form.register('nameAr')} placeholder="اسم العلامة التجارية" dir="rtl" />
            {form.formState.errors.nameAr && (
              <p className="text-red-500 text-sm">{form.formState.errors.nameAr.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Logo</label>
          <ImageUpload
            value={imageFile ? URL.createObjectURL(imageFile) : (typeof form.getValues('image') === 'string' ? form.getValues('image') : '')}
            onChange={(file) => setImageFile(file)}
            onRemove={() => {
              setImageFile(null);
              form.setValue('image', '');
            }}
          />
        </div>

        <div className="flex justify-end gap-4 pt-4">
           <Button 
             type="button" 
             variant="outline" 
             onClick={() => router.back()}
           >
             Cancel
           </Button>
           <Button 
             type="submit" 
             isLoading={createMutation.isPending || updateMutation.isPending}
           >
             {initialData ? 'Update Brand' : 'Create Brand'}
           </Button>
        </div>
      </form>
    </Card>
  );
}
