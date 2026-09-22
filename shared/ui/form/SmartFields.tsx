'use client';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Input } from '@/shared/ui/Input';
import PasswordInput from '@/shared/ui/PasswordInput';

interface BaseFieldProps {
  name: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  disabled?: boolean;
  errorNamespace?: string;
  showStrength?: boolean;
}

export function SmartInput({
  name,
  errorNamespace = 'errors',
  // Destructured only to keep it out of `...props` (SmartInput doesn't render
  // a strength meter, unlike SmartPasswordInput below).
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showStrength,
  ...props
}: BaseFieldProps & { type?: string }) {
  const { register, formState: { errors }, control } = useFormContext();
  const tErrors = useTranslations(errorNamespace);
  
  const value = useWatch({ control, name });
  const error = errors[name]?.message as string | undefined;

  return (
    <div className="my-2">
    <Input
      {...register(name)}
      {...props}
      value={value}
      error={error ? tErrors(error as Parameters<typeof tErrors>[0]) : undefined}
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
      error={error ? tErrors(error as Parameters<typeof tErrors>[0]) : undefined}
      showStrength={showStrength}
    />
  );
}
