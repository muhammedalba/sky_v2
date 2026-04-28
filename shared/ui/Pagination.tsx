'use client';

import { Icons } from '@/shared/ui/Icons';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export interface PaginationData {
  currentPage: number;
  limit: number;
  numberOfPages: number;
  nextPage?: number;
  prevPage?: number;
}

interface PaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({ pagination, onPageChange, className }: PaginationProps) {
  // const tButtons = useTranslations('buttons'); // تم إيقافها في كودك الأصلي
  const tMessages = useTranslations('messages'); 
  const { currentPage, numberOfPages, nextPage, prevPage } = pagination;

  // المنطق البرمجي (Logic) تُرك كما هو تماماً دون تغيير
  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = [];

    if (numberOfPages <= 7) {
      return Array.from({ length: numberOfPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (currentPage > 3) {
      pages.push('ellipsis');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(numberOfPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < numberOfPages - 2) {
      pages.push('ellipsis');
    }

    if (numberOfPages > 1) {
      pages.push(numberOfPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  if (numberOfPages <= 1) {
    return null;
  }

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 p-5 w-full", className)}>
      
      {/* ── Page Info ── */}
      <div className="flex items-center text-sm font-medium text-muted-foreground">
        {tMessages('showingPage', { page: currentPage, total: numberOfPages })}
      </div>

      {/* ── Pagination Controls ── */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        
        {/* Previous Button */}
        <button
          onClick={() => prevPage && onPageChange(prevPage)}
          disabled={!prevPage}
          className={cn(
            'inline-flex items-center justify-center h-10 px-3 sm:px-4 rounded-xl font-semibold text-sm transition-all duration-300 ease-out',
            !prevPage
              ? 'opacity-50 cursor-not-allowed text-muted-foreground'
              : 'bg-background border border-input shadow-sm hover:bg-accent hover:text-accent-foreground active:scale-[0.98]'
          )}
          aria-label="Previous page"
        >
          {/* إضافة rtl:rotate-180 لدعم اللغتين العربية والإنجليزية تلقائياً */}
          <Icons.ChevronLeft className="w-4 h-4 rtl:rotate-180" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {visiblePages.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="w-8 h-10 flex items-center justify-center text-muted-foreground/60 font-bold tracking-widest"
                >
                  •••
                </span>
              );
            }

            const isActive = page === currentPage;

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                disabled={isActive}
                className={cn(
                  'inline-flex items-center justify-center w-10 h-10 rounded-xl font-semibold text-sm transition-all duration-300 ease-out',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md ring-1 ring-primary/20 cursor-default'
                    : 'bg-background border border-transparent text-foreground hover:bg-accent hover:border-border hover:shadow-sm active:scale-[0.98]'
                )}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => nextPage && onPageChange(nextPage)}
          disabled={!nextPage}
          className={cn(
            'inline-flex  items-center justify-center h-10 px-3 sm:px-4 rounded-xl font-semibold text-sm transition-all duration-300 ease-out',
            !prevPage && !nextPage ? "" : "", // Safe guard
            !nextPage
              ? 'opacity-50 cursor-not-allowed text-muted-foreground'
              : 'bg-background border border-input shadow-sm hover:bg-accent hover:text-accent-foreground active:scale-[0.98]'
          )}
          aria-label="Next page"
        >
          {/* إضافة rtl:rotate-180 */}
          <Icons.ChevronRight className="w-4 h-4 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}