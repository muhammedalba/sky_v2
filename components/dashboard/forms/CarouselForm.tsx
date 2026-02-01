'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useCreateCarousel, useUpdateCarousel } from '@/hooks/api/useCarousel';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ImageUpload from '@/components/ui/form/ImageUpload';
import { Carousel } from '@/types';

const carouselSchema = z.object({
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  carouselLg: z.union([z.string(), z.instanceof(File), z.null()]).optional(),
  carouselMd: z.union([z.string(), z.instanceof(File), z.null()]).optional(),
  carouselSm: z.union([z.string(), z.instanceof(File), z.null()]).optional(),
});

type CarouselFormValues = z.infer<typeof carouselSchema>;

interface CarouselFormProps {
  initialData?: Carousel;
  locale: string;
}

export default function CarouselForm({ initialData, locale }: CarouselFormProps) {
  const router = useRouter();
  const createMutation = useCreateCarousel();
  const updateMutation = useUpdateCarousel();
  
  const [imageLg, setImageLg] = useState<File | null>(null);
  const [imageMd, setImageMd] = useState<File | null>(null);
  const [imageSm, setImageSm] = useState<File | null>(null);

  const form = useForm<CarouselFormValues>({
    resolver: zodResolver(carouselSchema),
    defaultValues: {
      descriptionEn: (initialData?.description && typeof initialData.description === 'object') ? (initialData.description as { en: string }).en : (typeof initialData?.description === 'string' ? initialData.description : ''),
      descriptionAr: (initialData?.description && typeof initialData.description === 'object') ? (initialData.description as { ar: string }).ar : '',
      carouselLg: initialData?.carouselLg || '',
      carouselMd: initialData?.carouselMd || '',
      carouselSm: initialData?.carouselSm || '',
    },
  });

  const onSubmit = async (data: CarouselFormValues) => {
    const formData = new FormData();
    
    // Only send description if at least one language is provided
    if (data.descriptionEn || data.descriptionAr) {
      const descriptionObject = {
        en: data.descriptionEn || '',
        ar: data.descriptionAr || '',
      };
      formData.append('description', JSON.stringify(descriptionObject));
    }
    
    if (imageLg) formData.append('carouselLg', imageLg);
    if (imageMd) formData.append('carouselMd', imageMd);
    if (imageSm) formData.append('carouselSm', imageSm);

    try {
      if (initialData) {
        await updateMutation.mutateAsync({ id: initialData._id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      router.push(`/${locale}/dashboard/carousel`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Description (English - optional)</label>
            <Input {...form.register('descriptionEn')} placeholder="Featured Summer Sale" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description (Arabic - optional)</label>
            <Input {...form.register('descriptionAr')} placeholder="تخفيضات الصيف المميزة" dir="rtl" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Large (Desktop)</label>
            <ImageUpload
              value={imageLg ? URL.createObjectURL(imageLg) : ((form.getValues('carouselLg') && typeof form.getValues('carouselLg') === 'string') ? form.getValues('carouselLg') as string : '')}
              onChange={(file) => setImageLg(file)}
              onRemove={() => {
                setImageLg(null);
                form.setValue('carouselLg', null);
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Medium (Tablet)</label>
            <ImageUpload
              value={imageMd ? URL.createObjectURL(imageMd) : ((form.getValues('carouselMd') && typeof form.getValues('carouselMd') === 'string') ? form.getValues('carouselMd') as string : '')}
              onChange={(file) => setImageMd(file)}
              onRemove={() => {
                setImageMd(null);
                form.setValue('carouselMd', null);
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Small (Mobile)</label>
            <ImageUpload
              value={imageSm ? URL.createObjectURL(imageSm) : ((form.getValues('carouselSm') && typeof form.getValues('carouselSm') === 'string') ? form.getValues('carouselSm') as string : '')}
              onChange={(file) => setImageSm(file)}
              onRemove={() => {
                setImageSm(null);
                form.setValue('carouselSm', null);
              }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
            {initialData ? 'Update Slide' : 'Create Slide'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
