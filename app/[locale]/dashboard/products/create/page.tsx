'use client';

import { use } from 'react';
import CreateProductForm from '@/features/products/components/dashboard/CreateProductForm';

export default function CreateProductPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);

  return <CreateProductForm locale={locale} />;
}
