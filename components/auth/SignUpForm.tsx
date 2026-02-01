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

const SignUpForm = ({ locale }: { locale: string }) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations('auth');
  const tErrors = useTranslations('errors');

  const {
    register,
    handleSubmit,
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
      },
      onError: (err: any) => {
        setServerError(err.response?.data?.message || tErrors('serverError'));
      },
    });
  };

  return (
    <div className="w-full">
      <header className="mb-8">
        <h1 className="text-4xl font-black tracking-tight text-foreground">{t('createAccount')}</h1>
        <p className="text-muted-foreground mt-2 font-medium">{t('signupDescription')}</p>
      </header>

      {serverError && <ErrorMessage message={serverError} className="mb-6 animate-in slide-in-from-top-1 px-4 py-3 rounded-xl" />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('name')}</label>
          <Input
            type="text"
            {...register('name')}
            placeholder="John Doe"
            className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
          {errors.name && <div className="text-destructive text-xs mt-1">{tErrors(errors.name.message as any)}</div>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('email')}</label>
          <Input
            type="email"
            {...register('email')}
            placeholder="name@company.com"
            className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
          {errors.email && <div className="text-destructive text-xs mt-1">{tErrors(errors.email.message as any)}</div>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('password')}</label>
            <PasswordInput
              {...register('password')}
              placeholder="••••••••"
              className={errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {errors.password && <div className="text-destructive text-xs mt-1">{tErrors(errors.password.message as any)}</div>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('confirmPassword')}</label>
            <PasswordInput
              {...register('confirmPassword')}
              placeholder="••••••••"
              className={errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {errors.confirmPassword && <div className="text-destructive text-xs mt-1">{tErrors(errors.confirmPassword.message as any)}</div>}
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full text-base font-semibold" 
          size="lg"
          isLoading={registerMutation.isPending}
        >
          {t('signupButton')}
        </Button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/50" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-4 text-muted-foreground font-bold tracking-widest">{t('orContinueWith')}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <Button
            variant="secondary"
            className="h-14 rounded-xl border-none bg-secondary/20 hover:bg-secondary/30 transition-all font-black"
            onClick={() => window.location.href = authApi.getGoogleAuthUrl()}
          >
            <Icons.Google className="w-5 h-5 mr-3" />
            Google
          </Button>
          <Button
            variant="secondary"
            className="h-14 rounded-xl border-none bg-secondary/20 hover:bg-secondary/30 transition-all font-black"
            onClick={() => window.location.href = authApi.getFacebookAuthUrl()}
          >
            <Icons.Facebook className="w-5 h-5 mr-3" />
            Facebook
          </Button>
      </div>

      <footer className="text-center pt-8 border-t border-border/50 mt-10">
        <p className="text-muted-foreground font-semibold">
          {t('alreadyHaveAccount')}{' '}
           <button
            onClick={() => router.push(`/${locale}/login`)}
            className="text-primary font-black hover:underline underline-offset-4"
          >
            {t('loginLink')}
          </button>
        </p>
      </footer>
    </div>
  );
};

export default SignUpForm;
