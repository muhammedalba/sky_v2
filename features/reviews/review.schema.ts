import { z } from 'zod';

/**
 * Mirrors the backend CreateReviewDto. Messages are translation keys
 * under `reviews.store.*` (resolved in the form component).
 */
export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'ratingRequired').max(5, 'ratingRequired'),
  comment: z.string().trim().min(3, 'commentMin').max(1000, 'commentMax'),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;

export const replySchema = z.object({
  text: z.string().trim().min(1, 'required').max(1000),
});
