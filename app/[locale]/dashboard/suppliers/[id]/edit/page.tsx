'use client';

import { use } from 'react';
import SupplierForm from '@/components/dashboard/forms/SupplierForm';
import { useSupplier } from '@/hooks/api/useSuppliers';
import { Skeleton } from '@/components/ui/Skeleton';

export default function EditSupplierPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params);
  const { data: supplier, isLoading } = useSupplier(id, { allLangs: true });

  if (isLoading) return <Skeleton className="h-[400px] w-full max-w-2xl mx-auto rounded-xl" />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Edit Supplier</h1>
      {supplier && <SupplierForm locale={locale} initialData={supplier} />}
    </div>
  );
}
