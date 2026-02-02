'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLogin } from '@/hooks/api/useAuth';
import { authApi } from '@/lib/api/auth';
import { loginSchema, type LoginInput } from '@/lib/validations/schemas';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';
import { Lock, Mail } from 'lucide-react';
import { AuthHeader, AuthFooter } from './AuthSharedComponents';
import { SmartForm, useSmartMutation } from '@/components/ui/form/SmartForm';
import { SmartInput, SmartPasswordInput } from '@/components/ui/form/SmartFields';

export default function LoginForm({ locale }: { locale: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('auth');

  const loginMutation = useSmartMutation(useLogin(), {
    onSuccess: () => router.push(`/${locale}/dashboard`),
  });

  const successMessage = 
    searchParams.get('signup') === 'success' ? t('signupSuccess') : 
    searchParams.get('reset') === 'success' ? t('resetSuccess') : 
    null;

  return (
    <div className="w-full space-y-6">
      <AuthHeader title={t('loginTitle')} description={t('welcomeBack')} />

      <SmartForm
        schema={loginSchema}
        defaultValues={{ email: '', password: '' }}
        onSubmit={loginMutation.mutate}
        serverError={loginMutation.serverError}
        successMessage={successMessage}
      >
        <div className="space-y-4">
          <SmartInput 
            name="email" 
            label={t('email')} 
            icon={Mail} 
            type="email" 
            disabled={loginMutation.isPending} 
            className="h-12" 
          />
          
          <div className="space-y-2">
            <SmartPasswordInput 
              name="password" 
              label={t('password')} 
              icon={Lock} 
              disabled={loginMutation.isPending} 
              className="h-12" 
            />
            <div className="flex justify-end">
              <Link href={`/${locale}/forgot-password`} className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">
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
      </SmartForm>

      {/* Divider */}
      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/50" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-4 text-muted-foreground font-bold tracking-widest">{t('orContinueWith')}</span>
        </div>
      </div>

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

      <AuthFooter text={t('noAccount')} linkText={t('signupLink')} linkHref={`/${locale}/signup`} />
    </div>
  );
}
