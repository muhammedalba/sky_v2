'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import ErrorMessage from '@/shared/ui/ErrorMessage';
import StepWizard from '@/shared/ui/StepWizard';
import { LogInIcon, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { AuthMobileLogo } from './AuthSharedComponents';

// Dynamic imports for better performance and smaller initial bundle
const RequestStep = dynamic(() => import('./forgot-password/RequestStep'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary/50" /></div>
});
const VerifyStep = dynamic(() => import('./forgot-password/VerifyStep'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary/50" /></div>
});
const ResetStep = dynamic(() => import('./forgot-password/ResetStep'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary/50" /></div>
});

type Step = 'REQUEST' | 'VERIFY' | 'RESET';

const ForgotPasswordFlow = ({ locale }: { locale: string }) => {
  const [step, setStep] = useState<Step>('REQUEST');
  const [submittedEmail, setSubmittedEmail] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('reset-email') || '';
    }
    return '';
  });
  const [serverError, setServerError] = useState<string | null>(null);

  const t = useTranslations('auth');
  const tErrors = useTranslations('errors');
  const router = useRouter();

  // Helper type for safely accessing error props
  type ErrorResponse = { response?: { data?: { message?: string } } };

  const handleError = (err: unknown) => {
    setServerError((err as ErrorResponse).response?.data?.message || tErrors('serverError'));
  };

  const handleRequestSuccess = (email: string) => {
    setServerError(null);
    setSubmittedEmail(email);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('reset-email', email);
    }
    setStep('VERIFY');
  };

  const handleVerifySuccess = () => {
    setServerError(null);
    setStep('RESET');
  };

  const handleChangeEmail = () => {
    setServerError(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('reset-email');
    }
    setStep('REQUEST');
  };

  const stepNumber = step === 'REQUEST' ? 1 : step === 'VERIFY' ? 2 : 3;

  return (
    <div className="w-full pt-8">

      <AuthMobileLogo subtitle={t('forgotPasswordTitle')} className="lg:hidden" />
      <header className="mb-4">
        <h1 className="text-2xl text-center md:text-3xl font-black tracking-tight text-foreground">{t('forgotPasswordTitle')}</h1>
        <p className="text-muted-foreground text-center mt-2 font-medium">
          {step === 'REQUEST' && t('requestDescription')}
          {step === 'VERIFY' && t('verifyDescription')}
          {step === 'RESET' && t('resetDescription')}
        </p>
      </header>

      <StepWizard currentStep={stepNumber} totalSteps={3} className="mb-10" />

      {serverError && <ErrorMessage showIcon={true} message={serverError} className="mb-6 animate-in slide-in-from-top-1 px-4 py-3 rounded-2xl" />}

      <div className=" ">
        {step === 'REQUEST' && (
          <RequestStep
            onSuccess={handleRequestSuccess}
            onError={handleError}
          />
        )}

        {step === 'VERIFY' && (
          <VerifyStep
            onSuccess={handleVerifySuccess}
            onError={handleError}
            onChangeEmail={handleChangeEmail}
          />
        )}

        {step === 'RESET' && (
          <ResetStep
            email={submittedEmail}
            onError={handleError}
          />
        )}
      </div>

      <footer className="text-center mt-5 pt-3 border-t border-border/50">
        <Button variant="outline" size="sm"
          onClick={() => router.push(`/${locale}/login`)}
          className="group inline-flex items-center gap-2 text-muted-foreground hover:text-primary font-black uppercase tracking-widest text-xs transition-all p-2 rounded-lg hover:bg-secondary/50 hover:border-primary cursor-pointer"
        >
          <LogInIcon className="w-4 text-destructive h-4 rotate-180 transition-transform group-hover:-translate-x-1" />
          {t('backToLogin')}
        </Button>
      </footer>
    </div>
  );
};

export default ForgotPasswordFlow;

