'use client';

import { use } from 'react';
import CouponForm from '@/features/marketing/components/dashboard/CouponForm';
import { useCoupon } from '@/features/marketing/hooks/useCoupons';
import { Skeleton } from '@/shared/ui/Skeleton';

export default function EditCouponPage({ params }: { params: Promise<{  id: string }> }) {
  const { id } = use(params);
  const { data: coupon, isLoading } = useCoupon(id, { allLangs: true });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-24 bg-muted/40 rounded-2xl border border-border/20" />
        <Skeleton className="h-[500px] w-full max-w-4xl mx-auto rounded-2xl shadow-sm" />
      </div>
    );
  } else if (coupon) {
    return (
      <CouponForm
        initialData={coupon} />
    );
  }else{
    return(
      <div className="space-y-8 animate-pulse">
        <div className="h-24 bg-muted/40 rounded-2xl border border-border/20" />
       not found
      </div>
    );
  }


}
