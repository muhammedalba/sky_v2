'use client';

import { useTranslations } from 'next-intl';
import { useFormContext, useWatch } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';
import { Switch } from '@/shared/ui/Switch';
import { Icons } from '@/shared/ui/Icons';
import { SettingsInput } from '../../settings.schema';

export default function ShippingSection() {
  const t = useTranslations('settings');
  const { register, setValue, control, formState: { errors } } = useFormContext<SettingsInput>();

  // Axis 2.1: useWatch for taxesIncluded
  const taxesIncluded = useWatch({ control, name: 'taxesIncluded' });

  return (
    <Card className="border-border/50 shadow-xs rounded-3xl overflow-hidden">
      <CardHeader className="bg-muted/20 border-b border-border/50">
        <CardTitle className="text-xl flex items-center gap-2 title-gradient">
          <Icons.Truck className="w-5 h-5 text-primary" /> {t('shipping.title')}
        </CardTitle>
        <CardDescription>{t('shipping.desc')}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            {...register('freeShippingThreshold', { valueAsNumber: true })}
            type="number"
            label={t('shipping.freeThreshold')}
            icon={Icons.Truck}
            error={errors.freeShippingThreshold?.message}
            className="rounded-xl h-11"
          />
          <Input
            {...register('vatRate', { valueAsNumber: true })}
            type="number"
            label={t('shipping.vatRate')}
            icon={Icons.Orders}
            error={errors.vatRate?.message}
            className="rounded-xl h-11"
          />
        </div>

        <div className="pt-6 border-t border-border/50">
          <div className="flex items-center justify-between p-4 border border-border/50 rounded-2xl bg-muted/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icons.Orders className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">{t('shipping.taxesIncluded')}</p>
                <p className="text-xs text-muted-foreground">{t('shipping.taxesIncludedDesc')}</p>
              </div>
            </div>
            <Switch
              checked={!!taxesIncluded}
              onCheckedChange={(checked) => setValue('taxesIncluded', checked, { shouldDirty: true })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
