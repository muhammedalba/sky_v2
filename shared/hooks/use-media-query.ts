"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Tracks whether a CSS media query currently matches.
 *
 * Server snapshot is `null` ("unknown yet") so the first client render
 * matches the server-rendered output exactly (no hydration mismatch) —
 * callers should treat `null` as "unknown yet" and fall back to rendering
 * as if it could go either way. React resyncs to the real value right after
 * hydration on its own — no manual effect/setState needed.
 */
export function useMediaQuery(query: string): boolean | null {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onStoreChange);
      return () => mql.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  const getServerSnapshot = useCallback(() => null, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
