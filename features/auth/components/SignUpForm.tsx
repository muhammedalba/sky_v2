'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRegister } from '@/features/auth/hooks/useAuth';
import { registerSchema, type RegisterInput } from '@/features/auth/auth.schema';
import { Button } from '@/shared/ui/Button';
import { useToast } from '@/shared/hooks/useToast';
import { User, Mail, Lock } from 'lucide-react';
import { AuthHeader, AuthFooter, AuthMobileLogo } from './AuthSharedComponents';
import { SocialLoginSection, PasswordStrength } from './AuthClientComponents';
import { SmartForm, useSmartMutation } from '@/shared/ui/form/SmartForm';
import { SmartInput, SmartPasswordInput } from '@/shared/ui/form/SmartFields';

export default function SignUpForm({ locale }: { locale: string }) {
  const router = useRouter();
  const t = useTranslations('auth');
  const toast = useToast();

  const registerMutation = useSmartMutation(useRegister(), {
    onSuccess: () => {
      toast.success(t('signupSuccess'));
      router.push(`/${locale}/login?signup=success`);
    },
  });

  const onSubmit = (data: RegisterInput) => {
    const formDataToSubmit = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formDataToSubmit.append(key, value as string);
    });
    registerMutation.mutate(formDataToSubmit);
  };

  return (
    <div className="w-full space-y-6">
      <AuthMobileLogo subtitle={t('constructionPortal')} className="lg:hidden" />

      <AuthHeader title={t('createAccount')} description={t('signupDescription')} />

      <SmartForm
        schema={registerSchema}
        defaultValues={{ name: '', email: '', password: '', confirmPassword: '' }}
        onSubmit={onSubmit}
        serverError={registerMutation.serverError}
      >
        <div className="space-y-4">
          <SmartInput name="name" label={t('name')} icon={User} disabled={registerMutation.isPending} className="h-12" />
          <SmartInput name="email" label={t('email')} icon={Mail} type="email" disabled={registerMutation.isPending} className="h-12" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <SmartPasswordInput name="password" label={t('password')} icon={Lock} disabled={registerMutation.isPending} className="h-12" />
              {/* Password Strength Indicator */}
              <PasswordStrength name="password" />
            </div>
            <SmartPasswordInput name="confirmPassword" label={t('confirmPassword')} icon={Lock} disabled={registerMutation.isPending} className="h-12" />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          size="lg"
          isLoading={registerMutation.isPending}
        >
          {t('signupButton')}
        </Button>
      </SmartForm>

      <SocialLoginSection dividerText={t('orContinueWith')} />

      <AuthFooter text={t('alreadyHaveAccount')} linkText={t('loginLink')} linkHref={`/${locale}/login`} />
    </div>
  );
}
