'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import { ReactNode, useState, useEffect } from 'react';

interface LocaleProviderProps {
  children: ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
}

export default function LocaleProvider({ children, locale, messages }: LocaleProviderProps) {
  useEffect(() => {
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider  client={queryClient}>
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
        {children}
      </NextIntlClientProvider>
    </QueryClientProvider>
  );
}
