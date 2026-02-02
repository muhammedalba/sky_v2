'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useVerifyResetCode } from '@/hooks/api/useAuth';
import { verifyResetCodeSchema, type VerifyResetCodeInput } from '@/lib/validations/schemas';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/useToast';

interface VerifyStepProps {
  onSuccess: () => void;
  onError: (error: any) => void;
  onChangeEmail: () => void;
}
 
const VerifyStep = ({ onSuccess, onError, onChangeEmail }: VerifyStepProps) => {
  const t = useTranslations('auth');
  const tErrors = useTranslations('errors');
  const verifyMutation = useVerifyResetCode();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<VerifyResetCodeInput>({
    resolver: zodResolver(verifyResetCodeSchema),
    defaultValues: { resetCode: '' },
  });

  const resetCodeValue = watch('resetCode');

  const onSubmit = (data: VerifyResetCodeInput) => {
    verifyMutation.mutate(data.resetCode, {
      onSuccess: () => {
        onSuccess();
        toast.success(t('resetSuccess'));
      },
      onError: (error: any) => {
        onError(error);
        toast.error(error?.response?.data?.message || tErrors('serverError'));
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="space-y-4 text-center">
        <Input
          type="text"
          value={resetCodeValue}
          disabled={verifyMutation.isPending}
          label={t('verificationCode')}
          error={errors.resetCode?.message ? tErrors(errors.resetCode.message) : undefined}
          className="h-16 text-center text-3xl font-black tracking-[0.5em]"
          {...register('resetCode')}
        />
      </div>
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
    </form>
  );
};

export default VerifyStep;
