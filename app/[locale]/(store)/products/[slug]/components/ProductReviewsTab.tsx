"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import { RatingStars } from "@/shared/ui/RatingStars";
import { useSettings } from "@/app/providers/SettingsProvider";
import ReviewComposer from "@/features/reviews/components/storefront/ReviewComposer";
import ReviewList from "@/features/reviews/components/storefront/ReviewList";

export interface ProductReviewsTabProps {
  productId: string;
  ratingsAverage?: number;
  ratingsQuantity?: number;
}

export default function ProductReviewsTab({
  productId,
  ratingsAverage,
  ratingsQuantity,
}: ProductReviewsTabProps) {
  const t = useTranslations("reviews.store");
  const settings = useSettings();
  // When the admin disables reviews, only the write/edit UI disappears —
  // already published reviews stay visible.
  const reviewsEnabled = settings?.features?.reviews !== false;

  return (
    <div className="w-full bg-background rounded-2xl border border-border/50 p-5 sm:p-6 space-y-6">
      <ScrollReveal delay={100} animation="fade">
        <h3 className="font-bold text-lg title-gradient">
          {t("title")}
          {Boolean(ratingsQuantity) && ` (${ratingsQuantity})`}
        </h3>
      </ScrollReveal>

      {Boolean(ratingsAverage) && (
        <div className="rounded-2xl border border-border/40 p-5 space-y-1 w-fit">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black">
              {(ratingsAverage ?? 0).toFixed(1)}
            </span>
            <RatingStars
              rating={ratingsAverage ?? 0}
              label={t("stars", { count: Math.round(ratingsAverage ?? 0) })}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {t("basedOn", { count: ratingsQuantity ?? 0 })}
          </p>
        </div>
      )}

      {reviewsEnabled && <ReviewComposer productId={productId} />}

      <ReviewList productId={productId} />
    </div>
  );
}
