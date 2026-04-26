import { getTranslations } from 'next-intl/server';
import LoginForm from '@/features/auth/components/LoginForm';
import AuthPageLayout from '@/features/auth/components/AuthPageLayout';

// Metadata generation for SEO
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });

  return {
    title: t('loginTitle'),
    description: t('loginDescription'),
  };
}

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <AuthPageLayout
      type="login"
      locale={locale}
      bgColors={{
        top: 'bg-gradient-to-br from-blue-500/10 to-indigo-500/5',
        bottom: 'bg-gradient-to-tl from-primary-500/10 to-purple-500/5'
      }}
    >
      <LoginForm locale={locale} />
    </AuthPageLayout>
  );
}

