'use client';

import { useResetPassword } from '@/features/auth/hooks/useAuth';
import { resetPasswordSchema, type ResetPasswordInput } from '@/features/auth/auth.schema';
import { Button } from '@/shared/ui/Button';
import { useTranslations } from 'next-intl';
import { Lock } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/shared/hooks/useToast';
import { SmartForm } from '@/shared/ui/form/SmartForm';
import { SmartPasswordInput } from '@/shared/ui/form/SmartFields';

interface ResetStepProps {
  email: string;
}

const ResetStep = ({ email }: ResetStepProps) => {
  const t = useTranslations('auth');
  const router = useRouter();
  const { locale } = useParams();
  const toast = useToast();

  const resetMutation = useResetPassword();

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!email) {
      throw new Error('Email is missing. Please restart the process.');
    }
    
    await resetMutation.mutateAsync({ email, password: data.password });
    toast.success(t('successReset'));
    router.push(`/${locale}/login?reset=success`);
  };

  return (
    <SmartForm
      schema={resetPasswordSchema}
      defaultValues={{ password: '', confirmPassword: '' }}
      onSubmit={onSubmit}
      networkErrorMessage={t("serverError")}
      className="space-y-5 animate-in fade-in slide-in-from-right-4"
    >
      <div className="space-y-4">
        <SmartPasswordInput
          name="password"
          icon={Lock}
          disabled={resetMutation.isPending}
          label={t('newPassword')}
          className="h-12 px-4"
        />
        <SmartPasswordInput
          name="confirmPassword"
          icon={Lock}
          disabled={resetMutation.isPending}
          label={t('confirmPassword')}
          className="h-12 px-4"
        />
      </div>
      <Button 
        type="submit" 
        className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] transition-all" 
        size="lg"
        isLoading={resetMutation.isPending}
      >
        {t('resetPasswordButton')}
      </Button>
    </SmartForm>
  );
};

export default ResetStep;
