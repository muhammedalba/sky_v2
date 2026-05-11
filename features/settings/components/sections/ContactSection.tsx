'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Icons } from '@/shared/ui/Icons';
import { SettingsInput } from '../../settings.schema';

export default function ContactSection() {
  const t = useTranslations('settings');
  const { register, formState: { errors } } = useFormContext<SettingsInput>();

  return (
    <Card className="border-border/50 shadow-xs rounded-3xl overflow-hidden">
      <CardHeader className="bg-muted/20 border-b border-border/50">
        <CardTitle className="text-xl flex items-center gap-2 title-gradient">
          <Icons.MessageCircle className="w-5 h-5 text-success" /> {t('contact.title')}
        </CardTitle>
        <CardDescription>{t('contact.desc')}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            {...register('contactInfo.email')}
            label="Email"
            icon={Icons.Mail}
            error={errors.contactInfo?.email?.message}
            className="rounded-xl h-11"
          />
          <Input
            {...register('contactInfo.phones.0')}
            label="Phone"
            icon={Icons.MessageCircle}
            error={errors.contactInfo?.phones?.[0]?.message}
            className="rounded-xl h-11"
          />
          <div className="md:col-span-2 space-y-4">
            <h4 className="font-bold text-sm">{t('contact.address')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textarea
                {...register('contactInfo.addressAr')}
                label="العنوان (بالعربية)"
                className="rounded-xl min-h-[80px]"
              />
              <Textarea
                {...register('contactInfo.addressEn')}
                label="Address (English)"
                className="rounded-xl min-h-[80px]"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
