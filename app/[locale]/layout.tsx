
import { getMessages } from 'next-intl/server';
import { cookies } from 'next/headers';
import { ReactNode } from 'react';
import { locales } from '@/i18n';
import { notFound } from 'next/navigation';
import LocaleProvider from './LocaleProvider';
import ThemeProvider from '@/components/providers/ThemeProvider';
import ToastProvider from '@/components/ui/toast/ToastProvider';
import '../globals.css';


export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value;
  const isDark = theme === 'dark';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  const messages = await getMessages();

  return (
    <html lang={locale} dir={direction} className={isDark ? 'dark' : ''} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <LocaleProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <ToastProvider />
            {children}
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
