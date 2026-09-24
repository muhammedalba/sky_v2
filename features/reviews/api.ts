import { apiClient } from '@/lib/api/client';
import { env } from '@/lib/env';
import { ApiResponse } from '@/types';
import { MyReviewState, Review, ReviewPayload, ReviewStats } from './types';

const BASE = env.ENDPOINTS.REVIEWS.BASE;

export const reviewsApi = {
  // ─── Storefront ────────────────────────────────────────
  getProductReviews: (productId: string, params?: Record<string, unknown>) =>
    apiClient.get(`${BASE}/product/${productId}`, { params }) as unknown as Promise<ApiResponse<Review[]>>,

  getMyReview: (productId: string) =>
    apiClient.get(`${BASE}/product/${productId}/me`) as unknown as Promise<ApiResponse<MyReviewState>>,

  create: (productId: string, data: ReviewPayload) =>
    apiClient.post(`${BASE}/product/${productId}`, data) as unknown as Promise<ApiResponse<Review>>,

  updateMine: (reviewId: string, data: Partial<ReviewPayload>) =>
    apiClient.patch(`${BASE}/me/${reviewId}`, data) as unknown as Promise<ApiResponse<Review>>,

  // ─── Admin ─────────────────────────────────────────────
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get(BASE, { params }) as unknown as Promise<ApiResponse<Review[]>>,

  getStats: () =>
    apiClient.get(`${BASE}/statistics`) as unknown as Promise<ApiResponse<ReviewStats>>,

  updateStatus: (reviewId: string, status: 'approved' | 'rejected') =>
    apiClient.patch(`${BASE}/${reviewId}/status`, { status }) as unknown as Promise<ApiResponse<Review>>,

  reply: (reviewId: string, text: string) =>
    apiClient.patch(`${BASE}/${reviewId}/reply`, { text }) as unknown as Promise<ApiResponse<Review>>,

  delete: (reviewId: string) =>
    apiClient.delete(`${BASE}/${reviewId}`) as unknown as Promise<ApiResponse<{ _id: string }>>,
};
