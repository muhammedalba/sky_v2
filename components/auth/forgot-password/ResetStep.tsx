'use client';

import { useResetPassword } from '@/hooks/api/useAuth';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/schemas';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import { Lock } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import { SmartForm, useSmartMutation } from '@/components/ui/form/SmartForm';
import { SmartPasswordInput } from '@/components/ui/form/SmartFields';

interface ResetStepProps {
  email: string;
  onError: (error: any) => void;
}

const ResetStep = ({ email, onError }: ResetStepProps) => {
  const t = useTranslations('auth');
  const router = useRouter();
  const { locale } = useParams();
  const toast = useToast();

  const resetMutation = useSmartMutation(useResetPassword(), {
    onSuccess: () => {
      toast.success(t('successReset'));
      router.push(`/${locale}/login?reset=success`);
    },
    onError: (error: any) => {
      onError(error);
    },
  });

  const onSubmit = (data: ResetPasswordInput) => {
    if (!email) {
      const error = { response: { data: { message: 'Email is missing. Please restart the process.' } } };
      onError(error);
      resetMutation.setServerError(error.response.data.message);
      return;
    }
    resetMutation.mutate({ email, password: data.password });
  };

  return (
    <SmartForm
      schema={resetPasswordSchema}
      defaultValues={{ password: '', confirmPassword: '' }}
      onSubmit={onSubmit}
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
