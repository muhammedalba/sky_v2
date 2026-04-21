'use client';

import { use } from 'react';
import CouponForm from '@/features/marketing/components/dashboard/CouponForm';

import { useRouter } from 'next/navigation';

export default function CreateCouponPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const router = useRouter();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Create Coupon</h1>
      <CouponForm 
        onSuccess={() => router.push(`/${locale}/dashboard/coupons`)}
        onCancel={() => router.push(`/${locale}/dashboard/coupons`)}
      />
    </div>
  );
}
