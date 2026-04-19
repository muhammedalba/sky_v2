'use client';

import { use } from 'react';
import CreateProductForm from '@/components/dashboard/products/CreateProductForm';

export default function CreateProductPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);

  return <CreateProductForm locale={locale} />;
}
