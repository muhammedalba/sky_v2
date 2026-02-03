import { use } from 'react';
import { getTranslations } from 'next-intl/server';
import ForgotPasswordFlow from '@/components/auth/ForgotPasswordFlow';
import AuthBrandingSection from '@/components/auth/AuthBrandingSection';
import { AuthMobileLogo, AuthTrustIndicators, AuthFormContainer, AuthBackgroundDecorations } from '@/components/auth/AuthSharedComponents';

// Metadata generation for SEO
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });

  return {
    title: t('forgotPasswordTitle'),
    description: t('forgotPasswordDescription'),
  };
}

export default function ForgotPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const isRTL = locale === 'ar';

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-background via-background to-secondary/5">
      
      {/* Left Side: Enhanced Branding Section */}
      <AuthBrandingSection locale={locale} isRTL={isRTL} type="forgot-password" />

      {/* Right Side: Flow Content */}
      <section className="flex items-center justify-center p-6 sm:p-8 lg:p-16 xl:p-20 relative">
        {/* Background Decorations */}
        <AuthBackgroundDecorations 
          colors={{
            top: 'bg-gradient-to-br from-amber-500/10 to-orange-500/5',
            bottom: 'bg-gradient-to-tl from-primary-500/10 to-blue-500/5'
          }}
        />

        <div className={`w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10 ${isRTL ? 'rtl' : 'ltr'}`}>
          {/* Mobile Logo */}
          <AuthMobileLogo 
            locale={locale} 
            gradient="bg-gradient-to-br from-amber-400 to-primary-500 shadow-primary/30"
          />

          {/* Main Flow Component */}
          <AuthFormContainer shadowColor="shadow-amber-500/5">
            <ForgotPasswordFlow locale={locale} />
          </AuthFormContainer>

          {/* Trust Indicators */}
          <AuthTrustIndicators locale={locale} />
        </div>
      </section>
    </main>
  );
}
