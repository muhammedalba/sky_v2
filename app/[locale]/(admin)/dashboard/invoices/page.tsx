import { getTranslations } from 'next-intl/server';
import InvoicesPage from '@/features/invoices/components/InvoicesPage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'invoices' });
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <InvoicesPage />
    </div>
  );
}
