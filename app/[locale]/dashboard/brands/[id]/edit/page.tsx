'use client';

import { use } from 'react';
import BrandForm from '@/components/dashboard/forms/BrandForm';
import { useBrand } from '@/hooks/api/useBrands';
import { Skeleton } from '@/components/ui/Skeleton';

export default function EditBrandPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params);
  const { data: brand, isLoading } = useBrand(id);

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full max-w-2xl mx-auto rounded-xl" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Edit Brand</h1>
      </div>
      {brand && <BrandForm locale={locale} initialData={brand} />}
    </div>
  );
}
