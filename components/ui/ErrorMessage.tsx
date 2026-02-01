import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  message: string;
  retry?: () => void;
  className?: string;
}

export default function ErrorMessage({ message, retry, className }: ErrorMessageProps) {
  return (
    <div className={cn(
      "flex items-center p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-semibold",
      className
    )}>
      <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div className="flex-1">
        {message}
      </div>
      {retry && (
        <button
          onClick={retry}
          className="ml-4 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
