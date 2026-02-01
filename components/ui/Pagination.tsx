import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  const visiblePages = pages.filter((page) => {
    if (totalPages <= 7) return true;
    if (page === 1 || page === totalPages) return true;
    if (page >= currentPage - 1 && page <= currentPage + 1) return true;
    return false;
  });

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          'px-3 py-2 rounded-lg border transition-colors',
          currentPage === 1
            ? 'border-secondary-200 dark:border-secondary-700 text-secondary-400 dark:text-secondary-600 cursor-not-allowed'
            : 'border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800'
        )}
      >
        Previous
      </button>

      <div className="flex gap-1">
        {visiblePages.map((page, index) => {
          const prevPage = visiblePages[index - 1];
          const showEllipsis = prevPage && page - prevPage > 1;

          return (
            <div key={page} className="flex items-center gap-1">
              {showEllipsis && (
                <span className="px-2 text-secondary-500 dark:text-secondary-400">...</span>
              )}
              <button
                onClick={() => onPageChange(page)}
                className={cn(
                  'px-4 py-2 rounded-lg border transition-colors',
                  page === currentPage
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800'
                )}
              >
                {page}
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          'px-3 py-2 rounded-lg border transition-colors',
          currentPage === totalPages
            ? 'border-secondary-200 dark:border-secondary-700 text-secondary-400 dark:text-secondary-600 cursor-not-allowed'
            : 'border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800'
        )}
      >
        Next
      </button>
    </div>
  );
}
