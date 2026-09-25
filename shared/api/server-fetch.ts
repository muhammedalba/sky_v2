/**
 * fetch() for server-side calls from the Next.js server to the API
 * (build, ISR, SSR, proxy). Same signature and caching options as fetch().
 *
 * - Sends `x-internal-key` so the API skips rate limiting: every server-side
 *   request originates from the Next server's single IP, and a static build
 *   alone issues more than the per-IP limit.
 * - Retries 429/503 briefly (honoring Retry-After) as a safety net.
 *
 * INTERNAL_API_KEY is a server-only env var (no NEXT_PUBLIC_ prefix), so it is
 * never inlined into client bundles; the header is also skipped in the browser.
 */

const RETRY_STATUSES = new Set([429, 503]);
const MAX_RETRIES = 2;
const MAX_RETRY_DELAY_MS = 2000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function retryDelayMs(response: Response, attempt: number): number {
  const retryAfter = Number(response.headers.get("retry-after"));
  const delay =
    Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter * 1000
      : 500 * 2 ** attempt; // 500ms, 1s
  return Math.min(delay, MAX_RETRY_DELAY_MS);
}

export async function serverFetch(
  input: string | URL,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  const internalKey = process.env.INTERNAL_API_KEY;
  if (internalKey && typeof window === "undefined") {
    headers.set("x-internal-key", internalKey);
  }

  for (let attempt = 0; ; attempt++) {
    const response = await fetch(input, { ...init, headers });
    if (!RETRY_STATUSES.has(response.status) || attempt >= MAX_RETRIES) {
      return response;
    }
    await sleep(retryDelayMs(response, attempt));
  }
}
