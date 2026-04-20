'use client';

import { use } from 'react';
import SupplierForm from '@/features/suppliers/components/dashboard/SupplierForm';

export default function CreateSupplierPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Add Supplier</h1>
      <SupplierForm locale={locale} />
    </div>
  );
}
