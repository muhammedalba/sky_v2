'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForgotPassword } from '@/hooks/api/useAuth';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/schemas';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/useToast';

interface RequestStepProps {
  onSuccess: (email: string) => void;
  onError: (error: any) => void;
}

const RequestStep = ({ onSuccess, onError }: RequestStepProps) => {
  const t = useTranslations('auth');
  const tErrors = useTranslations('errors');
  const forgotMutation = useForgotPassword();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const emailValue = watch('email');

  const onSubmit = (data: ForgotPasswordInput) => {
    forgotMutation.mutate(data.email, {
      onSuccess: () => {
        onSuccess(data.email);
        toast.success(t('codeSentSuccessfully'));
      },
      onError: (error: any) => {
        onError(error);
        toast.error(error?.response?.data?.message || tErrors('serverError'));
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-in fade-in slide-in-from-right-4">
      <div className="space-y-2">
        <Input
          type="email"
          value={emailValue}
          disabled={forgotMutation.isPending}
          error={errors.email?.message ? tErrors(errors.email.message) : undefined}
          label={t('email')}
          className="h-12 px-4"
          {...register('email')}
        />
      </div>
      <Button 
        type="submit" 
        className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all" 
        size="lg"
        isLoading={forgotMutation.isPending}
      >
        {t('sendCode')}
      </Button>
    </form>
  );
};

export default RequestStep;
