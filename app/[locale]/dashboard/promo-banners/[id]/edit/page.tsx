'use client';

import { use } from 'react';
import PromoBannerForm from '@/features/marketing/components/dashboard/PromoBannerForm';
import { usePromoBanner } from '@/hooks/api/usePromoBanner';
import { Skeleton } from '@/shared/ui/Skeleton';
import { useRouter } from 'next/navigation';

export default function EditPromoBannerPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params);
  const { data: banner, isLoading } = usePromoBanner(id, { all_langs: true });

  const router = useRouter();

  if (isLoading) return <Skeleton className="h-[400px] w-full max-w-2xl mx-auto rounded-xl" />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Edit Promo Banner</h1>
      {banner && (
        <PromoBannerForm 
          editingPromoBanner={banner} 
          onSuccess={() => router.push(`/${locale}/dashboard/promo-banners`)}
          onCancel={() => router.push(`/${locale}/dashboard/promo-banners`)}
        />
      )}
    </div>
  );
}
