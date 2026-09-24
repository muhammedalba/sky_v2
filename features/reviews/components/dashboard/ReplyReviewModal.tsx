'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Modal from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { Textarea } from '@/shared/ui/Textarea';
import { RatingStars } from '@/shared/ui/RatingStars';
import { useToast } from '@/shared/hooks/useToast';
import { useReplyReview } from '@/features/reviews/hooks/useReviews';
import { replySchema } from '@/features/reviews/review.schema';
import { getReviewErrorMessage } from '@/features/reviews/utils';
import { Review } from '@/features/reviews/types';

interface ReplyReviewModalProps {
  review: Review | null;
  onClose: () => void;
}

/**
 * One-time admin reply to a review (backend rejects a second reply with 409).
 * Render with `key={review?._id}` so the draft resets per review.
 */
export default function ReplyReviewModal({ review, onClose }: ReplyReviewModalProps) {
  const t = useTranslations('reviews.admin');
  const tButtons = useTranslations('buttons');
  const toast = useToast();
  const [text, setText] = useState('');
  const [error, setError] = useState<string>();
  const { mutateAsync, isPending } = useReplyReview();

  const handleSubmit = async () => {
    if (!review) return;
    const parsed = replySchema.safeParse({ text });
    if (!parsed.success) {
      setError(t('reply.required'));
      return;
    }
    try {
      await mutateAsync({ id: review._id, text: parsed.data.text });
      toast.success(t('messages.replied'));
      onClose();
    } catch (err) {
      toast.error(getReviewErrorMessage(err, t('messages.error')));
    }
  };

  return (
    <Modal
      isOpen={!!review}
      onClose={onClose}
      title={t('reply.title')}
      description={t('reply.description')}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            {tButtons('cancel')}
          </Button>
          <Button onClick={handleSubmit} isLoading={isPending}>
            {t('reply.submit')}
          </Button>
        </div>
      }
    >
      {review && (
        <div className="space-y-4">
          <div className="rounded-xl bg-muted/40 p-3 space-y-1.5">
            <RatingStars rating={review.rating} starClassName="w-3.5 h-3.5" />
            <p className="text-sm whitespace-pre-line wrap-break-word">{review.comment}</p>
          </div>
          <Textarea
            placeholder={t('reply.placeholder')}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError(undefined);
            }}
            maxLength={1000}
            rows={4}
            disabled={isPending}
            error={error}
          />
        </div>
      )}
    </Modal>
  );
}
