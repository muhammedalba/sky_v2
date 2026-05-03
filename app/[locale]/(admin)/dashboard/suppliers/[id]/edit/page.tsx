'use client';

import { use } from 'react';
import SupplierForm from '@/features/suppliers/components/dashboard/SupplierForm';
import { useSupplier } from '@/features/suppliers/hooks/useSuppliers';
import { Skeleton } from '@/shared/ui/Skeleton';

export default function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: supplier, isLoading } = useSupplier(id, { allLangs: true });

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <Skeleton className="h-20 w-full rounded-3xl" />
        <Skeleton className="h-[500px] w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <>
      {supplier ?  (
        <SupplierForm
          editingSupplier={supplier}
          mode="edit"
        />
      ) : (
        <div className="text-center text-muted-foreground">
          not found
        </div>
      )}
    </>
  );
}
