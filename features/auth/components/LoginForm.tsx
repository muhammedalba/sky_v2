'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLogin } from '@/features/auth/hooks/useAuth';
import { loginSchema } from '@/features/auth/auth.schema';
import Link from 'next/link';
import { Button } from '@/shared/ui/Button';
import { Lock, Mail } from 'lucide-react';
import { AuthHeader, AuthFooter, AuthMobileLogo } from './AuthSharedComponents';
import { SocialLoginSection } from './AuthClientComponents';
import { SmartForm, useSmartMutation } from '@/shared/ui/form/SmartForm';
import { SmartInput, SmartPasswordInput } from '@/shared/ui/form/SmartFields';

export default function LoginForm({ locale }: { locale: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('auth');

  const loginMutation = useSmartMutation(useLogin(), {
    onSuccess: () => router.push(`/${locale}/dashboard`),
  });

  const successMessage =
    searchParams?.get('signup') === 'success' ? t('signupSuccess') :
      searchParams?.get('reset') === 'success' ? t('resetSuccess') :
        null;

  return (
    <div className="w-full space-y-6">
      <AuthMobileLogo subtitle={t('constructionPortal')} className="lg:hidden" />
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
          className="w-full h-12 text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          size="lg"
          isLoading={loginMutation.isPending}
        >
          {t('loginButton')}
        </Button>
      </SmartForm>

      <SocialLoginSection disabled={loginMutation.isPending} />

      <AuthFooter text={t('noAccount')} linkText={t('signupLink')} linkHref={`/${locale}/signup`} />
    </div>
  );
}

