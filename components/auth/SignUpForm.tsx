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

  // Watch form values for floating label effect
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
        // Safe error handling avoiding 'any'
        const errorMessage = 
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 
          tErrors('serverError');
        
        setServerError(errorMessage);
        toast.error(tErrors('serverError'));
      },
    });
  };

  return (
    <section className="flex flex-col items-center justify-center p-6 sm:p-12 lg:p-24 relative bg-background/50 backdrop-blur-3xl min-h-screen lg:min-h-0">
      <div className="w-full max-w-[480px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="text-center space-y-2">
           <div className="lg:hidden w-14 h-14 bg-gradient-to-tr from-primary to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-primary/20 mb-6">
               <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm" />
           </div>
           <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">{t('createAccount')}</h1>
           <p className="text-muted-foreground text-lg">{t('signupDescription')}</p>
        </div>

        {serverError && <ErrorMessage message={serverError} className="animate-in slide-in-from-top-1 px-4 py-3 rounded-2xl" />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <div className="relative group">
              <Input
                type="text"
                value={nameValue}
                label={t('name')}
                disabled={registerMutation.isPending}
                error={errors.name?.message ? tErrors(errors.name.message as Parameters<typeof tErrors>[0]) : undefined}
                {...register('name')}
                className={`h-12 px-4 rounded-xl border-border/50 bg-secondary/30 transition-all duration-200 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/50 group-hover:border-primary/30 ${errors.name ? 'border-destructive/50 focus:border-destructive' : ''}`}
              />
            </div>
          </div>

          <div className="space-y-2">
             <div className="relative group">
              <Input
                type="email"
                value={emailValue}
                label={t('email')}
                disabled={registerMutation.isPending}
                error={errors.email?.message ? tErrors(errors.email.message as Parameters<typeof tErrors>[0]) : undefined}
                {...register('email')}
                className={`h-12 px-4 rounded-xl border-border/50 bg-secondary/30 transition-all duration-200 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/50 group-hover:border-primary/30 ${errors.email ? 'border-destructive/50 focus:border-destructive' : ''}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="relative group">
                <PasswordInput
                  value={passwordValue}
                  label={t('password')}
                  disabled={registerMutation.isPending}
                  error={errors.password?.message ? tErrors(errors.password.message as Parameters<typeof tErrors>[0]) : undefined}
                  {...register('password')}
                  className={`h-12 px-4 rounded-xl border-border/50 bg-secondary/30 transition-all duration-200 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/50 group-hover:border-primary/30 ${errors.password ? 'border-destructive/50 focus:border-destructive' : ''}`}
                />
              </div>
            </div>
            <div className="space-y-2">
               <div className="relative group">
                <PasswordInput
                  value={confirmPasswordValue}
                  label={t('confirmPassword')}
                  disabled={registerMutation.isPending}
                  error={errors.confirmPassword?.message ? tErrors(errors.confirmPassword.message as Parameters<typeof tErrors>[0]) : undefined}
                  {...register('confirmPassword')}
                  className={`h-12 px-4 rounded-xl border-border/50 bg-secondary/30 transition-all duration-200 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/50 group-hover:border-primary/30 ${errors.confirmPassword ? 'border-destructive/50 focus:border-destructive' : ''}`}
                />
              </div>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]" 
            size="lg"
            isLoading={registerMutation.isPending}
          >
            {t('signupButton')}
          </Button>
        </form>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-4 text-muted-foreground font-bold tracking-widest">{t('orContinueWith')}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-12 rounded-xl border-border/50 bg-background hover:bg-secondary/50 transition-all font-bold text-foreground/80 hover:text-foreground hover:border-border"
              onClick={() => window.location.href = authApi.getGoogleAuthUrl()}
            >
              <Icons.Google className="w-5 h-5 mr-3" />
              Google
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-xl border-border/50 bg-background hover:bg-secondary/50 transition-all font-bold text-foreground/80 hover:text-foreground hover:border-border"
              onClick={() => window.location.href = authApi.getFacebookAuthUrl()}
            >
              <Icons.Facebook className="w-5 h-5 mr-3" />
              Facebook
            </Button>
        </div>

        <footer className="text-center pt-6">
          <p className="text-muted-foreground/80 text-sm font-medium">
            {t('alreadyHaveAccount')}{' '}
             <button
              onClick={() => router.push(`/${locale}/login`)}
              className="text-primary font-bold hover:underline underline-offset-4 transition-all"
            >
              {t('loginLink')}
            </button>
          </p>
        </footer>
      </div>
    </section>
  );
};


