'use client';

import { UseFormRegister } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Icons } from '@/shared/ui/Icons';

interface ProductBasicInfoProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  errors?: {
    title?: { en?: { message?: string }; ar?: { message?: string } };
    description?: { en?: { message?: string }; ar?: { message?: string } };
  };
  tError: (msg?: string) => string | undefined;
}

/**
 * Shared "Basic Information" card — title (EN/AR) + description (EN/AR).
 * Used in both CreateProductForm and EditProductForm.
 */
export function ProductBasicInfo({ register, errors, tError }: ProductBasicInfoProps) {
  const t = useTranslations('products.form');

  return (
    <div className="rounded-xl border border-border/40 bg-card shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-2 border-b border-border/40 pb-4">
        <Icons.Edit className="w-5 h-5 text-muted-foreground" />
        <div>
          <h3 className="font-bold text-sm">{t('basicInformation')}</h3>
          <p className="text-xs text-muted-foreground">{t('basicDesc')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Input
            icon={Icons.Edit}
            iconColor="text-blue-500"
            error={tError(errors?.title?.en?.message)}
            {...register('title.en')}
            label={t('titleEn')}
            className="h-11 rounded-xl"
            showAiAction
            aiActionTooltip={t('aiTranslateImprove')}
          />
        </div>
        <div className="space-y-2">
          <Input
            icon={Icons.Edit}
            iconColor="text-blue-500"
            error={tError(errors?.title?.ar?.message)}
            {...register('title.ar')}
            label={t('titleAr')}
            dir="rtl"
            className="h-11 rounded-xl"
            showAiAction
            aiActionTooltip={t('aiTranslateImprove')}
          />
        </div>
        <div className="space-y-2 lg:col-span-2">
          <Textarea
            icon={Icons.Edit}
            iconColor="text-indigo-500"
            {...register('description.en')}
            error={tError(errors?.description?.en?.message)}
            label={t('descEn')}
            className="rounded-xl min-h-[100px]"
            showAiAction
            aiActionTooltip={t('aiTranslateImprove')}
          />
        </div>
        <div className="space-y-2 lg:col-span-2">
          <Textarea
            icon={Icons.Edit}
            iconColor="text-indigo-500"
            {...register('description.ar')}
            error={tError(errors?.description?.ar?.message)}
            label={t('descAr')}
            dir="rtl"
            className="rounded-xl min-h-[100px]"
            showAiAction
            aiActionTooltip={t('aiTranslateImprove')}
          />
        </div>
      </div>
    </div>
  );
}
