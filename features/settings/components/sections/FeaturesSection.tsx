'use client';

import { useMemo } from 'react';


import { useTranslations } from 'next-intl';
import { useFormContext, useWatch } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import { Switch } from '@/shared/ui/Switch';
import { Icons } from '@/shared/ui/Icons';
import { SettingsInput } from '../../settings.schema';

export default function FeaturesSection() {
  const t = useTranslations('settings');
  const { setValue, control } = useFormContext<SettingsInput>();

  // Axis 2.1: Use useWatch for efficient re-renders of the features object
  const features = useWatch({ control, name: 'features' });

  const toggles = useMemo(() => [
    { 
      id: 'reviews', 
      name: t('features.reviews'), 
      desc: t('features.reviewsDesc'), 
      icon: Icons.Star, 
      value: features?.reviews 
    },
    { 
      id: 'coupons', 
      name: t('features.coupons'), 
      desc: t('features.couponsDesc'), 
      icon: Icons.Tag, 
      value: features?.coupons 
    },
    { 
      id: 'guestCheckout', 
      name: t('features.guestCheckout'), 
      desc: t('features.guestCheckoutDesc'), 
      icon: Icons.User, 
      value: features?.guestCheckout 
    },
    { 
      id: 'wishlist', 
      name: t('features.wishlist'), 
      desc: t('features.wishlistDesc'), 
      icon: Icons.Heart, 
      value: features?.wishlist 
    },
  ], [t, features]);

  return (
    <Card className="border-border/50 shadow-xs rounded-3xl overflow-hidden">
      <CardHeader className="bg-muted/20 border-b border-border/50">
        <CardTitle className="text-xl flex items-center gap-2 title-gradient">
          <Icons.Layout className="w-5 h-5 text-primary" /> {t('features.title')}
        </CardTitle>
        <CardDescription>{t('features.desc')}</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {toggles.map((toggle) => (
            <div
              key={toggle.id}
              className="flex items-center justify-between p-4 border border-border/50 rounded-2xl hover:bg-muted/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <toggle.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-medium text-sm">{toggle.name}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{toggle.desc}</p>
                </div>
              </div>
              <Switch
                checked={!!toggle.value}
                onCheckedChange={(checked) => setValue(`features.${toggle.id as keyof typeof features}` as any, checked, { shouldDirty: true })}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
