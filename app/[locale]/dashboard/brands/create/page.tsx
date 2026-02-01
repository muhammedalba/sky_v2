'use client';

import { use } from 'react';
import BrandForm from '@/components/dashboard/forms/BrandForm';

export default function CreateBrandPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Create Brand</h1>
      </div>
      <BrandForm locale={locale} />
    </div>
  );
}
