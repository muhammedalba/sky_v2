'use client';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Input } from '@/shared/ui/Input';
import PasswordInput from '@/shared/ui/PasswordInput';
import { LucideIcon } from 'lucide-react';

interface BaseFieldProps {
  name: string;
  label: string;
  icon?: LucideIcon;
  className?: string;
  disabled?: boolean;
  errorNamespace?: string;
  showStrength?: boolean;
}

export function SmartInput({ 
  name, 
  errorNamespace = 'errors',
  showStrength = true,
  ...props 
}: BaseFieldProps & { type?: string }) {
  const { register, formState: { errors }, control } = useFormContext();
  const tErrors = useTranslations(errorNamespace);
  
  const value = useWatch({ control, name });
  const error = errors[name]?.message as string | undefined;

  return (
    <div className="my-7">
    <Input
      {...register(name)}
      {...props}
      value={value}
      error={error ? tErrors(error as any) : undefined}
    />
    </div>
  );
}

export function SmartPasswordInput({ 
  name, 
  errorNamespace = 'errors',
  showStrength,
  ...props 
}: BaseFieldProps) {
  const { register, formState: { errors }, control } = useFormContext();
  const tErrors = useTranslations(errorNamespace);
  const value = useWatch({ control, name });
  const error = errors[name]?.message as string | undefined;

  return (
    <PasswordInput
      {...register(name)}
      {...props}
      value={value}
      error={error ? tErrors(error as any) : undefined}
      showStrength={showStrength}
    />
  );
}
