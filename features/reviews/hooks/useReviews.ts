'use client';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { reviewsApi } from '@/features/reviews/api';
import { ReviewPayload } from '@/features/reviews/types';

export const reviewKeys = {
  all: ['reviews'] as const,
  product: (productId: string, params?: Record<string, unknown>) =>
    ['reviews', 'product', productId, params] as const,
  mine: (productId: string) => ['reviews', 'mine', productId] as const,
  // locale is part of the key: the backend localizes populated fields
  // (e.g. product.title) per request language
  admin: (locale: string, params?: Record<string, unknown>) =>
    ['reviews', 'admin', locale, params] as const,
  stats: ['reviews', 'stats'] as const,
};

// ─── Storefront ──────────────────────────────────────────

/** Approved reviews of a product (public). */
export function useProductReviews(productId: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: reviewKeys.product(productId, params),
    queryFn: () => reviewsApi.getProductReviews(productId, params),
    enabled: !!productId,
    // keep the current list visible while "show more" loads the next page
    placeholderData: keepPreviousData,
  });
}

/** Current user's review on a product (any status) + whether they may review. */
export function useMyReview(productId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: reviewKeys.mine(productId),
    queryFn: async () => (await reviewsApi.getMyReview(productId)).data,
    enabled: !!productId && (options?.enabled ?? true),
    // Only the user's own actions change this, and those mutations invalidate
    // it — no need to refetch on every focus / remount.
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateReview(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReviewPayload) => reviewsApi.create(productId, data),
    onSettled: () => queryClient.invalidateQueries({ queryKey: reviewKeys.mine(productId) }),
  });
}

export function useUpdateMyReview(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: Partial<ReviewPayload> }) =>
      reviewsApi.updateMine(reviewId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: reviewKeys.mine(productId) });
      // An edited approved review leaves the public list until re-approved
      await queryClient.invalidateQueries({ queryKey: ['reviews', 'product', productId] });
    },
  });
}

// ─── Admin ───────────────────────────────────────────────

export function useAdminReviews(params?: Record<string, unknown>) {
  const locale = useLocale();
  return useQuery({
    queryKey: reviewKeys.admin(locale, params),
    queryFn: () => reviewsApi.getAll(params),
  });
}

export function useReviewStats() {
  return useQuery({
    queryKey: reviewKeys.stats,
    queryFn: async () => (await reviewsApi.getStats()).data,
  });
}

/** Shared invalidation for every moderation action (list + tab counters). */
function useInvalidateReviews() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: reviewKeys.all });
}

export function useUpdateReviewStatus() {
  const invalidate = useInvalidateReviews();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) =>
      reviewsApi.updateStatus(id, status),
    onSuccess: invalidate,
  });
}

export function useReplyReview() {
  const invalidate = useInvalidateReviews();
  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => reviewsApi.reply(id, text),
    onSuccess: invalidate,
  });
}

export function useDeleteReview() {
  const invalidate = useInvalidateReviews();
  return useMutation({
    mutationFn: (id: string) => reviewsApi.delete(id),
    onSuccess: invalidate,
  });
}
