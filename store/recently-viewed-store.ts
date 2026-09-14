import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const MAX_RECENTLY_VIEWED = 12;

interface RecentlyViewedState {
  ids: string[];
  addProduct: (id: string) => void;
  clear: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      ids: [],

      addProduct: (id) =>
        set((state) => ({
          ids: [id, ...state.ids.filter((existingId) => existingId !== id)].slice(
            0,
            MAX_RECENTLY_VIEWED,
          ),
        })),

      clear: () => set({ ids: [] }),
    }),
    {
      name: "recently-viewed-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ ids: state.ids }),
    },
  ),
);
