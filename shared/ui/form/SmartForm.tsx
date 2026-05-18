'use client';

import React from 'react';
import { useForm, FormProvider, FieldValues, DefaultValues, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodType } from 'zod';
import ErrorMessage from '@/shared/ui/ErrorMessage';
import SuccessMessage from '@/shared/ui/SuccessMessage';

interface SmartFormProps<T extends FieldValues> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: ZodType<T, any>;
  defaultValues: DefaultValues<T>;
  onSubmit: (data: T) => Promise<void> | void;
  isLoading?: boolean;
  successMessage?: string | null;
  networkErrorMessage?: string | null;
  children: React.ReactNode;
  className?: string;
  isRegistrationDisabled?: boolean;
}

export function SmartForm<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  successMessage,
  children,
  networkErrorMessage = 'حدث خطأ في الاتصال يرجى المحاولة مرة أخرى',
  className = "space-y-5",
  isRegistrationDisabled = false,
}: SmartFormProps<T>) {
  const methods = useForm<T>({
    resolver: zodResolver(schema) as unknown as Resolver<T>,
    defaultValues,
  });

  const handleFormSubmit = async (data: T) => {
    try {
      methods.clearErrors('root.serverError');
      await onSubmit(data);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : (error as { message?: string })?.message || '';
      const errorMessage = msg.trim() === "Network Error" ? networkErrorMessage : msg;
      methods.setError('root.serverError', {
        type: 'server',
        message: errorMessage || 'حدث خطأ غير متوقع',
      });
    }
  };

  const serverError = methods.formState.errors.root?.serverError?.message;

  return (
    <div className="w-full">
      {serverError  && <ErrorMessage showIcon={true} message={serverError as string} className="mb-6 animate-in slide-in-from-top-1 px-4 py-3 rounded-2xl" />}
      {successMessage && <SuccessMessage showIcon={false} message={successMessage} className={`mb-6 animate-in slide-in-from-top-1 px-4 py-3 rounded-2xl ${isRegistrationDisabled ? "bg-warning/10 text-warning border-warning/30 font-bold" : ""}`} />}

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleFormSubmit)} className={className}> 
          {children}
        </form>
      </FormProvider>
    </div>
  );
}
