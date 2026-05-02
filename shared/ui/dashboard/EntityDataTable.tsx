import React, { ReactNode, useState, Fragment } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/Table';
import { Card } from '@/shared/ui/Card';
import { Skeleton } from '@/shared/ui/Skeleton';
import Pagination, { PaginationData } from '@/shared/ui/Pagination';
import { Icons } from '@/shared/ui/Icons';
import { Button } from '@/shared/ui/Button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export interface Column<T> {
  header: string;
  className?: string;
  render?: (item: T, index: number) => ReactNode;
  accessor?: keyof T;
}

export interface EntityDataTableProps<T> {
  data?: T[];
  isLoading: boolean;
  columns: Column<T>[];
  pagination?: PaginationData;
  onPageChange?: (page: number) => void;
  emptyState?: {
    title?: string;
    description?: string;
    icon?: ReactNode;
    createLabel?: string;
    createLink?: () => void;
  };
  expandableContent?: (item: T) => ReactNode;
}

export default function EntityDataTable<T extends { _id: string }>({
  data,
  isLoading,
  columns,
  pagination,
  onPageChange,
  emptyState,
  expandableContent,
}: EntityDataTableProps<T>) {

  const tCommon = useTranslations('common');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
                    'h-12 text-[11px] uppercase tracking-wider font-bold text-muted-foreground/80',
                    idx === 0 && 'ps-6',
                    idx === columns.length - 1 && !expandableContent && 'pe-6 text-end',
                    col.className,
                  )}
                >
                  {col.header}
                </TableHead>
              ))}
              {expandableContent && <TableHead className="w-10 pe-6 text-end"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(columns.length)
                .fill(0)
                .map((_, i) => (
                  <TableRow
                    key={i}
                    className="border-b border-border/20 last:border-0 h-20"
                  >
                    {columns.map((_, idx) => (
                      <TableCell
                        key={idx}
                        className={cn(
                          idx === 0 && 'ps-6',
                          idx === columns.length - 1 && 'pe-6',
                        )}
                      >
                        <Skeleton
                          className={cn(
                            'h-6 rounded-lg',
                            idx === 0
                              ? 'w-14 h-14 rounded-2xl'
                              : 'w-full',
                          )}
                        />
                      </TableCell>
                    ))}
                    {expandableContent && <TableCell></TableCell>}
                  </TableRow>
                ))
            ) : data?.length ? (
              data.map((item, rowIdx) => (
                <Fragment key={item._id}>
                  <TableRow
                    className="group hover:bg-muted/40 transition-all duration-300 border-b border-border/20 last:border-0 h-20 relative overflow-hidden"
                  >
                    {columns.map((col, idx) => (
                      <TableCell
                        key={idx}
                        className={cn(
                          idx === 0 && 'ps-6',
                          idx === columns.length - 1 && !expandableContent && 'pe-6 text-end',
                          col.className,
                        )}
                      >
                        {col.render
                          ? col.render(item, rowIdx)
                          : col.accessor
                            ? String(item[col.accessor])
                            : null}
                      </TableCell>
                    ))}
                    {expandableContent && (
                      <TableCell className="pe-6 text-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full hover:bg-muted/50"
                          onClick={() => toggleRow(item._id)}
                        >
                          {expandedRows[item._id] ? (
                            <Icons.ChevronLeft className="h-4 w-4 -rotate-90 transition-transform" />
                          ) : (
                            <Icons.ChevronRight className="h-4 w-4 rotate-90 rtl:-rotate-90 transition-transform" />
                          )}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                  {expandableContent && expandedRows[item._id] && (
                    <TableRow className="bg-muted/10 hover:bg-muted/10 border-b border-border/20">
                      <TableCell colSpan={columns.length + 1} className="p-0">
                        <div className="p-4 px-6 animate-in slide-in-from-top-2 fade-in duration-200">
                          {expandableContent(item)}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + (expandableContent ? 1 : 0)} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in-95 duration-500">
                    <div className="p-4 rounded-3xl bg-muted/30 ring-1 ring-border/20">
                      {emptyState?.icon || (
                        <Icons.Brands className="h-10 w-10 text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-bold title-gradient">
                        {emptyState?.title || tCommon('messages.noData')}
                      </p>
                      {emptyState?.description && (
                        <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                          {emptyState.description}
                        </p>
                      )}
                    </div>
                    {emptyState?.createLink && (

                      <Button
                        variant="default"
                        size="sm"
                        className="rounded-xl px-6 "
                        onClick={emptyState.createLink}
                      >
                        {emptyState.createLabel || tCommon('buttons.create')}
                      </Button>

                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.numberOfPages > 1 && onPageChange && (
        <Pagination pagination={pagination} onPageChange={onPageChange} />
      )}
    </Card>
  );
}
