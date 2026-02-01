'use client';

import { use } from 'react';
import CouponForm from '@/components/dashboard/forms/CouponForm';

export default function CreateCouponPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Create Coupon</h1>
      <CouponForm locale={locale} />
    </div>
  );
}
