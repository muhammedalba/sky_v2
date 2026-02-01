'use client';

import { use, useState, useEffect } from 'react';
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
import SEO from '@/components/ui/SEO';
import { Icons } from '@/components/ui/Icons';

export default function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('auth');
  const tErrors = useTranslations('errors');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useLogin();

  useEffect(() => {
    if (searchParams.get('signup') === 'success') {
      setSuccess(t('signupSuccess'));
    } else if (searchParams.get('reset') === 'success') {
      setSuccess(t('resetSuccess'));
    }
  }, [searchParams, t]);

  const onSubmit = (data: LoginInput) => {
    setServerError(null);
    setSuccess(null);
    
    loginMutation.mutate(data, {
      onSuccess: () => {
        router.push(`/${locale}/dashboard`);
      },
      onError: (err: any) => {
        setServerError(err.response?.data?.message || tErrors('serverError'));
      },
    });
  };

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background selection:bg-primary/20">
      <SEO 
        title={t('loginTitle')} 
        description={t('loginDescription')}
      />
      
      {/* Left Side: Illustration / Branding */}
      <section className="hidden lg:flex relative bg-secondary-950 items-center justify-center overflow-hidden">
         {/* Abstract background shapes */}
         <div className="absolute top-0 right-0 w-full h-full opacity-30">
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary-600 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600 rounded-full blur-[120px]" />
         </div>
         
         <div className="relative z-10 px-12 text-center max-w-xl">
             <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 mb-8 animate-in slide-in-from-top-4 duration-700">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-white">S</div>
                <span className="text-white font-black tracking-wider text-sm uppercase">Sky Galaxy Premium</span>
             </div>
             <h2 className="text-5xl font-black text-white mb-6 leading-tight tracking-tight">
                Manage your shop with <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-300">Absolute Precision.</span>
             </h2>
             <p className="text-secondary-400 text-lg font-medium leading-relaxed">
                Join thousands of store owners worldwide using our intelligent dashboard to scale their business.
             </p>

             {/* Stat Cards Overlay */}
             <div className="mt-16 grid grid-cols-2 gap-4 text-left">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                   <p className="text-primary-400 font-black text-2xl">99.9%</p>
                   <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Uptime</p>
                </div>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                   <p className="text-indigo-400 font-black text-2xl">24/7</p>
                   <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Global Support</p>
                </div>
             </div>
         </div>
      </section>

      {/* Right Side: Form */}
      <section className="flex items-center justify-center p-8 sm:p-12 lg:p-20 relative">
        <div className="w-full max-w-sm space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="lg:hidden text-center mb-10 flex flex-col items-center">
             <div className="w-16 h-16 bg-primary rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-primary/20 mb-4">
                <span className="text-white font-black text-2xl">S</span>
             </div>
          </div>

          <header>
            <h1 className="text-4xl font-black tracking-tight text-foreground">{t('loginTitle')}</h1>
            <p className="text-muted-foreground mt-2 font-medium">{t('welcomeBack')}</p>
          </header>

          {serverError && <ErrorMessage message={serverError} className="mb-4 animate-in slide-in-from-top-1 px-4 py-3 rounded-xl" />}
          {success && (
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm font-bold animate-in slide-in-from-top-1">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('email')}</label>
                <Input
                  type="email"
                  {...register('email')}
                  placeholder="admin@skygalaxy.com"
                  className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {errors.email && <div className="text-destructive text-xs mt-1">{tErrors(errors.email.message as any)}</div>}
              </div>

              <div className="space-y-2">
                 <div className="flex justify-between items-center">
                   <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('password')}</label>
                   <Link
                      href={`/${locale}/forgot-password`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      {t('forgotPasswordLink')}
                    </Link>
                 </div>
                 <PasswordInput
                  {...register('password')}
                  placeholder="••••••••"
                  className={errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {errors.password && <div className="text-destructive text-xs mt-1">{tErrors(errors.password.message as any)}</div>}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full text-base font-semibold" 
              size="lg"
              isLoading={loginMutation.isPending}
            >
              {t('loginButton')}
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

          <footer className="text-center pt-8 border-t border-border/50">
            <p className="text-muted-foreground font-semibold">
              {t('noAccount')}{' '}
              <Link
                href={`/${locale}/signup`}
                className="text-primary font-black hover:underline underline-offset-4"
              >
                {t('signupLink')}
              </Link>
            </p>
          </footer>
        </div>

        {/* Floating background blobs for light mode */}
        <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[80px] -z-10" />
        <div className="absolute bottom-[10%] right-[10%] w-[20%] h-[20%] bg-indigo-500/5 rounded-full blur-[60px] -z-10" />
      </section>
    </main>
  );
}
