'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useCreatePromoBanner, useUpdatePromoBanner } from '@/hooks/api/usePromoBanner';
import { useRouter } from 'next/navigation';
import { PromoBanner } from '@/types';

const promoBannerSchema = z.object({
  textEn: z.string().min(5, 'English text is required (min 5 characters)'),
  textAr: z.string().min(5, 'Arabic text is required (min 5 characters)'),
  link: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean(),
});

type PromoBannerFormValues = z.infer<typeof promoBannerSchema>;

interface PromoBannerFormProps {
  initialData?: PromoBanner;
  locale: string;
}

export default function PromoBannerForm({ initialData, locale }: PromoBannerFormProps) {
  const router = useRouter();
  const createMutation = useCreatePromoBanner();
  const updateMutation = useUpdatePromoBanner();

  const form = useForm<PromoBannerFormValues>({
    resolver: zodResolver(promoBannerSchema),
    defaultValues: {
      textEn: (initialData?.text && typeof initialData.text === 'object') ? (initialData.text as { en: string }).en : (typeof initialData?.text === 'string' ? initialData.text : ''),
      textAr: (initialData?.text && typeof initialData.text === 'object') ? (initialData.text as { ar: string }).ar : '',
      link: initialData?.link || '',
      isActive: initialData?.isActive ?? true,
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
      if (initialData) {
        await updateMutation.mutateAsync({ id: initialData._id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      router.push(`/${locale}/dashboard/promo-banners`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Banner Text (English)</label>
            <Input 
              {...form.register('textEn')} 
              placeholder="🎉 Free Shipping on orders over $50!" 
            />
            {form.formState.errors.textEn && <p className="text-red-500 text-sm">{form.formState.errors.textEn.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Banner Text (Arabic)</label>
            <Input 
              {...form.register('textAr')} 
              placeholder="🎉 شحن مجاني للطلبات فوق 50 دولار!"
              dir="rtl"
            />
            {form.formState.errors.textAr && <p className="text-red-500 text-sm">{form.formState.errors.textAr.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Link URL (optional)</label>
          <Input 
            {...form.register('link')} 
            placeholder="https://example.com/sale" 
            type="url"
          />
          {form.formState.errors.link && <p className="text-red-500 text-sm">{form.formState.errors.link.message}</p>}
        </div>

        <div className="flex items-center gap-3">
          <input 
            type="checkbox" 
            {...form.register('isActive')} 
            className="w-4 h-4 rounded border-gray-300"
          />
          <label className="text-sm font-medium">Active (Show on website)</label>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
            {initialData ? 'Update Banner' : 'Create Banner'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
