'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useUsers } from '@/hooks/api/useUsers';
import EntityDataTable from '@/components/dashboard/EntityDataTable';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Icons } from '@/components/ui/Icons';

import { cn, formatDate } from '@/lib/utils';
import { User } from '@/types';

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const t = useTranslations('users');

  const { data, isLoading } = useUsers({ page, limit: 10 });

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            {t('userList')}
          </p>
        </div>
      </div>

      <EntityDataTable<User>
        data={data?.data}
        isLoading={isLoading}
        metadata={data?.metadata}
        page={page}
        onPageChange={setPage}
        columns={[
          {
            header: t('fields.name'),
            className: "pl-6",
            render: (user: User) => (
              <div className="flex items-center gap-3 py-1">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg ring-1 ring-primary/20 shadow-sm group-hover:scale-110 transition-transform">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter opacity-70">
                    ID: {user._id.substring(0, 8)}...
                  </span>
                </div>
              </div>
            )
          },
          {
            header: t('fields.email'),
            render: (user: User) => (
              <span className="text-muted-foreground text-sm font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                {user.email}
              </span>
            )
          },
          {
            header: t('fields.role'),
            render: (user: User) => (
              <Badge variant={getRoleBadgeVariant(user.role)} className="rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest border-none">
                {user.role}
              </Badge>
            )
          },
          {
            header: t('fields.createdAt'),
            render: (user: User) => (
              <span className="text-muted-foreground text-sm font-bold lowercase tracking-tight">
                {user.createdAt ? formatDate(user.createdAt) : '-'}
              </span>
            )
          },
          {
            header: "Status",
            className: "pr-6",
            render: (user: User) => (
              <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-xl w-fit group-hover:bg-muted/50 transition-colors">
                <div className={cn("w-2 h-2 rounded-full shadow-sm animate-pulse", user.active !== false ? "bg-green-500 shadow-green-500/50" : "bg-red-500 shadow-red-500/50")} />
                <span className="text-xs font-black uppercase tracking-wider text-foreground/80">
                  {user.active !== false ? 'Active' : 'Banned'}
                </span>
              </div>
            )
          }
        ]}
        emptyState={{
          title: "No users found",
          description: "Registered users will appear here once they join your platform.",
          icon: <Icons.Menu className="h-10 w-10 text-muted-foreground/40" />,
        }}
      />
    </div>
  );
}


