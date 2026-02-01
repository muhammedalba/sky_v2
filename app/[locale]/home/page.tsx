import { use } from 'react';
import { generatePageMetadata } from '@/lib/seo';
import HomeClient from './HomeClient';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return generatePageMetadata({
    locale,
    namespace: 'home',
    canonicalPath: '', // Home is root
  });
}

export default function HomePage({ params }: Props) {
  const { locale } = use(params);
  return <HomeClient locale={locale} />;
}
