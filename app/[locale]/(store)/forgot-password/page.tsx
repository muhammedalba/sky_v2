import { getTranslations } from 'next-intl/server';
import ForgotPasswordFlow from '@/features/auth/components/ForgotPasswordFlow';
import AuthPageLayout from '@/features/auth/components/AuthPageLayout';

// Metadata generation for SEO
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });

  return {
    title: t('forgotPasswordTitle'),
    description: t('forgotPasswordDescription'),
  };
}

export default async function ForgotPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <AuthPageLayout
      type="forgot-password"
      locale={locale}
      bgColors={{
        top: 'bg-gradient-to-br from-primary/20 to-primary/5',
        bottom: 'bg-gradient-to-tl from-primary/20 to-info/5'
      }}
      shadowColor="shadow-primary/5"
    >
      <ForgotPasswordFlow locale={locale} />
    </AuthPageLayout>
  );
}


