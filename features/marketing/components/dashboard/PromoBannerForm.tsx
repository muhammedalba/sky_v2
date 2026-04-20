'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { useCreatePromoBanner, useUpdatePromoBanner } from '@/hooks/api/usePromoBanner';
import { PromoBanner } from '@/types';
import { useTranslations } from 'next-intl';
import { PromoBannerFormValues, promoBannerSchema } from '@/lib/validations/schemas';


interface PromoBannerFormProps {
  editingPromoBanner: PromoBanner | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PromoBannerForm({ editingPromoBanner, onSuccess, onCancel }: PromoBannerFormProps) {
  const t = useTranslations('navigation.promoBanners');
  const tCommon = useTranslations('buttons');
  const createMutation = useCreatePromoBanner();
  const updateMutation = useUpdatePromoBanner();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<PromoBannerFormValues>({
    resolver: zodResolver(promoBannerSchema),
    defaultValues: {
      textEn: (editingPromoBanner?.text && typeof editingPromoBanner.text === 'object') ? (editingPromoBanner.text as { en: string }).en : (typeof editingPromoBanner?.text === 'string' ? editingPromoBanner.text : ''),
      textAr: (editingPromoBanner?.text && typeof editingPromoBanner.text === 'object') ? (editingPromoBanner.text as { ar: string }).ar : '',
      link: editingPromoBanner?.link || '',
      isActive: editingPromoBanner?.isActive ?? true,
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
      } else {
        await createMutation.mutateAsync(payload);
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
            {t('fields.text') || 'Banner Text'} (English)
          </label>
          <Input 
            {...register('textEn')} 
            placeholder="🎉 Free Shipping on orders over $50!" 
            className={`h-12 rounded-xl bg-secondary/10 border-none focus-visible:ring-primary/20 font-bold ${errors.textEn ? 'ring-2 ring-red-500' : ''}`}
          />
          {errors.textEn && <p className="text-red-500 text-xs mt-1">{errors.textEn.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
            {t('fields.text') || 'Banner Text'} (Arabic)
          </label>
          <Input 
            {...register('textAr')} 
            placeholder="🎉 شحن مجاني للطلبات فوق 50 دولار!"
            dir="rtl"
            className={`h-12 rounded-xl bg-secondary/10 border-none focus-visible:ring-primary/20 font-bold ${errors.textAr ? 'ring-2 ring-red-500' : ''}`}
          />
          {errors.textAr && <p className="text-red-500 text-xs mt-1">{errors.textAr.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
          {t('fields.link') || 'Link URL'} (optional)
        </label>
        <Input 
          {...register('link')} 
          placeholder="https://example.com/sale" 
          type="url"
          className="h-12 rounded-xl bg-secondary/10 border-none focus-visible:ring-primary/20 font-bold"
        />
        {errors.link && <p className="text-red-500 text-xs mt-1">{errors.link.message}</p>}
      </div>

      <div className="flex items-center gap-3 bg-secondary/10 p-4 rounded-xl border-none">
        <input 
          type="checkbox" 
          {...register('isActive')} 
          id="isActive"
          className="w-5 h-5 rounded-lg border-none bg-background text-primary focus:ring-primary/20 cursor-pointer"
        />
        <label htmlFor="isActive" className="text-sm font-bold text-muted-foreground cursor-pointer select-none">
          {t('fields.active') || 'Active (Show on website)'}
        </label>
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
