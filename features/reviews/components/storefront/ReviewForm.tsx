'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/Button';
import { Textarea } from '@/shared/ui/Textarea';
import { RatingInput } from '@/shared/ui/RatingInput';
import { useToast } from '@/shared/hooks/useToast';
import { useCreateReview, useUpdateMyReview } from '@/features/reviews/hooks/useReviews';
import { reviewSchema } from '@/features/reviews/review.schema';
import { getReviewErrorMessage } from '@/features/reviews/utils';
import { Review } from '@/features/reviews/types';

interface ReviewFormProps {
  productId: string;
  /** When set the form edits this review instead of creating a new one */
  existing?: Review | null;
  onDone: () => void;
  onCancel: () => void;
}

type FieldErrors = Partial<Record<'rating' | 'comment', string>>;

export default function ReviewForm({ productId, existing, onDone, onCancel }: ReviewFormProps) {
  const t = useTranslations('reviews.store');
  const toast = useToast();
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});

  const createReview = useCreateReview(productId);
  const updateReview = useUpdateMyReview(productId);
  const isPending = createReview.isPending || updateReview.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = reviewSchema.safeParse({ rating, comment });
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        fieldErrors[field] ??= t(issue.message);
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    try {
      if (existing) {
        await updateReview.mutateAsync({ reviewId: existing._id, data: parsed.data });
        toast.success(t('updated'));
      } else {
        await createReview.mutateAsync(parsed.data);
        toast.success(t('submitted'));
      }
      onDone();
    } catch (error) {
      // 409 = already reviewed → `useCreateReview` refetches "my review",
      // so the parent switches to the edit view automatically.
      toast.error(getReviewErrorMessage(error, t('error')));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border/50 bg-muted/30 p-4 sm:p-5 space-y-4" noValidate>
      <p className="font-bold">{existing ? t('editReview') : t('writeReview')}</p>

      {existing && (
        <p className="text-xs text-warning/90 bg-warning/10 rounded-lg px-3 py-2">{t('editNotice')}</p>
      )}

      <div className="space-y-1.5">
        <p className="text-sm font-medium">{t('yourRating')}</p>
        <RatingInput
          value={rating}
          onChange={(v) => {
            setRating(v);
            setErrors((e) => ({ ...e, rating: undefined }));
          }}
          disabled={isPending}
          getLabel={(n) => t('stars', { count: n })}
        />
        {errors.rating && <p className="text-xs text-destructive">{errors.rating}</p>}
      </div>

      <Textarea
        label={t('yourComment')}
        placeholder={t('commentPlaceholder')}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={1000}
        rows={4}
        disabled={isPending}
        error={errors.comment}
      />

      <div className="flex items-center gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isPending}>
          {t('cancel')}
        </Button>
        <Button type="submit" size="sm" isLoading={isPending}>
          {existing ? t('update') : t('submit')}
        </Button>
      </div>
    </form>
  );
}
