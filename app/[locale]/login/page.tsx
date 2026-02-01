import { use } from 'react';
import { getTranslations } from 'next-intl/server';
import LoginBranding from '@/components/auth/LoginBranding';
import LoginForm from '@/components/auth/LoginForm';

// Metadata generation for SEO
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });

  return {
    title: t('loginTitle'),
    description: t('loginDescription'),
  };
}

import StoreNavbar from '@/components/layout/StoreNavbar';

export default function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background font-sans selection:bg-primary/20">
      <StoreNavbar />
      <LoginBranding />
      <LoginForm locale={locale} />
    </main>
  );
}
