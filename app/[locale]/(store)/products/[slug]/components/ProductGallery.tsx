"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import ImageWithFallback from "@/shared/ui/image/ImageWithFallback";
import { FileAsset } from "@/shared/types/file-asset";
import {
  HeartIcon,
  Share2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Maximize2Icon,
} from "@/shared/ui/Icons";
import { getImageUrl } from "@/shared/utils/image.util";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";

export interface ProductGalleryProps {
  title: string;
  images: (FileAsset | string)[];
  currentDisplayImage: FileAsset | string;
  onSelectImage: (img: FileAsset | string) => void;
  onOpenLightbox: () => void;
  isFeatured?: boolean;
  hasDiscount?: boolean;
  discountPercent?: number;
  isWishlisted: boolean;
  /** Omit to hide the wishlist button (feature disabled). */
  onToggleWishlist?: () => void;
  onShare: () => void;
}

export default function ProductGallery({
  title,
  images,
  currentDisplayImage,
  onSelectImage,
  onOpenLightbox,
  isFeatured,
  hasDiscount,
  discountPercent,
  isWishlisted,
  onToggleWishlist,
  onShare,
}: ProductGalleryProps) {
  const t = useTranslations("product");

  const currentImageUrl = getImageUrl(currentDisplayImage);
  const currentImageIndex = Math.max(
    0,
    images.findIndex((img) => getImageUrl(img) === currentImageUrl),
  );

  const goToImage = (direction: 1 | -1) => {
    if (images.length < 2) return;
    const nextIndex =
      (currentImageIndex + direction + images.length) % images.length;
    onSelectImage(images[nextIndex]);
  };

  return (
    <div className="md:col-span-6 md:order-2 flex flex-col md:flex-row gap-3">
      <ScrollReveal
        animation="fade"
        className="relative w-full aspect-9/5 bg-secondary/10 rounded-sm overflow-hidden group"
      >
        {isFeatured && (
          <div className="absolute rounded-tr-sm rounded-bl-sm top-4 rtl:right-4 ltr:left-4 z-10 bg-warning text-warning-foreground font-bold px-3 py-1 text-sm shadow-lg">
            {t("badges.bestSeller")}
          </div>
        )}
        {hasDiscount && typeof discountPercent === "number" && (
          <div className="absolute rounded-tr-sm rounded-bl-sm top-4 rtl:left-4 ltr:right-4 z-10 bg-destructive text-destructive-foreground font-bold px-3 py-1 text-sm shadow-lg">
            {t("badges.discount", { percent: discountPercent })}
          </div>
        )}

        {/* Wishlist & Share */}
        <div
          className="absolute top-4 rtl:left-4 ltr:right-4 z-10 flex flex-col gap-2"
          style={hasDiscount ? { marginTop: "2.5rem" } : undefined}
        >
          {onToggleWishlist && (
            <Button
              variant="outline2"
              size="icon"
              className="rounded-full h-10 w-10 bg-muted/10 backdrop-blur-md"
              onClick={onToggleWishlist}
              aria-label={t("gallery.addToWishlist")}
              aria-pressed={isWishlisted}
            >
              <HeartIcon
                className={`w-4 h-4 ${isWishlisted ? "fill-destructive text-destructive" : ""}`}
              />
            </Button>
          )}
          <Button
            variant="outline2"
            size="icon"
            className="rounded-full h-10 w-10 bg-muted/10 backdrop-blur-md"
            onClick={onShare}
            aria-label={t("gallery.shareProduct")}
          >
            <Share2Icon className="w-4 h-4" />
          </Button>
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goToImage(-1)}
              className="absolute rtl:right-4 ltr:left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/80 backdrop-blur-md border border-border/50 text-foreground hover:bg-primary hover:text-primary-foreground transition-all opacity-0 group-hover:opacity-100"
              aria-label={t("gallery.prevImage")}
            >
              <ChevronLeftIcon className="w-5 h-5 rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => goToImage(1)}
              className="absolute rtl:left-4 ltr:right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/80 backdrop-blur-md border border-border/50 text-foreground hover:bg-primary hover:text-primary-foreground transition-all opacity-0 group-hover:opacity-100"
              aria-label={t("gallery.nextImage")}
            >
              <ChevronRightIcon className="w-5 h-5 rtl:rotate-180" />
            </button>
          </>
        )}

        <button
          type="button"
          onClick={onOpenLightbox}
          className="absolute bottom-4 rtl:left-4 ltr:right-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-md border border-border/50 text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
          aria-label={t("gallery.zoomImage")}
        >
          <Maximize2Icon className="w-4 h-4" />
        </button>

        <ImageWithFallback
          src={currentDisplayImage}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 cursor-zoom-in"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          onClick={onOpenLightbox}
        />
      </ScrollReveal>

      {images.length > 1 && (
        <ScrollReveal
          animation="slide-up"
          delay={0.3}
          className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto no-scrollbar md:w-24 shrink-0 p-1"
        >
          {images.map((img, i) => (
            <button
              key={getImageUrl(img) || i}
              type="button"
              onClick={() => onSelectImage(img)}
              className={`relative w-20 md:w-full aspect-square shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                getImageUrl(img) === currentImageUrl
                  ? "border-primary"
                  : "border-transparent opacity-60 hover:opacity-100 hover:bg-secondary"
              }`}
            >
              <ImageWithFallback
                src={img}
                alt={`${title} ${i}`}
                fill
                loading="eager"
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </ScrollReveal>
      )}
    </div>
  );
}
