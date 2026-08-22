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
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const resolvedSrc = getImageUrl(src);

  if (error || !resolvedSrc || resolvedSrc === "") {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-secondary/50",
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
      onError={() => setError(true)}
      {...props}
    />
  );
}
