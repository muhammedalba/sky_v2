'use client';

import { use } from 'react';
import CouponForm from '@/features/marketing/components/dashboard/CouponForm';
import { useCoupon } from '@/features/marketing/hooks/useCoupons';
import { Skeleton } from '@/shared/ui/Skeleton';
import { useRouter } from 'next/navigation';

export default function EditCouponPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params);
  const { data: coupon, isLoading } = useCoupon(id, { allLangs: true });
  const router = useRouter();

  if (isLoading) return <Skeleton className="h-[400px] w-full max-w-2xl mx-auto rounded-xl" />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Edit Coupon</h1>
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
