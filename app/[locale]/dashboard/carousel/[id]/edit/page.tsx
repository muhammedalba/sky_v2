'use client';

import { use } from 'react';
import CarouselForm from '@/components/dashboard/forms/CarouselForm';
import { useCarouselItem } from '@/hooks/api/useCarousel';
import { Skeleton } from '@/components/ui/Skeleton';

export default function EditCarouselPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params);
  const { data: carousel, isLoading } = useCarouselItem(id);

  if (isLoading) return <Skeleton className="h-[400px] w-full max-w-4xl mx-auto rounded-xl" />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Edit Carousel Slide</h1>
      {carousel && <CarouselForm locale={locale} initialData={carousel} />}
    </div>
  );
}
