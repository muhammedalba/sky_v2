'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import { useProductReviews } from '@/features/reviews/hooks/useReviews';
import ReviewItem from './ReviewItem';

const PAGE_SIZE = 5;
const MAX_LIMIT = 50; // backend cap

/** Approved reviews of a product with "show more" pagination. */
export default function ReviewList({ productId }: { productId: string }) {
  const t = useTranslations('reviews.store');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const { data, isLoading, isFetching } = useProductReviews(productId, { page: 1, limit });

  const reviews = data?.data ?? [];
  const total = Number(data?.meta?.pagination?.totalResults ?? reviews.length);
  const canLoadMore = reviews.length < total && limit < MAX_LIMIT;

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <p className="text-center py-10 text-sm text-muted-foreground border-t border-border/40">
        {t('empty')}
      </p>
    );
  }

  return (
    <div className="border-t border-border/40">
      <div className="divide-y divide-border/40">
        {reviews.map((review) => (
          <ReviewItem key={review._id} review={review} />
        ))}
      </div>
      {canLoadMore && (
        <div className="pt-4 text-center">
          <Button
            variant="link"
            size="sm"
            isLoading={isFetching}
            onClick={() => setLimit((l) => Math.min(l + PAGE_SIZE, MAX_LIMIT))}
          >
            {t('loadMore')}
          </Button>
        </div>
      )}
    </div>
  );
}
