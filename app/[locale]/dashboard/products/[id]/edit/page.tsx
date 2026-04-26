'use client';

import { use } from 'react';
import EditProductForm from '@/features/products/components/dashboard/EditProductForm';
import { useProduct } from '@/features/products/hooks/useProducts';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Product, ProductVariant } from '@/types';

export default function EditProductPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params);
  const { data: productRes, isLoading } = useProduct(id, { all_langs: true });

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

  if (!productRes) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground font-medium">Product not found</p>
      </div>
    );
  }

  const product = productRes as Product;
  const variants = product.variants || [];

  return (
    <EditProductForm
      locale={locale}
      initialData={product}
      initialVariants={variants}
    />
  );
}
