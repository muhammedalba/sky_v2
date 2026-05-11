'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Icons } from '@/shared/ui/Icons';
import { SettingsInput } from '../../settings.schema';

export default function SEOSection() {
  const t = useTranslations('settings');
  const { register, formState: { errors } } = useFormContext<SettingsInput>();

  return (
    <Card className="border-border/50 shadow-xs rounded-3xl overflow-hidden">
      <CardHeader className="bg-muted/20 border-b border-border/50">
        <CardTitle className="text-xl flex items-center gap-2 title-gradient">
          <Icons.Search className="w-5 h-5 text-info" /> {t('seo.title')}
        </CardTitle>
        <CardDescription>{t('seo.desc')}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              {...register('metaTitle.ar')}
              label="Meta Title (AR)"
              error={errors.metaTitle?.ar?.message}
              className="rounded-xl h-11"
            />
            <Input
              {...register('metaTitle.en')}
              label="Meta Title (EN)"
              error={errors.metaTitle?.en?.message}
              className="rounded-xl h-11"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Textarea
              {...register('metaDescription.ar')}
              label="Meta Description (AR)"
              error={errors.metaDescription?.ar?.message}
              className="rounded-xl min-h-[100px]"
            />
            <Textarea
              {...register('metaDescription.en')}
              label="Meta Description (EN)"
              error={errors.metaDescription?.en?.message}
              className="rounded-xl min-h-[100px]"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-border/50">
          <div className="flex items-center gap-4 p-4 border border-border/50 rounded-2xl bg-muted/5">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Icons.Target className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <Input
                {...register('googleAnalyticsId')}
                label={t('seo.googleAnalytics')}
                placeholder="UA-XXXXXXXXX-X or G-XXXXXXXXXX"
                error={errors.googleAnalyticsId?.message}
                className="rounded-xl h-11"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
