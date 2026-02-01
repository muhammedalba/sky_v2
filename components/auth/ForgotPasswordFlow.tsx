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

  // Helper type for safely accessing error props
  type ErrorResponse = { response?: { data?: { message?: string } } };

  // Step 1: Request Code
  const {
    register: registerRequest,
    handleSubmit: handleSubmitRequest,
    watch: watchRequest,
    formState: { errors: errorsRequest },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const emailRequestValue = watchRequest('email');

  // Step 2: Verify Code
  const {
    register: registerVerify,
    handleSubmit: handleSubmitVerify,
    watch: watchVerify,
    formState: { errors: errorsVerify },
  } = useForm<VerifyResetCodeInput>({
    resolver: zodResolver(verifyResetCodeSchema),
  });

  const resetCodeValue = watchVerify('resetCode');

  // Step 3: Reset Password
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    watch: watchReset,
    formState: { errors: errorsReset },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const passwordResetValue = watchReset('password');
  const confirmPasswordResetValue = watchReset('confirmPassword');

  const onRequestSubmit = (data: ForgotPasswordInput) => {
    setServerError(null);
    setSubmittedEmail(data.email);
    forgotMutation.mutate(data.email, {
      onSuccess: () => setStep('VERIFY'),
      onError: (err: unknown) => setServerError((err as ErrorResponse).response?.data?.message || tErrors('serverError')),
    });
  };

  const onVerifySubmit = (data: VerifyResetCodeInput) => {
    setServerError(null);
    verifyMutation.mutate(data.resetCode, {
      onSuccess: () => setStep('RESET'),
      onError: (err: unknown) => setServerError((err as ErrorResponse).response?.data?.message || tErrors('serverError')),
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
      onError: (err: unknown) => setServerError((err as ErrorResponse).response?.data?.message || tErrors('serverError')),
    });
  };

  const stepNumber = step === 'REQUEST' ? 1 : step === 'VERIFY' ? 2 : 3;

  return (
    <div className="w-full">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">{t('forgotPasswordTitle')}</h1>
        <p className="text-muted-foreground mt-2 font-medium">
          {step === 'REQUEST' && t('requestDescription')}
          {step === 'VERIFY' && t('verifyDescription')}
          {step === 'RESET' && t('resetDescription')}
        </p>
      </header>

      <StepWizard currentStep={stepNumber} totalSteps={3} className="mb-10" />

      {serverError && <ErrorMessage message={serverError} className="mb-6 animate-in slide-in-from-top-1 px-4 py-3 rounded-2xl" />}

      <div className="space-y-8">
        {step === 'REQUEST' && (
          <form onSubmit={handleSubmitRequest(onRequestSubmit)} className="space-y-5 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-2">
              <Input
                type="email"
                value={emailRequestValue}
                disabled={forgotMutation.isPending}
                error={errorsRequest.email?.message ? tErrors(errorsRequest.email.message) : undefined}
                label={t('email')}
                className={`h-12 px-4 rounded-xl border-border/50 bg-secondary/30 transition-all focus:bg-background focus:ring-2 focus:ring-primary/20 ${errorsRequest.email ? 'border-destructive/50 focus:border-destructive' : ''}`}
                {...registerRequest('email')}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all" 
              size="lg"
              isLoading={forgotMutation.isPending}
            >
              {t('sendCode')}
            </Button>
          </form>
        )}

        {step === 'VERIFY' && (
          <form onSubmit={handleSubmitVerify(onVerifySubmit)} className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-4 text-center">
  
              <Input
                type="text"
                value={resetCodeValue}
                disabled={verifyMutation.isPending}
                label={t('verificationCode')}
                error={errorsVerify.resetCode?.message ? tErrors(errorsVerify.resetCode.message) : undefined}
                className={`h-16 text-center text-3xl font-black tracking-[0.5em] rounded-2xl border-border/50 bg-secondary/30 transition-all focus:bg-background focus:ring-4 focus:ring-primary/10 ${errorsVerify.resetCode ? 'border-destructive/50 focus:border-destructive' : ''}`}
                {...registerVerify('resetCode')}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] transition-all" 
              size="lg"
              isLoading={verifyMutation.isPending}
            >
              {t('verifyCode')}
            </Button>
            <button
              type="button"
              onClick={() => setStep('REQUEST')}
              className="w-full text-muted-foreground hover:text-primary text-sm font-bold transition-colors py-2"
            >
              {t('changeEmail')}
            </button>
          </form>
        )}

        {step === 'RESET' && (
          <form onSubmit={handleSubmitReset(onResetSubmit)} className="space-y-5 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-2">
              <PasswordInput
              value={passwordResetValue}
              label={t('newPassword')}
              disabled={resetMutation.isPending}
              error={errorsReset.password?.message ? tErrors(errorsReset.password.message) : undefined}
                className={`h-12 px-4 rounded-xl border-border/50 bg-secondary/30 transition-all focus:bg-background focus:ring-2 focus:ring-primary/20 ${errorsReset.password ? 'border-destructive/50 focus:border-destructive' : ''}`}
                {...registerReset('password')}
              />
            </div>
            <div className="space-y-2">
              <PasswordInput
              value={confirmPasswordResetValue}
              label={t('confirmPassword')}
              disabled={resetMutation.isPending}
              error={errorsReset.confirmPassword?.message ? tErrors(errorsReset.confirmPassword.message) : undefined}
                className={`h-12 px-4 rounded-xl border-border/50 bg-secondary/30 transition-all focus:bg-background focus:ring-2 focus:ring-primary/20 ${errorsReset.confirmPassword ? 'border-destructive/50 focus:border-destructive' : ''}`}
                {...registerReset('confirmPassword')}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] transition-all" 
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
          className="group inline-flex items-center gap-2 text-muted-foreground hover:text-primary font-black uppercase tracking-widest text-xs transition-all p-2 rounded-lg hover:bg-secondary/50"
        >
          <Icons.Menu className="w-4 h-4 rotate-180 transition-transform group-hover:-translate-x-1" />
          {t('backToLogin')}
        </button>
      </footer>
    </div>
  );
};

export default ForgotPasswordFlow;

