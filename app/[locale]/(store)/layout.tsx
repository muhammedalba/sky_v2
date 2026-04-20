'use client';

import { ReactNode } from 'react';
import StoreNavbar from '@/widgets/layout/StoreNavbar';
import StoreFooter from '@/widgets/layout/StoreFooter';

interface StoreLayoutProps {
  children: ReactNode;
}

export default function StoreLayout({ children }: StoreLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans antialiased">
      <StoreNavbar />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <StoreFooter />
    </div>
  );
}
