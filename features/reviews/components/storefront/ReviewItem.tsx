'use client';

import { useLocale, useTranslations } from 'next-intl';
import { formatDate } from '@/lib/utils';
import { Avatar } from '@/shared/ui/CustomAvatar';
import { RatingStars } from '@/shared/ui/RatingStars';
import { ShieldCheckIcon, MessageCircleIcon } from '@/shared/ui/Icons';
import { Review } from '@/features/reviews/types';

function authorOf(review: Review) {

  if (typeof review.user === 'object' && review.user) {
    const avatar = review.user.avatar;
    return {
      name: review.user.name,
      avatar: typeof avatar === 'string' ? avatar : avatar?.url,
    };
  }
  return { name: '', avatar: undefined };
}

export default function ReviewItem({ review }: { review: Review }) {
  const t = useTranslations('reviews.store');
  const locale = useLocale();
  const { name, avatar } = authorOf(review);

  return (
    <article className="py-5 space-y-3">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar src={avatar} alt={name} fallback={name.charAt(0) || '?'} size="md" />
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">{name}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <RatingStars
                rating={review.rating}
                starClassName="w-3.5 h-3.5"
                label={t('stars', { count: review.rating })}
              />
              {review.isVerifiedPurchase && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success">
                  <ShieldCheckIcon className="w-3.5 h-3.5" />
                  {t('verifiedPurchase')}
                </span>
              )}
            </div>
          </div>
        </div>
        <time dateTime={review.createdAt} className="text-xs text-muted-foreground shrink-0">
          {formatDate(review.createdAt, locale)}
          {review.editedAt && <span className="ms-1 opacity-70">· {t('edited')}</span>}
        </time>
      </header>

      <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line wrap-break-word">
        {review.comment}
      </p>

      {review.adminReply && (
        <div className="ms-6 rounded-xl border border-primary/5 bg-primary/5 p-3 space-y-1">
          <p className="flex items-center gap-1.5 text-xs font-bold text-primary">
            <MessageCircleIcon className="w-3.5 h-3.5" />
            {t('storeReply')}
          </p>
          <p className="text-sm text-foreground/80 whitespace-pre-line wrap-break-word">
            {review.adminReply.text}
          </p>
        </div>
      )}
    </article>
  );
}
