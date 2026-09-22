import { getTranslations } from 'next-intl/server';
import SignUpForm from '@/features/auth/components/SignUpForm';
import AuthPageLayout from '@/features/auth/components/AuthPageLayout';
import MaintenanceGuard from '@/components/MaintenanceGuard';
import { getMaintenanceState } from '@/lib/maintenance';

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
  const { isMaintenance, canBypassMaintenance } = await getMaintenanceState();

  return (
    <MaintenanceGuard isMaintenance={isMaintenance} canBypassMaintenance={canBypassMaintenance}>
      <AuthPageLayout
        type="signup"
        locale={locale}
        bgColors={{
          top: 'bg-gradient-to-br from-success/20 to-success/5',
          bottom: 'bg-gradient-to-tl from-info/20 to-info/5'
        }}
        shadowColor="shadow-success/5"
      >
        <SignUpForm locale={locale} />
      </AuthPageLayout>
    </MaintenanceGuard>
  );
}


