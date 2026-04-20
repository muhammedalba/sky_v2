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
  const tButtons = useTranslations('buttons');
  const tMessages = useTranslations('messages');  const { currentPage, numberOfPages, nextPage, prevPage } = pagination;

  // Generate visible page numbers with smart ellipsis
  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = [];
    
    if (numberOfPages <= 7) {
      // Show all pages if 7 or less
      return Array.from({ length: numberOfPages }, (_, i) => i + 1);
    }

    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push('ellipsis');
    }

    // Show pages around current page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(numberOfPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < numberOfPages - 2) {
      pages.push('ellipsis');
    }

    // Always show last page
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
    <div className={cn("flex items-center justify-between gap-4 flex-wrap", className)}>
      {/* Page Info */}
      <div className="flex items-center gap-2">
        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60">
          {tMessages('showingPage', { page: currentPage, total: numberOfPages })}
        </p>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          onClick={() => prevPage && onPageChange(prevPage)}
          disabled={!prevPage}
          className={cn(
            'h-10 px-4 rounded-xl font-bold text-sm transition-all flex items-center gap-2',
            'border border-border/60 shadow-sm',
            !prevPage
              ? 'opacity-40 cursor-not-allowed bg-muted/20'
              : 'hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
          )}
        >
          <Icons.ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{tButtons('previous')}</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1.5">
          {visiblePages.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="w-10 h-10 flex items-center justify-center text-muted-foreground font-bold"
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
                  'w-10 h-10 rounded-xl font-bold text-sm transition-all',
                  'border shadow-sm',
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary shadow-primary/20 scale-110'
                    : 'border-border/60 hover:bg-muted hover:border-border hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
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
            'h-10 px-4 rounded-xl font-bold text-sm transition-all flex items-center gap-2',
            'border border-border/60 shadow-sm',
            !nextPage
              ? 'opacity-40 cursor-not-allowed bg-muted/20'
              : 'hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
          )}
        >
          <span className="hidden sm:inline">{tButtons('next')}</span>
          <Icons.ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
