import { env } from "@/lib/env";
import { GoogleReviewsResult } from "../types/settings";
import { serverFetch } from "@/shared/api/server-fetch";

const FETCH_TIMEOUT_MS = 5000;

/**
 * Server-side fetch of the store's Google reviews (proxied & cached by the
 * NestJS backend). Tagged with `settings` so any admin settings update
 * revalidates it immediately; otherwise refreshed once a day.
 *
 * Returns `null` on any failure so callers can fall back gracefully.
 */
export async function getGoogleReviews(
  locale: "ar" | "en",
): Promise<GoogleReviewsResult | null> {
  const endpoint = `${env.API_URL}${env.ENDPOINTS.SETTINGS.BASE}/google-reviews?lang=${locale}`;

  try {
    const response = await serverFetch(endpoint, {
      next: { revalidate: 86400, tags: ["settings"] },
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) return null;

    const responseData = await response?.json();
    const result: GoogleReviewsResult | undefined = responseData.data;
    return result?.enabled && result.reviews?.length ? result : null;
  } catch (error) {
    console.error("[GoogleReviews] Connection error:", error);
    return null;
  }
}
