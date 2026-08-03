'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';
import { MapPinIcon } from "@/shared/ui/Icons";
import { SettingsInput } from '../../settings.schema';

export default function BusinessAddressSection() {
  const t = useTranslations('settings');
  const { register, formState: { errors } } = useFormContext<SettingsInput>();

  return (
    <Card className="border-border/50 shadow-xs rounded-3xl overflow-hidden mt-6">
      <CardHeader className="bg-muted/20 border-b border-border/50">
        <CardTitle className="text-xl flex items-center gap-2 title-gradient">
          <MapPinIcon className="w-5 h-5 text-primary" /> {t('contact.businessAddress')}
        </CardTitle>
        <CardDescription>{t('contact.businessAddressDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Country (Arabic & English) */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="font-bold text-sm">{t('contact.country')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                {...register('businessAddress.country.ar')}
                label={t('contact.countryAr')}
                className="rounded-xl h-11"
                error={errors.businessAddress?.country?.ar?.message}
              />
              <Input
                {...register('businessAddress.country.en')}
                label={t('contact.countryEn')}
                className="rounded-xl h-11"
                error={errors.businessAddress?.country?.en?.message}
              />
            </div>
          </div>

          {/* City (Arabic & English) */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="font-bold text-sm">{t('contact.city')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                {...register('businessAddress.city.ar')}
                label={t('contact.cityAr')}
                className="rounded-xl h-11"
                error={errors.businessAddress?.city?.ar?.message}
              />
              <Input
                {...register('businessAddress.city.en')}
                label={t('contact.cityEn')}
                className="rounded-xl h-11"
                error={errors.businessAddress?.city?.en?.message}
              />
            </div>
          </div>

          {/* Area / District (Arabic & English) */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="font-bold text-sm">{t('contact.area')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                {...register('businessAddress.area.ar')}
                label={t('contact.areaAr')}
                className="rounded-xl h-11"
                error={errors.businessAddress?.area?.ar?.message}
              />
              <Input
                {...register('businessAddress.area.en')}
                label={t('contact.areaEn')}
                className="rounded-xl h-11"
                error={errors.businessAddress?.area?.en?.message}
              />
            </div>
          </div>

          {/* Street (Arabic & English) */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="font-bold text-sm">{t('contact.street')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                {...register('businessAddress.street.ar')}
                label={t('contact.streetAr')}
                className="rounded-xl h-11"
                error={errors.businessAddress?.street?.ar?.message}
              />
              <Input
                {...register('businessAddress.street.en')}
                label={t('contact.streetEn')}
                className="rounded-xl h-11"
                error={errors.businessAddress?.street?.en?.message}
              />
            </div>
          </div>

          {/* MailBox & PoBox */}
          <Input
            {...register('businessAddress.mailBox')}
            label={t('contact.mailBox')}
            className="rounded-xl h-11"
            error={errors.businessAddress?.mailBox?.message}
          />
          <Input
            {...register('businessAddress.poBox')}
            label={t('contact.poBox')}
            className="rounded-xl h-11"
            error={errors.businessAddress?.poBox?.message}
          />

          {/* VAT No & CR No */}
          <Input
            {...register('businessAddress.vatNo')}
            label={t('contact.vatNo')}
            className="rounded-xl h-11"
            error={errors.businessAddress?.vatNo?.message}
          />
          <Input
            {...register('businessAddress.crNo')}
            label={t('contact.crNo')}
            className="rounded-xl h-11"
            error={errors.businessAddress?.crNo?.message}
          />
        </div>
      </CardContent>
    </Card>
  );
}
