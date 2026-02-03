import { redirect } from 'next/navigation';
import { env } from '@/lib/env';

export default function RootPage() {
  const defaultLocale = env.DEFAULT_LOCALE;
  redirect(`/${defaultLocale}/home`);
}
