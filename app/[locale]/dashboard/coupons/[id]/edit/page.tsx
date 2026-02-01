'use client';

import { use } from 'react';
import CouponForm from '@/components/dashboard/forms/CouponForm';
import { useCoupon } from '@/hooks/api/useCoupons';
import { Skeleton } from '@/components/ui/Skeleton';

export default function EditCouponPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params);
  const { data: coupon, isLoading } = useCoupon(id);

  if (isLoading) return <Skeleton className="h-[400px] w-full max-w-2xl mx-auto rounded-xl" />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Edit Coupon</h1>
      {coupon && <CouponForm locale={locale} initialData={coupon} />}
    </div>
  );
}
