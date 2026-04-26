import { getTranslations } from 'next-intl/server';
import AuthBrandingSection from './AuthBrandingSection';
import { AuthBackgroundDecorations, AuthFormContainer, AuthTrustIndicators } from './AuthSharedComponents';
import { ReactNode } from 'react';

interface AuthPageLayoutProps {
  type: 'login' | 'signup' | 'forgot-password';
  locale: string;
  children: ReactNode;
  bgColors: {
    top: string;
    bottom: string;
  };
  shadowColor?: string;
}

/**
 * Unified Layout for all Auth Pages (Login, Signup, Forgot Password).
 * Reduces boilerplate and ensures consistent structural design across the auth flow.
 */
export default async function AuthPageLayout({
  type,
  locale,
  children,
  bgColors,
  shadowColor,
}: AuthPageLayoutProps) {
  const isRTL = locale === 'ar';
  const t = await getTranslations({ locale, namespace: 'auth' });

  return (
    <main className="min-h-screen  grid grid-cols-1 lg:grid-cols-2 bg-linear-to-br from-background via-background to-secondary/5">
      {/* Left Side: Enhanced Branding Section (Server Component) */}
      <AuthBrandingSection locale={locale} isRTL={isRTL} type={type} />

      {/* Right Side: Form Content */}
      <section className="flex items-center justify-center p-6 sm:p-8 lg:p-16 xl:p-20 relative">
        {/* Background Decorations */}
        <AuthBackgroundDecorations colors={bgColors} />

        <div className={`w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10 ${isRTL ? 'rtl' : 'ltr'}`}>

          {/* Main Form/Flow Component */}
          <AuthFormContainer shadowColor={shadowColor}>
            {children}
          </AuthFormContainer>

          {/* Trust Indicators */}
          <AuthTrustIndicators locale={locale} />
        </div>
      </section>
    </main>
  );
}
