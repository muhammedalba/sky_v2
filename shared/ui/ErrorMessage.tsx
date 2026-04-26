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
      "text-xs  flex items-center gap-3 p-1 rounded-xl transition-all animate-in fade-in zoom-in-95 duration-300",
      showIcon ? "bg-destructive/10 text-destructive border border-destructive/20 font-medium" : "text-destructive font-normal",
      className
    )}>
      {showIcon && (
        <AlertCircle className="w-5 h-5 shrink-0 animate-pulse" />
      )}
      {message}

      {retry && (
        <button
          onClick={retry}
          type="button"
          className="flex items-center gap-2 px-3 py-1.5 bg-destructive hover:bg-destructive/90 active:scale-95 text-white rounded-lg transition-all text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {t('retry')}
        </button>
      )}
    </div>
  );
}
