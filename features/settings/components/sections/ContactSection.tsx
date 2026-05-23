'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { MailIcon, MessageCircleIcon } from "@/shared/ui/Icons";
import { SettingsInput } from '../../settings.schema';

export default function ContactSection() {
  const t = useTranslations('settings');
  const { register, formState: { errors } } = useFormContext<SettingsInput>();

  return (
    <Card className="border-border/50 shadow-xs rounded-3xl overflow-hidden">
      <CardHeader className="bg-muted/20 border-b border-border/50">
        <CardTitle className="text-xl flex items-center gap-2 title-gradient">
          <MessageCircleIcon className="w-5 h-5 text-success" /> {t('contact.title')}
        </CardTitle>
        <CardDescription>{t('contact.desc')}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            {...register('contactInfo.email')}
            label="Email"
            icon={MailIcon}
            error={errors.contactInfo?.email?.message}
            className="rounded-xl h-11"
          />
          <Input
            {...register('contactInfo.phones.0')}
            label="Phone"
            icon={MessageCircleIcon}
            error={errors.contactInfo?.phones?.[0]?.message}
            className="rounded-xl h-11"
          />
          <div className="md:col-span-2 space-y-4">
            <h4 className="font-bold text-sm">{t('contact.address')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textarea
                {...register('contactInfo.address.ar')}
                label="العنوان (بالعربية)"
                className="rounded-xl min-h-[80px]"
              />
              <Textarea
                {...register('contactInfo.address.en')}
                label="Address (English)"
                className="rounded-xl min-h-[80px]"
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h4 className="font-bold text-sm">{t('contact.workingDays') || 'Working Days'}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                {...register('contactInfo.workingDays.ar')}
                label="أيام العمل (بالعربية)"
                className="rounded-xl h-11"
                placeholder="مثال: من الإثنين إلى الجمعة"
              />
              <Input
                {...register('contactInfo.workingDays.en')}
                label="Working Days (English)"
                className="rounded-xl h-11"
                placeholder="Example: Monday - Friday"
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h4 className="font-bold text-sm">{t('contact.workingHours') || 'Working Hours'}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                {...register('contactInfo.workingHours.ar')}
                label="ساعات العمل (بالعربية)"
                className="rounded-xl h-11"
                placeholder="مثال: 09:00 ص - 06:00 م"
              />
              <Input
                {...register('contactInfo.workingHours.en')}
                label="Working Hours (English)"
                className="rounded-xl h-11"
                placeholder="Example: 09:00 AM - 06:00 PM"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
