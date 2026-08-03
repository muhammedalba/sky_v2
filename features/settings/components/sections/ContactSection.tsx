'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';
import { MailIcon, MessageCircleIcon, PhoneIcon, PlusIcon, TrashIcon } from "@/shared/ui/Icons";
import { SettingsInput } from '../../settings.schema';

const MAX_PHONES = 5;

export default function ContactSection() {
  const t = useTranslations('settings');
  const { register, watch, setValue, formState: { errors } } = useFormContext<SettingsInput>();

  const phones: string[] = watch('contactInfo.phones') ?? [''];

  const addPhone = () => {
    if (phones.length < MAX_PHONES) {
      setValue('contactInfo.phones', [...phones, ''], { shouldDirty: true });
    }
  };

  const removePhone = (index: number) => {
    const updated = phones.filter((_, i) => i !== index);
    setValue('contactInfo.phones', updated.length > 0 ? updated : [''], { shouldDirty: true });
  };

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

          {/* ── Dynamic phone fields ── */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm flex items-center gap-1.5">
                <PhoneIcon className="w-4 h-4 text-muted-foreground" />
                {t('contact.phones') || 'Phone Numbers'}
              </h4>
              {phones.length < MAX_PHONES && (
                <button
                  type="button"
                  onClick={addPhone}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded-lg hover:bg-primary/10"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  {t('contact.addPhone') || 'Add'}
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {phones.map((_, index) => (
                <div key={index} className="flex items-center gap-2 group">
                  <div className="flex-1">
                    <Input
                      {...register(`contactInfo.phones.${index}`)}
                      label={index === 0 ? (t('contact.phone') || 'Phone') : `${t('contact.phone') || 'Phone'} ${index + 1}`}
                      icon={PhoneIcon}
                      error={errors.contactInfo?.phones?.[index]?.message}
                      className="rounded-xl h-11"
                    />
                  </div>
                  {phones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePhone(index)}
                      className="mt-5 shrink-0 p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                      title="Remove phone"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {phones.length >= MAX_PHONES && (
              <p className="text-xs text-muted-foreground">
                {t('contact.maxPhones') || `Maximum ${MAX_PHONES} phone numbers`}
              </p>
            )}
          </div>


          <div className="md:col-span-2 space-y-4">
            <h4 className="font-bold text-sm">{t('contact.workingDays') || 'Working Days'}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                {...register('contactInfo.workingDays.ar')}
                label="أيام العمل (بالعربية)"
                className="rounded-xl h-11"
                placeholder="مثال: من الإثنين إلى الجمعة"
                error={errors.contactInfo?.workingDays?.ar?.message}
              />
              <Input
                {...register('contactInfo.workingDays.en')}
                label="Working Days (English)"
                className="rounded-xl h-11"
                placeholder="Example: Monday - Friday"
                error={errors.contactInfo?.workingDays?.en?.message}
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
                error={errors.contactInfo?.workingHours?.ar?.message}
              />
              <Input
                {...register('contactInfo.workingHours.en')}
                label="Working Hours (English)"
                className="rounded-xl h-11"
                placeholder="Example: 09:00 AM - 06:00 PM"
                error={errors.contactInfo?.workingHours?.en?.message}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
