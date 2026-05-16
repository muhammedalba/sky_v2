'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Icons } from '@/shared/ui/Icons';

interface SettingsSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function SettingsSidebar({ activeSection, onSectionChange }: SettingsSidebarProps) {
  const t = useTranslations('settings');

  // Axis 2.2: Memoizing navigation items to prevent recreation on every render
  const navItems = useMemo(() => [
    { id: 'general', label: t('sidebar.general'), icon: Icons.Dashboard, iconClass: "text-primary" },
    { id: 'seo', label: t('sidebar.seo'), icon: Icons.Search, iconClass: "text-destructive" },
    { id: 'social', label: t('sidebar.social'), icon: Icons.Sun, iconClass: "text-primary" },
    { id: 'contact', label: t('sidebar.contact'), icon: Icons.MessageCircle, iconClass: "text-warning/70" },
    { id: 'payments', label: t('sidebar.payments'), icon: Icons.Orders, iconClass: "text-success" },
    { id: 'shipping', label: t('sidebar.shipping'), icon: Icons.Truck, iconClass: "text-primary" },
    { id: 'features', label: t('sidebar.features'), icon: Icons.Layout, iconClass: "text-warning" },
    { id: 'advanced', label: t('sidebar.advanced'), icon: Icons.Settings, iconClass: "text-foreground/70" },
  ], [t]);

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSectionChange(item.id)}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200",
            activeSection === item.id
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <item.icon className={cn(
            "w-5 h-5",
            activeSection === item.id ? "text-primary-foreground" :item.iconClass
          )} />
          {item.label}
        </button>
      ))}
    </nav>
  );
}
