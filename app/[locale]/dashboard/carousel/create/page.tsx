'use client';

import { use } from 'react';
import CarouselForm from '@/components/dashboard/forms/CarouselForm';

export default function CreateCarouselPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Add Carousel Slide</h1>
      <CarouselForm locale={locale} />
    </div>
  );
}
