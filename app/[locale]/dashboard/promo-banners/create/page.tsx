'use client';

import { use } from 'react';
import PromoBannerForm from '@/features/marketing/components/dashboard/PromoBannerForm';

import { useRouter } from 'next/navigation';

export default function CreatePromoBannerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const router = useRouter();

  const handleFinish = () => {
    router.push(`/${locale}/dashboard/promo-banners`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Add Promo Banner</h1>
      <PromoBannerForm 
        editingPromoBanner={null}
        onSuccess={handleFinish}
        onCancel={handleFinish}
      />
    </div>
  );
}
