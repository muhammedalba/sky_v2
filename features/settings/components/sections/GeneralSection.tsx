'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useFormContext, useWatch } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import ImageUpload from '@/shared/ui/form/ImageUpload';
import { Icons } from '@/shared/ui/Icons';
import { Select } from '@/shared/ui/Select';
import { SettingsInput } from '../../settings.schema';

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
  { code: 'SAR', symbol: 'ر.س', label: 'Saudi Riyal (ر.س)' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham (د.إ)' },
  { code: 'KWD', symbol: 'د.ك', label: 'Kuwaiti Dinar (د.ك)' },
  { code: 'QAR', symbol: 'ر.ق', label: 'Qatari Rial (ر.ق)' },
  { code: 'BHD', symbol: '.د.ب', label: 'Bahraini Dinar (.د.ب)' },
  { code: 'OMR', symbol: 'ر.ع.', label: 'Omani Rial (ر.ع.)' },
  { code: 'EGP', symbol: 'ج.م', label: 'Egyptian Pound (ج.م)' },
  { code: 'JOD', symbol: 'د.أ', label: 'Jordanian Dinar (د.أ)' },
  { code: 'IQD', symbol: 'ع.د', label: 'Iraqi Dinar (ع.د)' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (£)' },
  { code: 'TRY', symbol: '₺', label: 'Turkish Lira (₺)' },
  { code: 'MAD', symbol: 'د.م.', label: 'Moroccan Dirham (د.م.)' },
  { code: 'DZD', symbol: 'د.ج', label: 'Algerian Dinar (د.ج)' },
  { code: 'TND', symbol: 'د.ت', label: 'Tunisian Dinar (د.ت)' },
  { code: 'LYD', symbol: 'ل.د', label: 'Libyan Dinar (ل.د)' },
  { code: 'YER', symbol: 'ر.ي', label: 'Yemeni Rial (ر.ي)' },
  { code: 'LBP', symbol: 'ل.ل', label: 'Lebanese Pound (ل.ل)' },
];

export default function GeneralSection() {
  const t = useTranslations('settings');
  const { register, setValue, control, formState: { errors } } = useFormContext<SettingsInput>();
  
  const currencyOptions = useMemo(() => 
    CURRENCIES.map(c => ({ value: c.code, label: c.label })),
  []);

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const selected = CURRENCIES.find(c => c.code === code);
    if (selected) {
      setValue('currencySymbol', selected.symbol, { shouldDirty: true, shouldValidate: true });
    }
  };

  const { onChange: onCurrencyCodeChange, ...currencyCodeReg } = register('currencyCode');

  const logoValue = useWatch({ control, name: 'logo' });
  const faviconValue = useWatch({ control, name: 'favicon' });

  const imagePreview = useMemo(() => {
    if (logoValue instanceof File) return URL.createObjectURL(logoValue);
    return logoValue || null;
  }, [logoValue]);

  const faviconPreview = useMemo(() => {
    if (faviconValue instanceof File) return URL.createObjectURL(faviconValue);
    return faviconValue || null;
  }, [faviconValue]);

  return (
    <Card className="border-border/50 shadow-xs rounded-3xl overflow-hidden">
      <CardHeader className="bg-muted/20 border-b border-border/50">
        <CardTitle className="text-xl flex items-center gap-2 title-gradient">
          <Icons.Dashboard className="w-5 h-5 text-primary" /> {t('general.title')}
        </CardTitle>
        <CardDescription>{t('general.desc')}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        {/* Basic Info */}
        <div className="space-y-4">
          <h4 className="font-bold text-sm flex items-center gap-2">
            <Icons.Dashboard className="w-4 h-4 text-primary" /> {t('general.info')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Input
                {...register('siteName.ar')}
                label={t('general.storeName') + ' (العربية)'}
                error={errors.siteName?.ar?.message}
                className="rounded-xl h-11"
              />
              <Input
                {...register('siteName.en')}
                label={t('general.storeName') + ' (English)'}
                error={errors.siteName?.en?.message}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-4">
              <Textarea
                {...register('siteDescription.ar')}
                label={t('general.storeDesc') + ' (العربية)'}
                error={errors.siteDescription?.ar?.message}
                className="rounded-xl min-h-[100px]"
              />
              <Textarea
                {...register('siteDescription.en')}
                label={t('general.storeDesc') + ' (English)'}
                error={errors.siteDescription?.en?.message}
                className="rounded-xl min-h-[100px]"
              />
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="pt-6 border-t border-border/50 space-y-4">
          <h4 className="font-bold text-sm flex items-center gap-2">
            <Icons.Dashboard className="w-4 h-4 text-primary" /> {t('general.branding')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <span className="text-sm font-medium">{t('general.logoTitle')}</span>
              <p className="text-xs text-muted-foreground">{t('general.logoDesc')}</p>
              <ImageUpload
                value={imagePreview || null}
                onChange={(file) => {
                  setValue('logo', file, { shouldValidate: true });
                }}
                onRemove={() => {
                  setValue('logo', null, { shouldValidate: true });
                }}
                error={errors.logo?.message as string}
              />
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium">{t('general.faviconTitle')}</span>
              <p className="text-xs text-muted-foreground">{t('general.faviconDesc')}</p>
              <ImageUpload
                value={faviconPreview || null}
                onChange={(file) => {
                  setValue('favicon', file, { shouldValidate: true });
                }}
                onRemove={() => {
                  setValue('favicon', null, { shouldValidate: true });
                }}
                error={errors.favicon?.message as string}
              />
            </div>
          </div>
        </div>

        {/* Currency */}
        <div className="pt-6 border-t border-border/50 space-y-4">
          <h4 className="font-bold text-sm flex items-center gap-2">
            <Icons.RefreshCw className="w-4 h-4 text-primary" /> {t('general.currency')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Select
              {...currencyCodeReg}
              onChange={(e) => {
                onCurrencyCodeChange(e);
                handleCurrencyChange(e);
              }}
              options={currencyOptions}
              label={t('general.currencyCode')}
              error={errors.currencyCode?.message}
              className="rounded-xl h-11"
              icon={Icons.Globe}
            />
            <Input
              {...register('currencySymbol')}
              label={t('general.currencySymbol')}
              error={errors.currencySymbol?.message}
              className="rounded-xl h-11"
              icon={Icons.Tag}
            />
            <Input
              {...register('exchangeRate')}
              type="number"
              step="0.01"
              label={t('general.exchangeRate')}
              error={errors.exchangeRate?.message}
              className="rounded-xl h-11"
              icon={Icons.DollarSign}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
