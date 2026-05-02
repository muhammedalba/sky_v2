'use client';

import { UseFormRegister } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Icons } from '@/shared/ui/Icons';
import { useState } from 'react';

function TagsInputField({
  label,
  value = [],
  onChange,
  error,
  placeholder,
  dir,
}: {
  label: string;
  value: string[];
  onChange: (val: string[]) => void;
  error?: string;
  placeholder?: string;
  dir?: 'ltr' | 'rtl';
}) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (trimmed && !value.includes(trimmed)) {
        onChange([...value, trimmed]);
        setInputValue('');
      }
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-2">
      <Input
        label={label}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        dir={dir}
        error={error}
        className="h-11 rounded-xl"
        icon={Icons.Plus}
        iconColor="text-blue-500"
      />
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {value.map((tag, index) => (
            <div
              key={index}
              className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold flex items-center gap-2"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
              >
                <Icons.X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ProductBasicInfoProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  errors?: {
    title?: { en?: { message?: string }; ar?: { message?: string } };
    description?: { en?: { message?: string }; ar?: { message?: string } };
    uses?: { en?: { message?: string }; ar?: { message?: string } };
  };
  tError: (msg?: string) => string | undefined;
  watch?: any;
  setValue?: any;
}

/**
 * Shared "Basic Information" card — title (EN/AR) + description (EN/AR).
 * Used in both CreateProductForm and EditProductForm.
 */
export function ProductBasicInfo({ register, errors, tError, watch, setValue }: ProductBasicInfoProps) {
  const t = useTranslations('products.form');
  
  const usesEn = watch?.('uses.en') || [];
  const usesAr = watch?.('uses.ar') || [];

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
            className="rounded-xl min-h-[100px]"
            showAiAction
            aiActionTooltip={t('aiTranslateImprove')}
          />
        </div>
        
        {/* Uses / الاستخدامات */}
        {watch && setValue && (
          <>
            <div className="space-y-2 lg:col-span-1">
              <TagsInputField
                label={t('usesEn') || 'Uses (English)'}
                value={usesEn}
                onChange={(val) => setValue('uses.en', val, { shouldValidate: true })}
                error={tError(errors?.uses?.en?.message)}
                placeholder="Press Enter to add"
              />
            </div>
            <div className="space-y-2 lg:col-span-1">
              <TagsInputField
                label={t('usesAr') || 'الاستخدامات (عربي)'}
                value={usesAr}
                onChange={(val) => setValue('uses.ar', val, { shouldValidate: true })}
                error={tError(errors?.uses?.ar?.message)}
                placeholder="اضغط Enter للإضافة"
                dir="rtl"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
