import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import DashboardClientLayout from './DashboardClientLayout';

interface DashboardLayoutProps {
  children: ReactNode;
  locale: string;
}

export default function DashboardLayout({ children, locale }: DashboardLayoutProps) {
  const isRTL = locale === 'ar';

  return (
    <DashboardClientLayout
      isRTL={isRTL}
      sidebar={<Sidebar mode="desktop" locale={locale} />}
      mobileSidebar={<Sidebar mode="mobile" locale={locale} />}
      topbar={<Topbar locale={locale} />}
    >
      {children}
    </DashboardClientLayout>
  );
}
