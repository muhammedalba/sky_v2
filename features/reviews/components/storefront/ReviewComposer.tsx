'use client';

import { useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Skeleton } from '@/shared/ui/Skeleton';
import { EditIcon, ShieldCheckIcon } from '@/shared/ui/Icons';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useMyReview } from '@/features/reviews/hooks/useReviews';
import { ReviewStatus } from '@/features/reviews/types';
import ReviewForm from './ReviewForm';
import ReviewItem from './ReviewItem';

const STATUS_VARIANT: Record<ReviewStatus, 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

const emptySubscribe = () => () => {};

/**
 * The "write / edit my review" area of the product page.
 * Rendered only when reviews are enabled in the store settings.
 *
 * - guest            → login prompt
 * - already reviewed → "you already reviewed" notice + own review + edit
 * - buyers only      → notice (no form)
 * - otherwise        → "write a review" button → form
 */
export default function ReviewComposer({ productId }: { productId: string }) {
  const t = useTranslations('reviews.store');
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: mine, isLoading } = useMyReview(productId, { enabled: isAuthenticated });
  const [isEditing, setIsEditing] = useState(false);

  if (!isMounted || authLoading || (isAuthenticated && isLoading)) {
    return <Skeleton className="h-16 w-full rounded-2xl" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-border/60 p-4">
        <p className="text-sm text-muted-foreground">{t('loginToReview')}</p>
        <Button asChild size="sm" variant="outline">
          <Link href="/login">{t('login')}</Link>
        </Button>
      </div>
    );
  }

  const myReview = mine?.review ?? null;

  if (isEditing) {
    return (
      <ReviewForm
        productId={productId}
        existing={myReview}
        onDone={() => setIsEditing(false)}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  if (myReview) {
    return (
      <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 space-y-2">
        <p className="text-sm text-muted-foreground">{t('alreadyReviewed')}</p>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">{t('yourReview')}</span>
            <Badge variant={STATUS_VARIANT[myReview.status]}>{t(`status.${myReview.status}`)}</Badge>
          </div>
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
            <EditIcon className="w-4 h-4" />
            {t('edit')}
          </Button>
        </div>
        <ReviewItem review={myReview} />
      </div>
    );
  }

  if (mine && !mine.canReview) {
    return (
      <p className="flex items-center gap-2 rounded-2xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
        <ShieldCheckIcon className="w-4 h-4 shrink-0" />
        {t('buyersOnly')}
      </p>
    );
  }

  return (
    <Button onClick={() => setIsEditing(true)}>{t('writeReview')}</Button>
  );
}
