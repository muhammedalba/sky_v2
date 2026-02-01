'use client';

import { use } from 'react';
import ForgotPasswordFlow from '@/components/auth/ForgotPasswordFlow';
import SEO from '@/components/ui/SEO';
import { useTranslations } from 'next-intl';

export default function ForgotPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations('auth');

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background selection:bg-primary/20">
      <SEO 
        title={t('forgotPasswordTitle')} 
        description={t('forgotPasswordDescription')}
      />
      
      {/* Left Side: Branding */}
      <section className="hidden lg:flex relative bg-secondary-950 items-center justify-center overflow-hidden">
         <div className="absolute top-0 right-0 w-full h-full opacity-30">
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-amber-600 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-600 rounded-full blur-[120px]" />
         </div>
         
         <div className="relative z-10 px-12 text-center max-w-xl">
             <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 mb-8 animate-in slide-in-from-top-4 duration-700">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-white">S</div>
                <span className="text-white font-black tracking-wider text-sm uppercase">Sky Galaxy Recovery</span>
             </div>
             <h2 className="text-5xl font-black text-white mb-6 leading-tight tracking-tight">
                Secure your account. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-primary-300">Restoring access.</span>
             </h2>
             <p className="text-secondary-400 text-lg font-medium leading-relaxed">
                Follow our secure multi-step verification process to regain access to your professional dashboard.
             </p>
         </div>
      </section>

      {/* Right Side: Form Content */}
      <section className="flex items-center justify-center p-8 sm:p-12 lg:p-20 relative">
        <div className="w-full max-w-sm space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="lg:hidden text-center mb-10 flex flex-col items-center">
             <div className="w-16 h-16 bg-primary rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-primary/20 mb-4">
                <span className="text-white font-black text-2xl">S</span>
             </div>
          </div>

          <ForgotPasswordFlow />
        </div>

        <div className="absolute top-[10%] right-[10%] w-[30%] h-[30%] bg-amber-500/5 rounded-full blur-[80px] -z-10" />
        <div className="absolute bottom-[10%] left-[10%] w-[20%] h-[20%] bg-primary/5 rounded-full blur-[60px] -z-10" />
      </section>
    </main>
  );
}
