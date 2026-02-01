'use client';

import { use } from 'react';
import PromoBannerForm from '@/components/dashboard/forms/PromoBannerForm';

export default function CreatePromoBannerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Add Promo Banner</h1>
      <PromoBannerForm locale={locale} />
    </div>
  );
}
