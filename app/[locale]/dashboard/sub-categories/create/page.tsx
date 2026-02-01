'use client';

import { use } from 'react';
import SubCategoryForm from '@/components/dashboard/forms/SubCategoryForm';

export default function CreateSubCategoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Create Sub-Category</h1>
      <SubCategoryForm locale={locale} />
    </div>
  );
}
