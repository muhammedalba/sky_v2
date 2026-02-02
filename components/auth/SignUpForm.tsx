'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRegister } from '@/hooks/api/useAuth';
import { registerSchema, type RegisterInput } from '@/lib/validations/schemas';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';
import { authApi } from '@/lib/api/auth';
import { useToast } from '@/hooks/useToast';
import { User, Mail, Lock } from 'lucide-react';
import { AuthHeader, AuthFooter } from './AuthSharedComponents';
import { SmartForm, useSmartMutation } from '@/components/ui/form/SmartForm';
import { SmartInput, SmartPasswordInput } from '@/components/ui/form/SmartFields';

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
            <SmartPasswordInput name="password" label={t('password')} icon={Lock} disabled={registerMutation.isPending} className="h-12" />
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

      <AuthFooter text={t('alreadyHaveAccount')} linkText={t('loginLink')} linkHref={`/${locale}/login`} />
    </div>
  );
}


