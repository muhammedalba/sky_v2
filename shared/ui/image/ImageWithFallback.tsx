"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { ProductsIcon } from "@/shared/ui/Icons";
import { cn } from "@/lib/utils";
import { FileAsset } from "@/shared/types/file-asset";
import { getImageUrl } from "@/shared/utils/image.util";

interface ImageWithFallbackProps extends Omit<ImageProps, "src"> {
  src?: FileAsset | string | null;
  fallback?: React.ReactNode;
}

export default function ImageWithFallback({
  src,
  alt,
  fallback,
  className,
  fill,
  ...props
}: ImageWithFallbackProps) {
  const resolvedSrc = getImageUrl(src);
  // Track *which* URL failed, not just "failed": when src changes (e.g. a new
  // image after an edit, while the old file was already deleted) the error
  // resets automatically instead of sticking to the fallback forever.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const error = failedSrc !== null && failedSrc === resolvedSrc;

  if (error || !resolvedSrc || resolvedSrc === null) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-secondary/50",
          fill && "absolute inset-0 w-full h-full",
          className,
        )}
      >
        {fallback || (
          <ProductsIcon className="w-6 h-6 text-muted-foreground m-auto" />
        )}
      </div>
    );
  }

  return (
    <Image
      src={resolvedSrc}
      alt={alt || "image"}
      className={className}
      fill={fill}
      onError={() => setFailedSrc(resolvedSrc)}
      {...props}
    />
  );
}
