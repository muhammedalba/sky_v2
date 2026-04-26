import { cn } from '@/lib/utils';
import { Icons } from './Icons';

interface SuccessMessageProps {
  message: string;
  className?: string;
}

export default function SuccessMessage({ message, className }: SuccessMessageProps) {
  return (
    <div className={cn(
      "flex items-center p-4 rounded-2xl bg-success/10 border border-success/20 text-success text-sm font-semibold",
      className
    )}>
      <Icons.Check className="w-5 h-5 border border-success/20 rounded-full mx-2" />
      <div className="flex-1">
        {message} 
      </div>

    </div>
  );
}
