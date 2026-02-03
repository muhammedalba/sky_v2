'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/store/ui-store';
import { Icons } from '@/components/ui/Icons';
import { cn } from '@/lib/utils';

interface SidebarNavProps {
  navigation: {
    name: string;
    href: string;
    icon: keyof typeof Icons;
    color?: string;
  }[];
  onNavigate?: () => void;
}

export default function SidebarNav({ navigation, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const { sidebarCollapsed } = useUIStore();
  const isCollapsed = sidebarCollapsed;

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
      {navigation.map((item) => {
        const Icon = Icons[item.icon];
        const isActive = pathname === item.href || (item.href.includes('dashboard') && pathname.startsWith(item.href) && item.href !== pathname.split('/').slice(0, 3).join('/'));
        // Special case for dashboard root
        const isDashboardRoot = item.href.endsWith('/dashboard');
        const active = isDashboardRoot ? pathname === item.href : pathname.startsWith(item.href);

        // Color mapping
        const colorMap: Record<string, string> = {
          blue: 'text-blue-500',
          emerald: 'text-emerald-500',
          orange: 'text-orange-500',
          amber: 'text-amber-500',
          purple: 'text-purple-500',
          cyan: 'text-cyan-500',
          rose: 'text-rose-500',
          sky: 'text-sky-500',
          pink: 'text-pink-500',
          violet: 'text-violet-500',
          indigo: 'text-indigo-500',
          teal: 'text-teal-500',
          slate: 'text-slate-500',
        };
        const itemColorClass = colorMap[item.color || 'slate'];

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={isCollapsed ? item.name : undefined}
            className={cn(
              'group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 relative border border-transparent',
              active
                ? 'bg-primary text-white shadow-lg shadow-primary/25 font-bold border'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
              isCollapsed ? 'justify-center mx-1 px-0' : 'mx-2'
            )}
          >
            <div className={cn(
              "flex items-center justify-center transition-all duration-300",
              active ? "text-white" : itemColorClass
            )}>
              <Icon className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
            </div>
            
            {!isCollapsed && (
              <span className="text-sm tracking-wide">
                {item.name}
              </span>
            )}

            {active && !isCollapsed && (
              <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            )}
            
            {!active && !isCollapsed && (
              <div className={cn(
                "absolute right-3 w-1 h-1 rounded-full opacity-0 group-hover:opacity-40 transition-opacity",
                itemColorClass.replace('text', 'bg')
              )} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
