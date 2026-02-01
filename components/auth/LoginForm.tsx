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

export default function LoginForm({ locale }: { locale: string }) {
  const [serverError, setServerError] = useState<string | null>(null);
  // Derived state for success messages from URL parameters
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

  // Watch form values for floating label effect
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
    <section className="flex flex-col items-center justify-center p-6 sm:p-12 lg:p-24 relative bg-background/50 backdrop-blur-3xl min-h-screen lg:min-h-0">
      <div className="w-full max-w-[420px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="text-center space-y-2">
           <div className="lg:hidden w-14 h-14 bg-gradient-to-tr from-primary to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-primary/20 mb-6">
               <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm" />
           </div>
           <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">{t('loginTitle')}</h1>
           <p className="text-muted-foreground text-lg">{t('welcomeBack')}</p>
        </div>

        {serverError && <ErrorMessage message={serverError} className="animate-in slide-in-from-top-1 px-4 py-3 rounded-2xl" />}
        {successMessage && (
          <SuccessMessage message={successMessage} className="animate-in slide-in-from-top-1 px-4 py-3 rounded-2xl" />
        )}


        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="relative group">
                  <Input
                    icon={Mail}
                    value={emailValue}
                    label={t('email')}
                    disabled={loginMutation.isPending}
                    error={errors.email?.message ? tErrors(errors.email.message as "emailRequired" | "emailInvalid") : undefined}
                    type="email"
                    {...register('email')}
                    className={`h-12`}
                  />
              </div>
            </div>

            <div className="space-y-2">

               <div className="relative group">
                  <PasswordInput
                    {...register('password')}
                    value={passwordValue} 
                    label={t('password')}
                    icon={Lock}
                    error={errors.password?.message ? tErrors(errors.password.message as "passwordRequired") : undefined}
                    className={`h-12`}
                  />
              </div>
               <div className="flex justify-between items-center">
                 <label className="text-sm font-bold text-foreground/80 ml-1">{t('password')}</label>
                 <Link
                    href={`/${locale}/forgot-password`}
                    className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                  >
                    {t('forgotPasswordLink')}
                  </Link>
               </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]" 
            size="lg"
            isLoading={loginMutation.isPending}
          >
            {t('loginButton')}
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
            {t('noAccount')}{' '}
            <Link
              href={`/${locale}/signup`}
              className="text-primary font-bold hover:underline underline-offset-4 transition-all"
            >
              {t('signupLink')}
            </Link>
          </p>
        </footer>
      </div>
    </section>
  );
}
