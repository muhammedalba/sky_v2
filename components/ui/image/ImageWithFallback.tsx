'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { Icons } from '@/components/ui/Icons';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps extends ImageProps {
  fallback?: React.ReactNode;
}

export default function ImageWithFallback({ 
  src, 
  alt, 
  fallback, 
  className, 
  ...props 
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={cn("flex items-center justify-center bg-secondary/50", className)}>
        {fallback || <Icons.Products className="w-6 h-6 text-muted-foreground" />}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
}
