import { getTranslations } from 'next-intl/server';
import BackupsPage from '@/features/settings/components/backups/BackupsPage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'settings' });
  return {
    title: t('backup.page.title'),
    description: t('backup.page.subtitle'),
  };
}

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <BackupsPage />
    </div>
  );
}
