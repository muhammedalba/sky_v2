'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Switch } from '@/shared/ui/Switch';
import { useCreatePromoBanner, useUpdatePromoBanner } from '@/features/marketing/hooks/usePromoBanner';
import { PromoBanner } from '@/types';
import { useTranslations } from 'next-intl';
import { PromoBannerFormValues, promoBannerSchema } from '@/features/marketing/marketing.schema';
import { useToast } from '@/shared/hooks/useToast';
import { cn } from '@/lib/utils';
import { Textarea } from '@/shared/ui/Textarea';


interface PromoBannerFormProps {
  editingPromoBanner: PromoBanner | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PromoBannerForm({ editingPromoBanner, onSuccess, onCancel }: PromoBannerFormProps) {
  const t = useTranslations('promoBanners');
  const tCommon = useTranslations('buttons');
  const createMutation = useCreatePromoBanner();
  const updateMutation = useUpdatePromoBanner();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<PromoBannerFormValues>({
    resolver: zodResolver(promoBannerSchema),
    defaultValues: {
      textEn: (editingPromoBanner?.text && typeof editingPromoBanner.text === 'object') ? (editingPromoBanner.text as { en: string }).en : (typeof editingPromoBanner?.text === 'string' ? editingPromoBanner.text : ''),
      textAr: (editingPromoBanner?.text && typeof editingPromoBanner.text === 'object') ? (editingPromoBanner.text as { ar: string }).ar : '',
      link: editingPromoBanner?.link || '',
      isActive: editingPromoBanner?.isActive ?? false,
    },
  });

  const onSubmit = async (data: PromoBannerFormValues) => {
    const payload = {
      text: {
        en: data.textEn,
        ar: data.textAr,
      },
      link: data.link || undefined,
      isActive: data.isActive,
    };

    try {
      if (editingPromoBanner) {
        await updateMutation.mutateAsync({ id: editingPromoBanner._id, data: payload });
        toast.success(t('messages.updateSuccess'));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t('messages.createSuccess'));
      }
      onSuccess();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || t('messages.error');
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Textarea
            {...register('textEn')}
            label={t('fields.text') + ' (English)'}
            placeholder={t('fields.textPlaceholder')}
            dir='ltr'
            error={errors.textEn?.message}
          />
        </div>
        <div className="space-y-2">
          <Textarea
            {...register('textAr')}
            label={t('fields.text') + ' (Arabic)'}
            placeholder={t('fields.textPlaceholder')}
            dir="rtl"
            error={errors.textAr?.message}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Input
          {...register('link')}
          label={t('fields.link') || 'Link URL'}
          placeholder={t('fields.linkPlaceholder')}
          type="url"
          error={errors.link?.message}
        />
      </div>

      <div className="flex items-center justify-between bg-secondary/5 p-5 rounded-2xl border border-border/40 transition-all hover:bg-secondary/10 group">
        <div className="flex flex-col gap-0.5">
          <label htmlFor="isActive" className="text-sm font-black text-foreground cursor-pointer select-none group-hover:text-primary transition-colors">
            {t('fields.active') || 'Active (Show on website)'}
          </label>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
             {t('fields.activeStatus') || 'Visibility Status'}
          </p>
        </div>
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <Switch
              id="isActive"
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
          )}
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
