'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useResetPassword } from '@/hooks/api/useAuth';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/schemas';
import PasswordInput from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import { Lock } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/useToast';

interface ResetStepProps {
  email: string;
  onError: (error: any) => void;
}

const ResetStep = ({ email, onError }: ResetStepProps) => {
  const t = useTranslations('auth');
  const tErrors = useTranslations('errors');
  const router = useRouter();
  const { locale } = useParams();
  const resetMutation = useResetPassword();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password');
  const confirmPasswordValue = watch('confirmPassword');

  const onSubmit = (data: ResetPasswordInput) => {
    if (!email) {
      onError({ response: { data: { message: 'Email is missing. Please restart the process.' } } });
      return;
    }
    resetMutation.mutate({ email, password: data.password }, {
      onSuccess: () => {
        toast.success(t('successReset'));
        router.push(`/${locale}/login?reset=success`);
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
        <PasswordInput
          icon={Lock}
          value={passwordValue}
          label={t('newPassword')}
          disabled={resetMutation.isPending}
          error={errors.password?.message ? tErrors(errors.password.message) : undefined}
          className="h-12 px-4"
          {...register('password')}
        />
      </div>
      <div className="space-y-2">
        <PasswordInput
          icon={Lock}
          value={confirmPasswordValue}
          label={t('confirmPassword')}
          disabled={resetMutation.isPending}
          error={errors.confirmPassword?.message ? tErrors(errors.confirmPassword.message) : undefined}
          className="h-12 px-4"
          {...register('confirmPassword')}
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
    </form>
  );
};

export default ResetStep;
