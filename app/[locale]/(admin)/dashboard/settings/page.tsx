import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import SettingsForm from '@/features/settings/components/SettingsForm';
import SettingsLoadingSkeleton from '@/features/settings/components/SettingsLoadingSkeleton';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'settings' });
  return {
    title: t('title'),
    description: t('desc'),
  };
}

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<SettingsLoadingSkeleton />}>
        <SettingsForm />
      </Suspense>
    </div>
  );
}
