import { cn } from '@/lib/utils';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ErrorMessageProps {
  message: string;
  retry?: () => void;
  className?: string;
  showIcon?: boolean;
}

/**
 * Premium ErrorMessage component with support for:
 * - Lucide Icons
 * - i18n (next-intl)
 * - LTR/RTL support
 * - Dark mode
 * - Entrance animations
 */
export default function ErrorMessage({ 
  message, 
  retry, 
  className, 
  showIcon = false 
}: ErrorMessageProps) {
  const t = useTranslations('common.buttons');

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl transition-all animate-in fade-in zoom-in-95 duration-300",
      showIcon ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800/30 font-medium" : "text-red-500 font-normal",
      className
    )}>
      {showIcon && (
        <AlertCircle className="w-5 h-5 flex-shrink-0 animate-pulse" />
      )}
      
      <div className="flex-1 text-sm leading-relaxed">
        {message}
      </div>

      {retry && (
        <button
          onClick={retry}
          type="button"
          className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-lg transition-all text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {t('retry')}
        </button>
      )}
    </div>
  );
}
