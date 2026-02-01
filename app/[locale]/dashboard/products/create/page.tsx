'use client';

import { use } from 'react';
import ProductForm from '@/components/dashboard/forms/ProductForm';

export default function CreateProductPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);

  return <ProductForm locale={locale} />;
}
