import React, { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import Pagination from '@/components/ui/Pagination';
import { Icons } from '@/components/ui/Icons';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export interface Column<T> {
  header: string;
  className?: string;
  render?: (item: T) => ReactNode;
  accessor?: keyof T;
}

interface EntityDataTableProps<T> {
  data?: T[];
  isLoading: boolean;
  columns: Column<T>[];
  metadata?: {
    numberOfPages: number;
    count?: number;
  };
  page: number;
  onPageChange: (page: number) => void;
  emptyState?: {
    title?: string;
    description?: string;
    icon?: ReactNode;
    createLink?: string;
    createLabel?: string;
  };
}

export default function EntityDataTable<T extends { _id: string }>({
  data,
  isLoading,
  columns,
  metadata,
  page,
  onPageChange,
  emptyState,
}: EntityDataTableProps<T>) {
  const tCommon = useTranslations('common');

  return (
    <Card className="border-none shadow-xl shadow-foreground/5 bg-background/50 backdrop-blur-md ring-1 ring-border/40 overflow-hidden rounded-3xl">
      <div className="overflow-x-auto">
        <Table className="border-none shadow-none rounded-none">
          <TableHeader className="bg-muted/30 border-b border-border/40">
            <TableRow className="hover:bg-transparent border-none">
              {columns.map((col, idx) => (
                <TableHead
                  key={idx}
                  className={cn(
                    "h-12 text-[11px] uppercase tracking-wider font-bold text-muted-foreground/80",
                    idx === 0 && "pl-6",
                    idx === columns.length - 1 && "pr-6 text-right",
                    col.className
                  )}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <TableRow key={i} className="border-b border-border/20 last:border-0 h-20">
                  {columns.map((_, idx) => (
                    <TableCell key={idx} className={cn(idx === 0 && "pl-6", idx === columns.length - 1 && "pr-6")}>
                      <Skeleton className={cn("h-6 rounded-lg", idx === 0 ? "w-14 h-14 rounded-2xl" : "w-full")} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.length ? (
              data.map((item) => (
                <TableRow
                  key={item._id}
                  className="group hover:bg-muted/40 transition-all duration-300 border-b border-border/20 last:border-0 h-20 relative overflow-hidden"
                >
                  {columns.map((col, idx) => (
                    <TableCell
                      key={idx}
                      className={cn(
                        idx === 0 && "pl-6",
                        idx === columns.length - 1 && "pr-6 text-right",
                        col.className
                      )}
                    >
                      {col.render ? col.render(item) : (col.accessor ? String(item[col.accessor]) : null)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in-95 duration-500">
                    <div className="p-4 rounded-3xl bg-muted/30 ring-1 ring-border/20">
                      {emptyState?.icon || <Icons.Brands className="h-10 w-10 text-muted-foreground/40" />}
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-foreground">
                        {emptyState?.title || tCommon('messages.noData')}
                      </p>
                      {emptyState?.description && (
                        <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                          {emptyState.description}
                        </p>
                      )}
                    </div>
                    {emptyState?.createLink && (
                      <Link href={emptyState.createLink}>
                        <Button variant="outline" size="sm" className="rounded-xl px-6">
                          {emptyState.createLabel || tCommon('buttons.create')}
                        </Button>
                      </Link>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {metadata && metadata.numberOfPages > 1 && (
        <div className="p-5 border-t border-border/20 bg-muted/20 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60">
            {tCommon('messages.showingPage', { page, total: metadata.numberOfPages })}
          </p>
          <Pagination
            currentPage={page}
            totalPages={metadata.numberOfPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </Card>
  );
}
