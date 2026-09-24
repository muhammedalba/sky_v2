import { cn } from '@/lib/utils';
import { StarIcon } from '@/shared/ui/Icons';

interface RatingStarsProps {
  /** 0–5; rounded to the nearest whole star */
  rating: number;
  className?: string;
  /** Size classes for each star (e.g. "w-4 h-4") */
  starClassName?: string;
  label?: string;
}

/** Read-only star rating (server-component safe — no hooks). For input use `RatingInput`. */
export function RatingStars({ rating, className, starClassName = 'w-4 h-4', label }: RatingStarsProps) {
  const filled = Math.round(rating);
  return (
    <div className={cn('flex gap-1 text-warning', className)} dir="ltr" role="img" aria-label={label ?? `${filled}/5`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <StarIcon
          key={s}
          className={cn(starClassName, s <= filled ? 'fill-current' : 'text-muted-foreground/30')}
        />
      ))}
    </div>
  );
}

export default RatingStars;
