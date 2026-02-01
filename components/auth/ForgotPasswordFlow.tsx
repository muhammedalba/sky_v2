'use client';

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForgotPassword, useVerifyResetCode, useResetPassword } from '@/hooks/api/useAuth';
import { 
  forgotPasswordSchema, 
  verifyResetCodeSchema, 
  resetPasswordSchema, 
  type ForgotPasswordInput, 
  type VerifyResetCodeInput, 
  type ResetPasswordInput 
} from '@/lib/validations/schemas';
import { Input } from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import ErrorMessage from '@/components/ui/ErrorMessage';
import StepWizard from '@/components/ui/StepWizard';
import { Icons } from '@/components/ui/Icons';

type Step = 'REQUEST' | 'VERIFY' | 'RESET';

const ForgotPasswordFlow = () => {
  const [step, setStep] = useState<Step>('REQUEST');
  const [submittedEmail, setSubmittedEmail] = useState(''); // Keep track of email for final step
  const [serverError, setServerError] = useState<string | null>(null);

  const t = useTranslations('auth');
  const tErrors = useTranslations('errors');
  const router = useRouter();
  const { locale } = useParams();

  const forgotMutation = useForgotPassword();
  const verifyMutation = useVerifyResetCode();
  const resetMutation = useResetPassword();

  // Step 1: Request Code
  const {
    register: registerRequest,
    handleSubmit: handleSubmitRequest,
    formState: { errors: errorsRequest },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // Step 2: Verify Code
  const {
    register: registerVerify,
    handleSubmit: handleSubmitVerify,
    formState: { errors: errorsVerify },
  } = useForm<VerifyResetCodeInput>({
    resolver: zodResolver(verifyResetCodeSchema),
  });

  // Step 3: Reset Password
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: errorsReset },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onRequestSubmit = (data: ForgotPasswordInput) => {
    setServerError(null);
    setSubmittedEmail(data.email);
    forgotMutation.mutate(data.email, {
      onSuccess: () => setStep('VERIFY'),
      onError: (err: any) => setServerError(err.response?.data?.message || tErrors('serverError')),
    });
  };

  const onVerifySubmit = (data: VerifyResetCodeInput) => {
    setServerError(null);
    verifyMutation.mutate(data.resetCode, {
      onSuccess: () => setStep('RESET'),
      onError: (err: any) => setServerError(err.response?.data?.message || tErrors('serverError')),
    });
  };

  const onResetSubmit = (data: ResetPasswordInput) => {
    setServerError(null);
    if (!submittedEmail) {
      setServerError('Email is missing. Please restart the process.');
      return;
    }
    resetMutation.mutate({ email: submittedEmail, password: data.password }, {
      onSuccess: () => {
        router.push(`/${locale}/login?reset=success`);
      },
      onError: (err: any) => setServerError(err.response?.data?.message || tErrors('serverError')),
    });
  };

  const stepNumber = step === 'REQUEST' ? 1 : step === 'VERIFY' ? 2 : 3;

  return (
    <div className="w-full">
      <header className="mb-8">
        <h1 className="text-4xl font-black tracking-tight text-foreground">{t('forgotPasswordTitle')}</h1>
        <p className="text-muted-foreground mt-2 font-medium">
          {step === 'REQUEST' && t('requestDescription')}
          {step === 'VERIFY' && t('verifyDescription')}
          {step === 'RESET' && t('resetDescription')}
        </p>
      </header>

      <StepWizard currentStep={stepNumber} totalSteps={3} className="mb-10" />

      {serverError && <ErrorMessage message={serverError} className="mb-6 animate-in slide-in-from-top-1 px-4 py-3 rounded-xl" />}

      <div className="space-y-8">
        {step === 'REQUEST' && (
          <form onSubmit={handleSubmitRequest(onRequestSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('email')}</label>
              <Input
                type="email"
                placeholder="name@company.com"
                className={errorsRequest.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                {...registerRequest('email')}
              />
              {errorsRequest.email && <div className="text-destructive text-xs mt-1">{tErrors(errorsRequest.email.message || 'required')}</div>}
            </div>
            <Button 
              type="submit" 
              className="w-full text-base font-semibold" 
              size="lg"
              isLoading={forgotMutation.isPending}
            >
              {t('sendCode')}
            </Button>
          </form>
        )}

        {step === 'VERIFY' && (
          <form onSubmit={handleSubmitVerify(onVerifySubmit)} className="space-y-6">
            <div className="space-y-2 text-center">
              <label className="text-sm font-medium text-muted-foreground">{t('verificationCode')}</label>
              <Input
                type="text"
                placeholder="123456"
                className={`h-14 text-center text-2xl font-bold tracking-[0.5em] ${errorsVerify.resetCode ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                {...registerVerify('resetCode')}
              />
               {errorsVerify.resetCode && <div className="text-destructive text-xs mt-1">{tErrors('required')}</div>}
            </div>
            <Button 
              type="submit" 
              className="w-full text-base font-semibold" 
              size="lg"
              isLoading={verifyMutation.isPending}
            >
              {t('verifyCode')}
            </Button>
            <button
              type="button"
              onClick={() => setStep('REQUEST')}
              className="w-full text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
            >
              {t('changeEmail')}
            </button>
          </form>
        )}

        {step === 'RESET' && (
          <form onSubmit={handleSubmitReset(onResetSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('newPassword')}</label>
              <PasswordInput
                placeholder="••••••••"
                className={errorsReset.password ? 'border-destructive focus-visible:ring-destructive' : ''}
                {...registerReset('password')}
              />
              {errorsReset.password && <div className="text-destructive text-xs mt-1">{tErrors('invalidPassword')}</div>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('confirmPassword')}</label>
              <PasswordInput
                placeholder="••••••••"
                className={errorsReset.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}
                {...registerReset('confirmPassword')}
              />
              {errorsReset.confirmPassword && <div className="text-destructive text-xs mt-1">{tErrors('passwordMismatch')}</div>}
            </div>
            <Button 
              type="submit" 
              className="w-full text-base font-semibold" 
              size="lg"
              isLoading={resetMutation.isPending}
            >
              {t('resetPasswordButton')}
            </Button>
          </form>
        )}
      </div>

      <footer className="text-center pt-8 border-t border-border/50 mt-10">
        <button
          onClick={() => router.push(`/${locale}/login`)}
          className="group inline-flex items-center gap-2 text-muted-foreground hover:text-primary font-black uppercase tracking-widest text-xs transition-all"
        >
          <Icons.Menu className="w-4 h-4 rotate-180 transition-transform group-hover:-translate-x-1" />
          {t('backToLogin')}
        </button>
      </footer>
    </div>
  );
};

export default ForgotPasswordFlow;
