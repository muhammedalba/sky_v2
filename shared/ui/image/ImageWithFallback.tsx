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
  src = "",
  alt,
  fallback,
  className,
  fill,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const resolvedSrc = getImageUrl(src);

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
      alt={alt}
      className={className}
      fill={fill}
      loader={() => {
        return "/assets/images/default.png";
      }}
      onError={() => setError(true)}
      {...props}
    />
  );
}
