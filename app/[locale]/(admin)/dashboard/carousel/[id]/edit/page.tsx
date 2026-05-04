'use client';

import { useParams } from 'next/navigation';
import CarouselForm from '@/features/marketing/components/dashboard/CarouselForm';
import { useCarouselItem } from '@/features/marketing/hooks/useCarousel';
import { Skeleton } from '@/shared/ui/Skeleton';

export default function EditCarouselPage() {
  const { id } = useParams();
  const { data: carousel, isLoading } = useCarouselItem(id as string, { all_langs: true });
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="h-16 w-full bg-muted/20 animate-pulse rounded-2xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <CarouselForm 
        initialData={carousel}
      />
    </div>
  );
}
