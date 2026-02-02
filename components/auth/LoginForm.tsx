'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLogin } from '@/hooks/api/useAuth';
import { authApi } from '@/lib/api/auth';
import { loginSchema, type LoginInput } from '@/lib/validations/schemas';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import ErrorMessage from '@/components/ui/ErrorMessage';
import SuccessMessage from '@/components/ui/SuccessMessage';
import { Icons } from '@/components/ui/Icons';
import { AxiosError } from 'axios';
import { Lock, Mail } from 'lucide-react';
import { AuthHeader, AuthFooter } from './AuthSharedComponents';

export default function LoginForm({ locale }: { locale: string }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('auth');
  const tErrors = useTranslations('errors');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const emailValue = watch('email');
  const passwordValue = watch('password');

  const loginMutation = useLogin();

  const successMessage = 
    searchParams.get('signup') === 'success' ? t('signupSuccess') : 
    searchParams.get('reset') === 'success' ? t('resetSuccess') : 
    null;

  const onSubmit = (data: LoginInput) => {
    setServerError(null);
    
    loginMutation.mutate(data, {
      onSuccess: () => {
        router.push(`/${locale}/dashboard`);
      },
      onError: (err: unknown) => {
        const error = err as AxiosError<{ message: string }>;
        setServerError(error.response?.data?.message || tErrors('serverError'));
      },
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <AuthHeader 
        title={t('loginTitle')}
        description={t('welcomeBack')}
      />

      {/* Messages */}
      {serverError && <ErrorMessage message={serverError} className="animate-in slide-in-from-top-1 px-4 py-3 rounded-2xl" />}
      {successMessage && (
        <SuccessMessage message={successMessage} className="animate-in slide-in-from-top-1 px-4 py-3 rounded-2xl" />
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Input
              icon={Mail}
              value={emailValue}
              label={t('email')}
              disabled={loginMutation.isPending}
              error={errors.email?.message ? tErrors(errors.email.message as "emailRequired" | "emailInvalid") : undefined}
              type="email"
              {...register('email')}
              className="h-12"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <PasswordInput
              {...register('password')}
              value={passwordValue} 
              label={t('password')}
              icon={Lock}
              error={errors.password?.message ? tErrors(errors.password.message as "passwordRequired") : undefined}
              className="h-12"
            />
            <div className="flex justify-end">
              <Link
                href={`/${locale}/forgot-password`}
                className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
              >
                {t('forgotPasswordLink')}
              </Link>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]" 
          size="lg"
          isLoading={loginMutation.isPending}
        >
          {t('loginButton')}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/50" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-4 text-muted-foreground font-bold tracking-widest">{t('orContinueWith')}</span>
        </div>
      </div>

      {/* Social Login */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"     
          className="h-12 rounded-xl border-border/50 bg-background hover:bg-secondary/50 transition-all font-bold text-foreground/80 hover:text-foreground hover:border-border"
          onClick={() => window.location.href = authApi.getGoogleAuthUrl()}
        >
          <Icons.Google className="w-5 h-5 mr-2" />
          Google
        </Button>
        <Button
          variant="outline"
          className="h-12 rounded-xl border-border/50 bg-background hover:bg-secondary/50 transition-all font-bold text-foreground/80 hover:text-foreground hover:border-border"
          onClick={() => window.location.href = authApi.getFacebookAuthUrl()}
        >
          <Icons.Facebook className="w-5 h-5 mr-2" />
          Facebook
        </Button>
      </div>

      {/* Footer */}
      <AuthFooter 
        text={t('noAccount')}
        linkText={t('signupLink')}
        linkHref={`/${locale}/signup`}
      />
    </div>
  );
}
