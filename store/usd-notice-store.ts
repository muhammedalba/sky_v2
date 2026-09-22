import { create } from "zustand";

const PENDING_KEY = "usd-notice-pending";

function wasPendingBeforeReload(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(PENDING_KEY) === "1";
  } catch {
    return false;
  }
}

interface UsdNoticeState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

/**
 * In-memory module state handles the common case: switching the storefront
 * locale navigates to a different `[locale]` route segment, which remounts
 * the client tree below the (locale-agnostic) root layout — a plain
 * `useState` flag set right before that navigation would get reset by the
 * remount, but this store lives at module scope, so it survives.
 *
 * `open()` also mirrors the flag to sessionStorage as a fallback for the
 * rarer case where that navigation ends up as a full document reload
 * instead of a soft transition (which does reset module state) —
 * sessionStorage survives that too, and is read once on module init to
 * pick the flag back up.
 */
export const useUsdNoticeStore = create<UsdNoticeState>((set) => ({
  isOpen: wasPendingBeforeReload(),
  open: () => {
    try {
      sessionStorage.setItem(PENDING_KEY, "1");
    } catch {
      // sessionStorage unavailable (private mode, etc.) — in-memory state still works.
    }
    set({ isOpen: true });
  },
  close: () => {
    try {
      sessionStorage.removeItem(PENDING_KEY);
    } catch {
      // no-op — see open()
    }
    set({ isOpen: false });
  },
}));
