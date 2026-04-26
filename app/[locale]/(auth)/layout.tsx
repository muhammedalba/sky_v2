
import { ReactNode } from 'react';
import AuthNavbar from '@/widgets/layout/AuthNavbar';
import StoreFooter from '@/widgets/layout/StoreFooter';
interface AuthLayoutProps {
  children: ReactNode;
}

export default async function AuthLayout({
  children,
}: AuthLayoutProps) {

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans antialiased">
      <AuthNavbar />
      <main className="flex-1 ">
        {children}
      </main>
      <StoreFooter />
    </div>
  );
}
