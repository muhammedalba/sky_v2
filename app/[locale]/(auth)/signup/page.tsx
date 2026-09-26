import { getTranslations, setRequestLocale } from 'next-intl/server';
import SignUpForm from '@/features/auth/components/SignUpForm';
import AuthPageLayout from '@/features/auth/components/AuthPageLayout';
import {
  AuthFooter,
  AuthHeader,
  AuthMobileLogo,
} from '@/features/auth/components/AuthSharedComponents';

// Metadata generation for SEO
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });

  return {
    title: t('signupTitle'),
    description: t('signupDescription'),
    // Utility page — no SEO value, and indexing it is actively undesirable.
    robots: { index: false, follow: false },
  };
}

export default async function SignupPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'auth' });

  return (
    <AuthPageLayout
      type="signup"
      locale={locale}
      bgColors={{
        top: 'bg-gradient-to-br from-success/20 to-success/5',
        bottom: 'bg-gradient-to-tl from-info/20 to-info/5'
      }}
      shadowColor="shadow-success/5"
    >
      {/* Static parts render on the server; SignUpForm holds only the interactive form */}
      <div className="w-full space-y-6">
        <AuthMobileLogo subtitle={t('constructionPortal')} className="lg:hidden" />
        <AuthHeader title={t('createAccount')} description={t('signupDescription')} />
        <SignUpForm />
        <AuthFooter text={t('alreadyHaveAccount')} linkText={t('loginLink')} linkHref="/login" />
      </div>
    </AuthPageLayout>
  );
}


