'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import CouponForm from '@/features/marketing/components/dashboard/CouponForm';
import EntityPageHeader from '@/shared/ui/dashboard/EntityPageHeader';
import { Icons } from '@/shared/ui/Icons';

export default function CreateCouponPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const router = useRouter();
  const t = useTranslations('coupons');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <EntityPageHeader
        title={t('createCoupon')}
        subtitle={t('subtitle')}
        action={{
          label: t('couponList'),
          icon: <Icons.Coupons className="w-4 h-4" />,
          onClick: () => router.push(`/${locale}/dashboard/coupons`),
          className: "bg-muted text-foreground hover:bg-muted/80 shadow-none border border-border/40"
        }}
      />
      
      <CouponForm 
        onSuccess={() => router.push(`/${locale}/dashboard/coupons`)}
        onCancel={() => router.push(`/${locale}/dashboard/coupons`)}
      />
    </div>
  );
}
