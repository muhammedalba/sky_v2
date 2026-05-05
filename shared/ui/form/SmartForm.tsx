'use client';

import React from 'react';
import { useForm, FormProvider, FieldValues, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodType } from 'zod';
import ErrorMessage from '@/shared/ui/ErrorMessage';
import SuccessMessage from '@/shared/ui/SuccessMessage';

interface SmartFormProps<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: DefaultValues<T>;
  onSubmit: (data: T) => Promise<void> | void;
  isLoading?: boolean;
  successMessage?: string | null;
  networkErrorMessage?: string | null;
  children: React.ReactNode;
  className?: string;
}

export function SmartForm<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  successMessage,
  children,
  networkErrorMessage = 'حدث خطأ في الاتصال يرجى المحاولة مرة أخرى',
  className = "space-y-5",
}: SmartFormProps<T>) {
  const methods = useForm<T>({
    resolver: zodResolver(schema as any) as any,
    defaultValues,
  });

  const handleFormSubmit = async (data: T) => {
    try {
      methods.clearErrors('root.serverError');
      await onSubmit(data);
    } catch (error: any) {
      const errorMessage = error?.message.trim() === "Network Error" ? networkErrorMessage : error?.message;
      methods.setError('root.serverError', {
        type: 'server',
        message: errorMessage,
      });
    }
  };

  const serverError = methods.formState.errors.root?.serverError?.message;

  return (
    <div className="w-full">
      {serverError && <ErrorMessage showIcon={true} message={serverError as string} className="mb-6 animate-in slide-in-from-top-1 px-4 py-3 rounded-2xl" />}
      {successMessage && <SuccessMessage message={successMessage} className="mb-6 animate-in slide-in-from-top-1 px-4 py-3 rounded-2xl" />}

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleFormSubmit)} className={className}>
          {children}
        </form>
      </FormProvider>
    </div>
  );
}
