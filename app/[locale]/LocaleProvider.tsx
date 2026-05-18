'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import { ReactNode, useEffect } from 'react';
import { queryClient } from '@/lib/api/query-client';

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

  return (
    <QueryClientProvider  client={queryClient}>
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
        {children}
      </NextIntlClientProvider>
    </QueryClientProvider>
  );
}
