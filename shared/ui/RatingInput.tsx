'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { StarIcon } from '@/shared/ui/Icons';

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
  starClassName?: string;
  /** Accessible label per star, e.g. (n) => `${n} out of 5 stars` */
  getLabel?: (value: number) => string;
}

/** Clickable 1–5 star picker with hover preview (radio-group semantics). */
export function RatingInput({
  value,
  onChange,
  disabled,
  className,
  starClassName = 'w-7 h-7',
  getLabel = (n) => `${n}/5`,
}: RatingInputProps) {
  const [hovered, setHovered] = useState(0);
  const shown = !disabled && hovered ? hovered : value;

  return (
    <div
      role="radiogroup"
      className={cn('flex gap-1 text-warning', className)}
      dir="ltr"
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={value === s}
          aria-label={getLabel(s)}
          disabled={disabled}
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          className="cursor-pointer disabled:cursor-not-allowed transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          <StarIcon className={cn(starClassName, s <= shown ? 'fill-current' : 'text-muted-foreground/30')} />
        </button>
      ))}
    </div>
  );
}

export default RatingInput;
