'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useUsers } from '@/hooks/api/useUsers';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Card } from '@/components/ui/Card';
import Pagination from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Icons } from '@/components/ui/Icons';
import { formatDate } from '@/lib/utils';
import { User } from '@/types';

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const t = useTranslations('users');

  const { data, isLoading } = useUsers({ page, limit: 10 });

  const getRoleBadgeVariant = (role: string): any => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'manager':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-lg font-medium mt-1">
            {t('userList')}
          </p>
        </div>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/30">
               <TableRow>
                 <TableHead className="font-bold">{t('fields.name')}</TableHead>
                 <TableHead className="font-bold">{t('fields.email')}</TableHead>
                 <TableHead className="font-bold">{t('fields.role')}</TableHead>
                 <TableHead className="font-bold">{t('fields.createdAt')}</TableHead>
                 <TableHead className="font-bold">Status</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {isLoading ? (
                 Array(6).fill(0).map((_, i) => (
                   <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                   </TableRow>
                 ))
               ) : data?.data?.length ? (
                 data.data.map((user: User) => (
                   <TableRow key={user._id} className="group hover:bg-secondary/10 transition-colors">
                      <TableCell>
                         <div className="flex items-center gap-3 py-1">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                               {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-sm">{user.name}</span>
                         </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm font-medium">{user.email}</TableCell>
                      <TableCell>
                         <Badge variant={getRoleBadgeVariant(user.role)} className="rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest border-none">
                            {user.role}
                         </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm font-medium">{user.createdAt ? formatDate(user.createdAt) : '-'}</TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", user.active !== false ? "bg-green-500" : "bg-red-500")} />
                            <span className="text-xs font-bold">{user.active !== false ? 'Active' : 'Banned'}</span>
                         </div>
                      </TableCell>
                   </TableRow>
                 ))
               ) : (
                 <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-medium">
                       No users registered yet.
                    </TableCell>
                 </TableRow>
               )}
            </TableBody>
          </Table>
        </div>

        {data?.metadata && data.metadata.numberOfPages > 1 && (
          <div className="p-4 border-t border-border bg-secondary/10 flex items-center justify-between">
            <p className="text-sm text-muted-foreground font-medium">
               Displaying page {page}
            </p>
            <Pagination
              currentPage={page}
              totalPages={data.metadata.numberOfPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
}

// Inline helper because it was missing in scope in previous snippets
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
