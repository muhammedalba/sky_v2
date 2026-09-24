import { FileAsset } from '@/shared/types/file-asset';
import { LocalizedString } from '@/types';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface ReviewAuthor {
  _id: string;
  name: string;
  email?: string;
  avatar?: FileAsset | string;
}

export interface ReviewProductRef {
  _id: string;
  title: LocalizedString;
  slug: string;
  imageCover?: FileAsset;
  /** Admin list only — soft-deleted products are still returned so they can be flagged */
  isDeleted?: boolean;
  isActive?: boolean;
}

export interface AdminReply {
  text: string;
  repliedBy?: string;
  repliedAt: string;
}

export interface Review {
  _id: string;
  /** Populated (name, avatar) on list and `me` endpoints; plain id on create/update responses */
  user: ReviewAuthor | string;
  /** Populated on the admin list, plain id elsewhere */
  product: ReviewProductRef | string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  adminReply: AdminReply | null;
  isVerifiedPurchase: boolean;
  editedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** GET /reviews/product/:productId/me */
export interface MyReviewState {
  review: Review | null;
  isVerifiedPurchase: boolean;
  /** false when reviews are restricted to buyers and the user never bought the product */
  canReview: boolean;
}

export interface ReviewStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export interface ReviewPayload {
  rating: number;
  comment: string;
}
