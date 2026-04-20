import { use } from 'react';
import SignUpForm from '@/features/auth/components/SignUpForm';
import { getTranslations } from 'next-intl/server';
import AuthBrandingSection from '@/features/auth/components/AuthBrandingSection';
import { AuthMobileLogo, AuthTrustIndicators, AuthFormContainer, AuthBackgroundDecorations } from '@/features/auth/components/AuthSharedComponents';

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
  const isRTL = locale === 'ar';

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-background via-background to-secondary/5">

      {/* Left Side: Enhanced Branding Section */}
      <AuthBrandingSection locale={locale} isRTL={isRTL} type="signup" />

      {/* Right Side: Form Content */}
      <section className="flex items-center justify-center p-6 sm:p-8 lg:p-16 xl:p-20 relative">
        {/* Background Decorations */}
        <AuthBackgroundDecorations
          colors={{
            top: 'bg-gradient-to-br from-emerald-500/10 to-green-500/5',
            bottom: 'bg-gradient-to-tl from-teal-500/10 to-cyan-500/5'
          }}
        />

        <div className={`w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10 ${isRTL ? 'rtl' : 'ltr'}`}>
          {/* Mobile Logo */}
          <AuthMobileLogo
            locale={locale}
            gradient="bg-gradient-to-br from-emerald-400 to-green-500 shadow-emerald-500/30"
          />

          {/* Main Form Component */}
          <AuthFormContainer shadowColor="shadow-emerald-500/5">
            <SignUpForm locale={locale} />
          </AuthFormContainer>

          {/* Trust Indicators */}
          <AuthTrustIndicators locale={locale} />
        </div>
      </section>
    </main>
  );
}
