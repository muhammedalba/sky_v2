import { cn } from '@/lib/utils';
import { Icons } from './Icons';

interface SuccessMessageProps {
  message: string;
  className?: string;
}

export default function SuccessMessage({ message, className }: SuccessMessageProps) {
  return (
    <div className={cn(
      "flex items-center p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm font-semibold",
      className
    )}>
      <Icons.Check className="w-5 h-5 border border-green-200 dark:border-green-800 rounded-full mx-2" />
      <div className="flex-1">
        {message} 
      </div>

    </div>
  );
}
