
import { getMessages } from 'next-intl/server';
import { ReactNode } from 'react';
import { locales } from '@/i18n';
import { notFound } from 'next/navigation';
import LocaleProvider from './LocaleProvider';
import ThemeProvider from '@/app/providers/ThemeProvider';
import ToastProvider from '@/shared/ui/toast/ToastProvider';
import '../globals.css';


export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;



  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <LocaleProvider  locale={locale} messages={messages} >
      <ThemeProvider >
        <ToastProvider />
        {children}
      </ThemeProvider>
    </LocaleProvider>
  );
}
