'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { useCreateCarousel, useUpdateCarousel } from '@/features/marketing/hooks/useCarousel';
import { useState, useMemo } from 'react';
import ImageUpload from '@/shared/ui/form/ImageUpload';
import { Carousel } from '@/types';
import { useTranslations, useLocale } from 'next-intl';
import { CarouselFormValues, carouselSchema } from '@/features/marketing/marketing.schema';
import { Icons } from '@/shared/ui/Icons';
import { Switch } from '@/shared/ui/Switch';
import FormStickyHeader from '@/shared/ui/dashboard/FormStickyHeader';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useToast } from '@/shared/hooks/useToast';
import { Textarea } from '@/shared/ui/Textarea';

interface CarouselFormProps {
  initialData?: Carousel | null;

}

export default function CarouselForm({ initialData }: CarouselFormProps) {
  // handle language
  const locale = useLocale();
  // global translations
  const t = useTranslations('carousel');
  const tButtons = useTranslations('common.buttons');
  // hooks
  const router = useRouter();
  const toast = useToast();
  // react query mutations
  const createMutation = useCreateCarousel();
  const updateMutation = useUpdateCarousel();
  // handle image upload
  const [imageLg, setImageLg] = useState<File | null>(null);
  const [imageMd, setImageMd] = useState<File | null>(null);
  const [imageSm, setImageSm] = useState<File | null>(null);
  // handle image preview
  const [previewLg, setImagePreviewLg] = useState<string | null>(initialData?.carouselLg || null);
  const [previewMd, setImagePreviewMd] = useState<string | null>(initialData?.carouselMd || null);
  const [previewSm, setImagePreviewSm] = useState<string | null>(initialData?.carouselSm || null);


  const formId = initialData ? 'edit-carousel-form' : 'create-carousel-form';

  const {
    register,
    handleSubmit,
    setValue,

    watch,
    formState: { errors }
  } = useForm<CarouselFormValues>({
    resolver: zodResolver(carouselSchema),
    defaultValues: {
      descriptionEn: (initialData?.description && typeof initialData.description === 'object') ? (initialData.description as { en: string }).en : (typeof initialData?.description === 'string' ? initialData.description : ''),
      descriptionAr: (initialData?.description && typeof initialData.description === 'object') ? (initialData.description as { ar: string }).ar : (typeof initialData?.description === 'string' ? initialData.description : ''),
      isActive: initialData?.isActive ?? true,
      carouselLg: initialData?.carouselLg || '',
      carouselMd: initialData?.carouselMd || '',
      carouselSm: initialData?.carouselSm || '',
    },
  });

  const isActive = watch('isActive');

  const onSubmit = async (data: CarouselFormValues) => {
    const formData = new FormData();

    formData.append('description[en]', data.descriptionEn || '');
    formData.append('description[ar]', data.descriptionAr || '');
    formData.append('isActive', String(data.isActive));

    if (imageLg) formData.append('carouselLg', imageLg);
    if (imageMd) formData.append('carouselMd', imageMd);
    if (imageSm) formData.append('carouselSm', imageSm);

    try {
      if (initialData) {
        await updateMutation.mutateAsync({ id: initialData._id, data: formData });
        // redirect to carousel page
        router.push(`/${locale}/dashboard/carousel`);
        toast.success(t('messages.updateSuccess'));
      } else {
        await createMutation.mutateAsync(formData);
        // redirect to carousel page
        router.push(`/${locale}/dashboard/carousel`);
        toast.success(t('messages.addSuccess'));
      }
    } catch (error) {
      console.error(error);
      toast.error(t('messages.error'));
    }
  };

  const backUrl = `/${locale}/dashboard/carousel`;

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <FormStickyHeader
        title={initialData ? t('editSlide') : t('addSlide')}
        subtitle={t('subtitle')}
        cancelLabel={tButtons('cancel')}
        saveLabel={tButtons('save')}
        formId={formId}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        backUrl={backUrl}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Text Content Section */}
          <div className="bg-background/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-border/40 shadow-sm space-y-8">
            <div className="flex items-center gap-4 border-b border-border/40 pb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icons.Edit className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {t('fields.basicInfo') || 'Slide Content'}
                </h3>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight">
                  {t('fields.basicInfoDescription')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Textarea
                  {...register('descriptionEn')}
                  label={t('fields.descriptionEn')}
                  placeholder={t('fields.descriptionPlaceholder')}
                  className="h-24 bg-background/50 border-border/40 focus:bg-background transition-all "

                  error={errors.descriptionEn?.message}
                />
              </div>

              <div className="space-y-2">
                <Textarea
                  {...register('descriptionAr')}
                  label={t('fields.descriptionAr')}
                  placeholder={t('fields.descriptionPlaceholder')}
                  dir="rtl"
                  className="h-24 bg-background/50 border-border/40 focus:bg-background transition-all "
                  error={errors.descriptionAr?.message}
                />
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="bg-background/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-border/40 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Icons.Shield className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {t('fields.status') || 'Visibility'}
                  </h3>
                </div>
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors",
                isActive
                  ? "bg-success/10 text-success border border-success/20"
                  : "bg-destructive/10 text-destructive border border-destructive/20"
              )}>
                {isActive ? t('fields.active') : t('fields.inactive')}
              </div>
            </div>

            <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border/40">
              <Switch
                checked={isActive}
                onChange={(e) => setValue('isActive', e.target.checked)}
              />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {isActive ? t('fields.active') : t('fields.inactive')}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                  {t('fields.statusDescription')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Media Section */}
        <div className="space-y-6">
          <div className="bg-background/50 backdrop-blur-sm p-6 rounded-2xl border border-border/40 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-border/40 pb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Icons.Carousel className="w-4 h-4 text-purple-500" />
              </div>
              <h3 className="font-bold text-foreground">
                {t('fields.image') || 'Slide Images'}
              </h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  {t('fields.large')}
                </label>
                <ImageUpload
                  value={previewLg || undefined}
                  onChange={(file) => {
                    setImageLg(file);
                    setImagePreviewLg(URL.createObjectURL(file));
                    setValue('carouselLg', file, { shouldValidate: true });
                  }}
                  onRemove={() => {
                    setImageLg(null);
                    setImagePreviewLg(null);
                    setValue('carouselLg', '', { shouldValidate: true });
                  }}
                  className="bg-muted/30 p-2 rounded-2xl border border-border/40 "
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  {t('fields.medium')}
                </label>
                <ImageUpload
                  value={previewMd || undefined}
                  onChange={(file) => {
                    setImageMd(file);
                    setImagePreviewMd(URL.createObjectURL(file));
                    setValue('carouselMd', file, { shouldValidate: true });
                  }}
                  onRemove={() => {
                    setImageMd(null);
                    setImagePreviewMd(null);
                    setValue('carouselMd', '', { shouldValidate: true });
                  }}
                  className="bg-muted/30 p-2 rounded-2xl border border-border/40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  {t('fields.small')}
                </label>
                <ImageUpload
                  value={previewSm || undefined}
                  onChange={(file) => {
                    setImageSm(file);
                    setImagePreviewSm(URL.createObjectURL(file));
                    setValue('carouselSm', file, { shouldValidate: true });
                  }}
                  onRemove={() => {
                    setImageSm(null);
                    setImagePreviewSm(null);
                    setValue('carouselSm', '', { shouldValidate: true });
                  }}
                  className="bg-muted/30 p-2 rounded-2xl border border-border/40"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
