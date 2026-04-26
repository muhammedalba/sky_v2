'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { useCreateCarousel, useUpdateCarousel } from '@/features/marketing/hooks/useCarousel';
import { useState } from 'react';
import ImageUpload from '@/shared/ui/form/ImageUpload';
import { Carousel } from '@/types';
import { useTranslations } from 'next-intl';
import { CarouselFormValues, carouselSchema } from '@/features/marketing/marketing.schema';



interface CarouselFormProps {
  editingCarousel: Carousel | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CarouselForm({ editingCarousel, onSuccess, onCancel }: CarouselFormProps) {
  const t = useTranslations('carousel');
  const tCommon = useTranslations('buttons');
  const createMutation = useCreateCarousel();
  const updateMutation = useUpdateCarousel();
  
  const [imageLg, setImageLg] = useState<File | null>(null);
  const [imageMd, setImageMd] = useState<File | null>(null);
  const [imageSm, setImageSm] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors }
  } = useForm<CarouselFormValues>({
    resolver: zodResolver(carouselSchema),
    defaultValues: {
      descriptionEn: (editingCarousel?.description && typeof editingCarousel.description === 'object') ? (editingCarousel.description as { en: string }).en : (typeof editingCarousel?.description === 'string' ? editingCarousel.description : ''),
      descriptionAr: (editingCarousel?.description && typeof editingCarousel.description === 'object') ? (editingCarousel.description as { ar: string }).ar : '',
      carouselLg: editingCarousel?.carouselLg || '',
      carouselMd: editingCarousel?.carouselMd || '',
      carouselSm: editingCarousel?.carouselSm || '',
    },
  });

  const onSubmit = async (data: CarouselFormValues) => {
    const formData = new FormData();
    
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
      if (editingCarousel) {
        await updateMutation.mutateAsync({ id: editingCarousel._id, data: formData });
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
            Description (English)
          </label>
          <Input 
            {...register('descriptionEn')} 
            placeholder="e.g. Featured Summer Sale" 
            className="h-12 rounded-xl bg-secondary/10 border-none focus-visible:ring-primary/20 font-bold"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
            الوصف (العربية)
          </label>
          <Input 
            {...register('descriptionAr')} 
            placeholder="مثال: تخفيضات الصيف المميزة" 
            dir="rtl" 
            className="h-12 rounded-xl bg-secondary/10 border-none focus-visible:ring-primary/20 font-bold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
            Large (Desktop)
          </label>
          <ImageUpload
            value={imageLg ? URL.createObjectURL(imageLg) : ((getValues('carouselLg') && typeof getValues('carouselLg') === 'string') ? getValues('carouselLg') as string : '')}
            onChange={(file) => setImageLg(file)}
            onRemove={() => {
              setImageLg(null);
              setValue('carouselLg', null);
            }}
            className="bg-secondary/10 p-2 rounded-2xl border-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
            Medium (Tablet)
          </label>
          <ImageUpload
            value={imageMd ? URL.createObjectURL(imageMd) : ((getValues('carouselMd') && typeof getValues('carouselMd') === 'string') ? getValues('carouselMd') as string : '')}
            onChange={(file) => setImageMd(file)}
            onRemove={() => {
              setImageMd(null);
              setValue('carouselMd', null);
            }}
            className="bg-secondary/10 p-2 rounded-2xl border-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
            Small (Mobile)
          </label>
          <ImageUpload
            value={imageSm ? URL.createObjectURL(imageSm) : ((getValues('carouselSm') && typeof getValues('carouselSm') === 'string') ? getValues('carouselSm') as string : '')}
            onChange={(file) => setImageSm(file)}
            onRemove={() => {
              setImageSm(null);
              setValue('carouselSm', null);
            }}
            className="bg-secondary/10 p-2 rounded-2xl border-none"
          />
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
