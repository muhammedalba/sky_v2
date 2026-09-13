"use client";

import { useTranslations } from "next-intl";
import { StarIcon } from "@/shared/ui/Icons";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";

export interface ProductReviewsTabProps {
  ratingsAverage?: number;
  ratingsQuantity?: number;
}

export default function ProductReviewsTab({
  ratingsAverage,
  ratingsQuantity,
}: ProductReviewsTabProps) {
  const t = useTranslations("product");

  return (
    <div className="w-full bg-background rounded-2xl border border-border/50 p-5 sm:p-6 space-y-6">
      <ScrollReveal delay={100} animation="fade">
        <h3 className="font-bold text-lg title-gradient">
          {t("reviews.title")}
          {Boolean(ratingsQuantity) && ` (${ratingsQuantity})`}
        </h3>
      </ScrollReveal>

      {Boolean(ratingsAverage) && (
        <div className="rounded-2xl border border-border/40 p-5 space-y-2 w-fit">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black">
              {(ratingsAverage ?? 0).toFixed(2)}
            </span>
            <div className="flex items-center" dir="ltr">
              {Array.from({ length: 5 }).map((_, i) => (
                <ScrollReveal key={i} animation="fade" delay={i * 200}>
                  <StarIcon
                    className={`w-4 h-4 ${
                      i < Math.round(ratingsAverage ?? 0)
                        ? "text-warning fill-warning"
                        : "text-border fill-border"
                    }`}
                  />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* قائمة التقييمات */}
      <ScrollReveal
        animation="fade"
        className="text-center py-10 text-sm text-muted-foreground border-t border-border/40"
      >
        {t("reviews.empty")}
      </ScrollReveal>
    </div>
  );
}
