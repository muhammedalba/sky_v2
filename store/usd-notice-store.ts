import { create } from "zustand";

interface UsdNoticeState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

/**
 * Deliberately not persisted (in-memory only). Switching the storefront
 * locale navigates to a different `[locale]` route segment, which remounts
 * the whole client tree — a plain `useState` flag set right before that
 * navigation gets reset by the remount before the user ever sees it. This
 * store lives at module scope, so it survives that remount and the modal
 * (re-mounted fresh, reading `isOpen` on first render) stays open.
 */
export const useUsdNoticeStore = create<UsdNoticeState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
