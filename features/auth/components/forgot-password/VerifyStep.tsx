'use client';

import { useVerifyResetCode } from '@/features/auth/hooks/useAuth';
import { verifyResetCodeSchema, type VerifyResetCodeInput } from '@/features/auth/auth.schema';
import { Button } from '@/shared/ui/Button';
import { useTranslations } from 'next-intl';
import { useToast } from '@/shared/hooks/useToast';
import { SmartForm } from '@/shared/ui/form/SmartForm';
import { SmartInput } from '@/shared/ui/form/SmartFields';

interface VerifyStepProps {
  onSuccess: () => void;
  onChangeEmail: () => void;
}
 
const VerifyStep = ({ onSuccess, onChangeEmail }: VerifyStepProps) => {
  const t = useTranslations('auth');
  const toast = useToast();

  const verifyMutation = useVerifyResetCode();

  const onSubmit = async (data: VerifyResetCodeInput) => {
    await verifyMutation.mutateAsync(data.resetCode, {
      onSuccess: () => {
        onSuccess();
        toast.success(t('resetSuccess'));
      }
    });
  };

  return (
    <SmartForm
      schema={verifyResetCodeSchema}
      defaultValues={{ resetCode: '' }}
      onSubmit={onSubmit}
      networkErrorMessage={t("serverError")}
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
