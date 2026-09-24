'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/shared/ui/Badge';
import { RatingStars } from '@/shared/ui/RatingStars';
import { RatingInput } from '@/shared/ui/RatingInput';
import { EditIcon } from '@/shared/ui/Icons';
import { Review, ReviewStatus } from '@/features/reviews/types';
import ReviewForm from './ReviewForm';

const STATUS_VARIANT: Record<ReviewStatus, 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

interface OrderItemReviewProps {
  productId: string;
  /** The user's existing review on this product, if any (from the batch query) */
  review?: Review;
}

/**
 * Compact, low-key review prompt shown under a product in a delivered order.
 *
 * - no review yet → "How was it?" + 5 grey stars; clicking a star opens the
 *   inline form with that rating pre-selected
 * - already reviewed → "Your rating ★★★★ · status" + edit link
 *
 * Visibility rules (delivered order, reviews enabled, product still on the
 * store) are decided by the parent — this component only renders the prompt.
 */
export default function OrderItemReview({ productId, review }: OrderItemReviewProps) {
  const t = useTranslations('reviews.store');
  // null = collapsed; a number = form open (the star picked from the prompt)
  const [openWithRating, setOpenWithRating] = useState<number | null>(null);
  const close = () => setOpenWithRating(null);

  // 1) Form open → inline form, sliding in under the item
  if (openWithRating !== null) {
    return (
      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
        <ReviewForm
          productId={productId}
          existing={review ?? null}
          initialRating={openWithRating}
          compact
          onDone={close}
          onCancel={close}
        />
      </div>
    );
  }

  // 2) Already reviewed → quiet summary + edit link
  if (review) {
    return (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span>{t('yourReview')}</span>
        <RatingStars
          rating={review.rating}
          starClassName="w-3.5 h-3.5"
          label={t('stars', { count: review.rating })}
        />
        <Badge variant={STATUS_VARIANT[review.status]} className="text-[10px]">
          {t(`status.${review.status}`)}
        </Badge>
        <button
          type="button"
          onClick={() => setOpenWithRating(review.rating)}
          className="inline-flex items-center gap-1 font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
        >
          <EditIcon className="w-3 h-3" />
          {t('edit')}
        </button>
      </div>
    );
  }

  // 3) Not reviewed yet → soft prompt; the first star click opens the form
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span>{t('orderPrompt')}</span>
      <RatingInput
        value={0}
        onChange={(value) => setOpenWithRating(value)}
        starClassName="w-4 h-4"
        getLabel={(n) => t('stars', { count: n })}
      />
    </div>
  );
}
