'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import CouponForm from '@/features/marketing/components/dashboard/CouponForm';
import { useCoupon } from '@/features/marketing/hooks/useCoupons';
import { Skeleton } from '@/shared/ui/Skeleton';
import EntityPageHeader from '@/shared/ui/dashboard/EntityPageHeader';
import { Icons } from '@/shared/ui/Icons';

export default function EditCouponPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params);
  const router = useRouter();
  const t = useTranslations('coupons');
  const { data: coupon, isLoading } = useCoupon(id, { allLangs: true });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-24 bg-muted/40 rounded-2xl border border-border/20" />
        <Skeleton className="h-[500px] w-full max-w-4xl mx-auto rounded-2xl shadow-sm" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <EntityPageHeader
        title={t('editCoupon')}
        subtitle={coupon?.name}
        action={{
          label: t('couponList'),
          icon: <Icons.Coupons className="w-4 h-4" />,
          onClick: () => router.push(`/${locale}/dashboard/coupons`),
          className: "bg-muted text-foreground hover:bg-muted/80 shadow-none border border-border/40"
        }}
      />

      {coupon && (
        <CouponForm 
          initialData={coupon} 
          onSuccess={() => router.push(`/${locale}/dashboard/coupons`)}
          onCancel={() => router.push(`/${locale}/dashboard/coupons`)}
        />
      )}
    </div>
  );
}
