'use client';

import { UseFormRegister } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Switch } from '@/shared/ui/Switch';
import { SettingsIcon } from "@/shared/ui/Icons";

interface ProductStatusPanelProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;

  defaultValues?: {
    isUnlimitedStock?: boolean;
    isFeatured?: boolean;
    isActive?: boolean;
  };
}

/**
 * Shared "Status Settings" card — isUnlimitedStock, isFeatured, isActive toggles.
 * Used in both CreateProductForm and EditProductForm.
 */
export function ProductStatusPanel({ register, defaultValues }: ProductStatusPanelProps) {
  const t = useTranslations('products.form');

  return (
    <div className="rounded-xl border border-border/50 bg-card space-y-5">
      <div className="bg-accent/60 rounded-t-lg p-4 flex items-center gap-2 border-b border-border/40 pb-4">
        <SettingsIcon className="w-5 h-5 text-muted-foreground" />
        <div>
          <h3 className="font-bold text-sm title-gradient">{t('statusSettings')}</h3>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <Switch
          {...register('isUnlimitedStock')}
          label={t('unlimitedStock')}
          defaultChecked={defaultValues?.isUnlimitedStock}
        />
        <div className="h-px bg-border/50 w-full" />
        <Switch
          {...register('isFeatured')}
          label={t('featured')}
          description={t('featuredDesc')}
          defaultChecked={defaultValues?.isFeatured}
        />
        <div className="h-px bg-border/50 w-full" />
        <Switch
          {...register('isActive')}
          label={t('disabled')}
          description={t('disabledDesc')}
          defaultChecked={defaultValues?.isActive}
        />
      </div>
    </div>
  );
}
