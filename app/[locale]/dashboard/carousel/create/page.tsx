'use client';

import { use } from 'react';
import CarouselForm from '@/features/marketing/components/dashboard/CarouselForm';

import { useRouter } from 'next/navigation';

export default function CreateCarouselPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const router = useRouter();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Add Carousel Slide</h1>
      <CarouselForm 
        editingCarousel={null}
        onSuccess={() => router.push(`/${locale}/dashboard/carousel`)}
        onCancel={() => router.push(`/${locale}/dashboard/carousel`)}
      />
    </div>
  );
}
