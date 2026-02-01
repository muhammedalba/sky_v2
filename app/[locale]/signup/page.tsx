import { use } from 'react';
import SignUpForm from '@/components/auth/SignUpForm';
import LoginBranding from '@/components/auth/LoginBranding';
import StoreNavbar from '@/components/layout/StoreNavbar';
import { getTranslations } from 'next-intl/server';

// Metadata generation for SEO
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });

  return {
    title: t('signupTitle'),
    description: t('signupDescription'),
  };
}

export default function SignupPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background font-sans selection:bg-primary/20">
      <StoreNavbar />
      <LoginBranding />
      <SignUpForm locale={locale} />
    </main>
  );
}
