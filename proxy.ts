import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';
import { env } from './lib/env';

export default createMiddleware({
  locales,
  defaultLocale: (env.DEFAULT_LOCALE as 'en' | 'ar'),
  localePrefix: 'always',
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
