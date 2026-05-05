'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import StepWizard from '@/shared/ui/StepWizard';
import { LogInIcon, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { AuthHeader, AuthMobileLogo } from './AuthSharedComponents';

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

  const t = useTranslations('auth');
  const router = useRouter();

  const handleRequestSuccess = (email: string) => {
    setSubmittedEmail(email);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('reset-email', email);
    }
    setStep('VERIFY');
  };

  const handleVerifySuccess = () => {
    setStep('RESET');
  };

  const handleChangeEmail = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('reset-email');
    }
    setStep('REQUEST');
  };

  const stepNumber = step === 'REQUEST' ? 1 : step === 'VERIFY' ? 2 : 3;
  const headerText = {
    REQUEST: t('requestDescription'),
    VERIFY: t('verifyDescription'),
    RESET: t('resetDescription'),
  };

  return (
    <div className="w-full pt-8">

      <AuthMobileLogo subtitle={t('forgotPasswordTitle')} className="lg:hidden" />
      <AuthHeader description={headerText[step] } title={t('forgotPasswordTitle')} />

      <StepWizard currentStep={stepNumber} totalSteps={3} className="mb-10" />

      <div className=" ">
        {step === 'REQUEST' && (
          <RequestStep
            onSuccess={handleRequestSuccess}
          />
        )}

        {step === 'VERIFY' && (
          <VerifyStep
            onSuccess={handleVerifySuccess}
            onChangeEmail={handleChangeEmail}
          />
        )}

        {step === 'RESET' && (
          <ResetStep
            email={submittedEmail}
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

