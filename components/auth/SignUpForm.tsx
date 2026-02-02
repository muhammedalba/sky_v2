'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegister } from '@/hooks/api/useAuth';
import { registerSchema, type RegisterInput } from '@/lib/validations/schemas';
import { Input } from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { Icons } from '@/components/ui/Icons';
import { authApi } from '@/lib/api/auth';
import { useToast } from '@/hooks/useToast';
import { User, Mail, Lock } from 'lucide-react';
import { AuthHeader, AuthFooter } from './AuthSharedComponents';

export default function SignUpForm({ locale }: { locale: string }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations('auth');
  const tErrors = useTranslations('errors');

  const toast = useToast();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const nameValue = watch('name');
  const emailValue = watch('email');
  const passwordValue = watch('password');
  const confirmPasswordValue = watch('confirmPassword');

  const registerMutation = useRegister();

  const onSubmit = (data: RegisterInput) => {
    setServerError(null);

    const formDataToSubmit = new FormData();
    formDataToSubmit.append('name', data.name);
    formDataToSubmit.append('email', data.email);
    formDataToSubmit.append('password', data.password);
    formDataToSubmit.append('confirmPassword', data.confirmPassword);

    registerMutation.mutate(formDataToSubmit, {
      onSuccess: () => {
        router.push(`/${locale}/login?signup=success`);
        toast.success(t('signupSuccess'));
      },
      onError: (err: unknown) => {
        const errorMessage = 
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 
          tErrors('serverError');
        
        setServerError(errorMessage);
        toast.error(tErrors('serverError'));
      },
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <AuthHeader 
        title={t('createAccount')}
        description={t('signupDescription')}
      />

      {/* Messages */}
      {serverError && <ErrorMessage message={serverError} className="animate-in slide-in-from-top-1 px-4 py-3 rounded-2xl" />}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <div className="space-y-2">
          <Input
            icon={User}
            type="text"
            value={nameValue}
            label={t('name')}
            disabled={registerMutation.isPending}
            error={errors.name?.message ? tErrors(errors.name.message as Parameters<typeof tErrors>[0]) : undefined}
            {...register('name')}
            className="h-12"
          />
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Input
            icon={Mail}
            type="email"
            value={emailValue}
            label={t('email')}
            disabled={registerMutation.isPending}
            error={errors.email?.message ? tErrors(errors.email.message as Parameters<typeof tErrors>[0]) : undefined}
            {...register('email')}
            className="h-12"
          />
        </div>

        {/* Password Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <PasswordInput
              icon={Lock}
              value={passwordValue}
              label={t('password')}
              disabled={registerMutation.isPending}
              error={errors.password?.message ? tErrors(errors.password.message as Parameters<typeof tErrors>[0]) : undefined}
              {...register('password')}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <PasswordInput
              icon={Lock}
              value={confirmPasswordValue}
              label={t('confirmPassword')}
              disabled={registerMutation.isPending}
              error={errors.confirmPassword?.message ? tErrors(errors.confirmPassword.message as Parameters<typeof tErrors>[0]) : undefined}
              {...register('confirmPassword')}
              className="h-12"
            />
          </div>
        </div>
        
        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]" 
          size="lg"
          isLoading={registerMutation.isPending}
        >
          {t('signupButton')}
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
        text={t('alreadyHaveAccount')}
        linkText={t('loginLink')}
        linkHref={`/${locale}/login`}
      />
    </div>
  );
};


