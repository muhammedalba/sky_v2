'use client';

import { cn } from '@/lib/utils';
import { COLOR_SWATCHES } from '@/shared/constants/product-constants';
import { CheckIcon as Check, PaletteIcon as Palette } from '@/shared/ui/Icons';
import { Input } from '@/shared/ui/Input';

interface ColorSwatchFilterProps {
  value: string;
  onSelectSwatch: (color: string) => void;
  onCustomColorChange: (color: string) => void;
  placeholder?: string;
  className?: string;
}

export function ColorSwatchFilter({
  value,
  onSelectSwatch,
  onCustomColorChange,
  placeholder = 'e.g. red, blue...',
  className,
}: ColorSwatchFilterProps) {
  const normalizedValue = value.trim().toLowerCase();

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2.5 flex-wrap">
        {COLOR_SWATCHES.map((swatch) => {
          const isSelected = normalizedValue === swatch.value.toLowerCase();
          return (
            <button
              key={swatch.value}
              type="button"
              aria-label={swatch.value}
              aria-pressed={isSelected}
              onClick={() => {
                const nextValue = isSelected ? '' : swatch.value;
                onSelectSwatch(nextValue);
              }}
              className={cn(
                'relative h-8 w-8 rounded-full border transition-transform hover:scale-110',
                swatch.swatchClass,
                swatch.light ? 'border-border' : 'border-transparent',
                isSelected &&
                  'ring-2 ring-offset-2 ring-primary ring-offset-background',
              )}
            >
              {isSelected && (
                <Check
                  className={cn(
                    'absolute inset-0 m-auto h-4 w-4',
                    swatch.light ? 'text-foreground' : 'text-white',
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      <Input
        icon={Palette}
        placeholder={placeholder}
        value={value}
        maxLength={30}
        onChange={(e) => onCustomColorChange(e.target.value)}
        className="h-10"
      />
    </div>
  );
}

export default ColorSwatchFilter;
