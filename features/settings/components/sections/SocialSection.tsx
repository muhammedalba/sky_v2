'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';
import { Icons } from '@/shared/ui/Icons';
import { SettingsInput } from '../../settings.schema';

export default function SocialSection() {
  const t = useTranslations('settings');
  const { register, formState: { errors } } = useFormContext<SettingsInput>();

  return (
    <Card className="border-border/50 shadow-xs rounded-3xl overflow-hidden">
      <CardHeader className="bg-muted/20 border-b border-border/50">
        <CardTitle className="text-xl flex items-center gap-2 title-gradient">
          <Icons.Sun className="w-5 h-5 text-purple-500" /> {t('social.title')}
        </CardTitle>
        <CardDescription>{t('social.desc')}</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            {...register('socialLinks.facebook')}
            label="Facebook"
            icon={Icons.Facebook}
            error={errors.socialLinks?.facebook?.message}
            placeholder="https://facebook.com/your-store"
            className="rounded-xl h-11"
          />
          <Input
            {...register('socialLinks.instagram')}
            label="Instagram"
            icon={Icons.Sun}
            error={errors.socialLinks?.instagram?.message}
            placeholder="https://instagram.com/your-store"
            className="rounded-xl h-11"
          />
          <Input
            {...register('socialLinks.twitter')}
            label="X (Twitter)"
            icon={Icons.X}
            error={errors.socialLinks?.twitter?.message}
            placeholder="https://x.com/your-store"
            className="rounded-xl h-11"
          />
          <Input
            {...register('socialLinks.linkedin')}
            label="LinkedIn"
            icon={Icons.LinkedInBrand}
            error={errors.socialLinks?.linkedin?.message}
            placeholder="https://linkedin.com/company/your-store"
            className="rounded-xl h-11"
          />
          <Input
            {...register('socialLinks.youtube')}
            label="YouTube"
            icon={Icons.Youtube}
            error={errors.socialLinks?.youtube?.message}
            placeholder="https://youtube.com/c/your-store"
            className="rounded-xl h-11"
          />
          <Input
            {...register('socialLinks.tiktok')}
            label="TikTok"
            icon={Icons.TikTok}
            error={errors.socialLinks?.tiktok?.message}
            placeholder="https://tiktok.com/@your-store"
            className="rounded-xl h-11"
          />
          <Input
            {...register('socialLinks.whatsapp')}
            label="WhatsApp"
            icon={Icons.WhatsApp}
            error={errors.socialLinks?.whatsapp?.message}
            placeholder="9665XXXXXXXX"
            className="rounded-xl h-11"
          />
        </div>
      </CardContent>
    </Card>
  );
}
