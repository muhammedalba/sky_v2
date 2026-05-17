/**
 * @deprecated This file is intentionally empty.
 *
 * The legacy Zustand auth store that persisted the JWT token and user object
 * in localStorage has been removed as part of the security migration to
 * HttpOnly cookie-based authentication.
 *
 * Authentication state is now managed exclusively by:
 *   - Server: HttpOnly cookies (access_token, refresh_token)
 *   - Client: React Query `useMe()` hook → fetches /auth/me on each mount
 *
 * Do NOT re-introduce localStorage token storage here.
 */
