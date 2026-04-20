'use client';

import React, { useState } from 'react';
import { useForm, FormProvider, FieldValues, DefaultValues, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';
import { useTranslations } from 'next-intl';
import { AxiosError } from 'axios';
import ErrorMessage from '@/shared/ui/ErrorMessage';
import SuccessMessage from '@/shared/ui/SuccessMessage';

interface SmartFormProps<T extends FieldValues> {
  schema: ZodSchema<T>;
  defaultValues: DefaultValues<T>;
  onSubmit: (data: T) => void;
  isLoading?: boolean;
  serverError?: string | null;
  successMessage?: string | null;
  children: React.ReactNode;
  className?: string;
}

export function SmartForm<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  serverError,
  successMessage,
  children,
  className = "space-y-5",
}: SmartFormProps<T>) {
  const methods = useForm<T>({
    resolver: zodResolver(schema as any) as any,
    defaultValues,
  });

  return (
    <div className="w-full">
      {serverError && <ErrorMessage showIcon={true} message={serverError} className="mb-6 animate-in slide-in-from-top-1 px-4 py-3 rounded-2xl" />}
      {successMessage && <SuccessMessage  message={successMessage} className="mb-6 animate-in slide-in-from-top-1 px-4 py-3 rounded-2xl" />}
      
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit as SubmitHandler<T>)} className={className}>
          {children}
        </form>
      </FormProvider>
    </div>
  );
}

/**
 * Hook to handle common mutation logic with SmartForm
 */
export const useSmartMutation = <TData, TError, TVariables>(
  mutation: any,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: TError) => void;
    errorNamespace?: string;
  } = {}
) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const tErrors = useTranslations(options.errorNamespace || 'errors');

  const mutate = (variables: TVariables) => {
    setServerError(null);
    mutation.mutate(variables, {
      onSuccess: (data: TData) => {
        if (options.onSuccess) options.onSuccess(data, variables);
      },
      onError: (err: any) => {
        const error = err as AxiosError<{ message: string }>;
        const message = error.response?.data?.message || tErrors('serverError');
        setServerError(message);
        if (options.onError) options.onError(err);
      },
    });
  };

  return {
    ...mutation,
    mutate,
    serverError,
    setServerError,
  };
};
