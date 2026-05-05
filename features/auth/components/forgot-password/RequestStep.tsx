'use client';

import { useForgotPassword } from '@/features/auth/hooks/useAuth';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/features/auth/auth.schema';
import { Button } from '@/shared/ui/Button';
import { useTranslations } from 'next-intl';
import { useToast } from '@/shared/hooks/useToast';
import { SmartForm } from '@/shared/ui/form/SmartForm';
import { SmartInput } from '@/shared/ui/form/SmartFields';

interface RequestStepProps {
  onSuccess: (email: string) => void;
}

const RequestStep = ({ onSuccess }: RequestStepProps) => {
  const t = useTranslations('auth');
  const toast = useToast();

  const forgotMutation = useForgotPassword();

  const onSubmit = async (data: ForgotPasswordInput) => {
    await forgotMutation.mutateAsync(data.email, {
      onSuccess: () => {
        onSuccess(data.email);
        toast.success(t('codeSentSuccessfully'));
      }
    });
  };

  return (
    <SmartForm
      schema={forgotPasswordSchema}
      defaultValues={{ email: '' }}
      networkErrorMessage={t("serverError")}
      onSubmit={onSubmit}
      className="space-y-5 animate-in fade-in slide-in-from-right-4"
    >
      <SmartInput
        name="email"
        type="email"
        disabled={forgotMutation.isPending}
        label={t('email')}
        className="h-12 px-4"
      />
      <Button
        type="submit"
        className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
        size="lg"
        isLoading={forgotMutation.isPending}
      >
        {t('sendCode')}
      </Button>
    </SmartForm>
  );
};

export default RequestStep;
