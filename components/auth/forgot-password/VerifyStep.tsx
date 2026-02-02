'use client';

import { useVerifyResetCode } from '@/hooks/api/useAuth';
import { verifyResetCodeSchema, type VerifyResetCodeInput } from '@/lib/validations/schemas';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/useToast';
import { SmartForm, useSmartMutation } from '@/components/ui/form/SmartForm';
import { SmartInput } from '@/components/ui/form/SmartFields';

interface VerifyStepProps {
  onSuccess: () => void;
  onError: (error: any) => void;
  onChangeEmail: () => void;
}
 
const VerifyStep = ({ onSuccess, onError, onChangeEmail }: VerifyStepProps) => {
  const t = useTranslations('auth');
  const toast = useToast();

  const verifyMutation = useSmartMutation(useVerifyResetCode(), {
    onSuccess: () => {
      onSuccess();
      toast.success(t('resetSuccess'));
    },
    onError: (error: any) => {
      onError(error);
    },
  });

  return (
    <SmartForm
      schema={verifyResetCodeSchema}
      defaultValues={{ resetCode: '' }}
      onSubmit={(data) => verifyMutation.mutate(data.resetCode)}
      className="space-y-6 animate-in fade-in slide-in-from-right-4"
    >
      <SmartInput
        name="resetCode"
        disabled={verifyMutation.isPending}
        label={t('verificationCode')}
        className="h-16 text-center text-3xl font-black tracking-[0.5em]"
      />
      <Button 
        type="submit" 
        className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] transition-all" 
        size="lg"
        isLoading={verifyMutation.isPending}
      >
        {t('verifyCode')}
      </Button>
      <button
        type="button"
        onClick={onChangeEmail}
        className="w-full text-muted-foreground hover:text-primary text-sm font-bold transition-colors py-2"
      >
        {t('changeEmail')}
      </button>
    </SmartForm>
  );
};

export default VerifyStep;
