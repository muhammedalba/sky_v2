'use client';

import { ReactNode } from 'react';
import StoreNavbar from './StoreNavbar';
import StoreFooter from './StoreFooter';

interface StoreLayoutProps {
  children: ReactNode;
  locale: string;
}

export default function StoreLayout({ children, locale }: StoreLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans antialiased">
      <StoreNavbar locale={locale} />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <StoreFooter locale={locale} />
    </div>
  );
}
