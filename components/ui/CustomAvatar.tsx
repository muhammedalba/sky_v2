'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ src, alt, fallback, className, size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  return (
    <div className={cn("relative rounded-full overflow-hidden border border-border shrink-0 bg-secondary flex items-center justify-center font-semibold text-secondary-foreground", sizeClasses[size], className)}>
      {src ? (
        <Image 
          src={src} 
          alt={alt || fallback} 
          fill 
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover" 
        />
      ) : (
        <span>{fallback.slice(0, 2).toUpperCase()}</span>
      )}
    </div>
  );
}
