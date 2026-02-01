'use client';

import { use } from 'react';
import ProductForm from '@/components/dashboard/forms/ProductForm';
import { useProduct } from '@/hooks/api/useProducts';
import { Skeleton } from '@/components/ui/Skeleton';

export default function EditProductPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params);
  const { data: product, isLoading } = useProduct(id);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <Skeleton className="h-12 w-1/3 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="lg:col-span-2 h-[400px] rounded-2xl" />
          <Skeleton className="h-[300px] rounded-2xl" />
        </div>
      </div>
    );
  }

  return <ProductForm locale={locale} initialData={product} />;
}
