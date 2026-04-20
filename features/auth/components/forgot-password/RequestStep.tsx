'use client';

import { useForgotPassword } from '@/hooks/api/useAuth';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/schemas';
import { Button } from '@/shared/ui/Button';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/useToast';
import { SmartForm, useSmartMutation } from '@/shared/ui/form/SmartForm';
import { SmartInput } from '@/shared/ui/form/SmartFields';

interface RequestStepProps {
  onSuccess: (email: string) => void;
  onError: (error: any) => void;
}

const RequestStep = ({ onSuccess, onError }: RequestStepProps) => {
  const t = useTranslations('auth');
  const toast = useToast();

  const forgotMutation = useSmartMutation<any, any, string>(useForgotPassword(), {
    onSuccess: (_data: any, email: string) => {
      onSuccess(email);
      toast.success(t('codeSentSuccessfully'));
    },
    onError: (error: any) => {
      onError(error);
    },
  });

  return (
    <SmartForm
      schema={forgotPasswordSchema}
      defaultValues={{ email: '' }}
      onSubmit={(data) => forgotMutation.mutate(data.email)}
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
