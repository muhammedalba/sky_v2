import { redirect } from 'next/navigation';

export default function RootPage() {
  const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en';
  redirect(`/${defaultLocale}/home`);
}
