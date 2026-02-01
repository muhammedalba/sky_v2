'use client';

import { use } from 'react';
import SubCategoryForm from '@/components/dashboard/forms/SubCategoryForm';
import { useSubCategory } from '@/hooks/api/useSubCategories';
import { Skeleton } from '@/components/ui/Skeleton';

export default function EditSubCategoryPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params);
  const { data: subCategory, isLoading } = useSubCategory(id);

  if (isLoading) return <Skeleton className="h-[400px] w-full max-w-2xl mx-auto rounded-xl" />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Edit Sub-Category</h1>
      {subCategory && <SubCategoryForm locale={locale} initialData={subCategory} />}
    </div>
  );
}
