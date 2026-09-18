import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type CurrencyOverride = 'base' | 'usd' | null;

interface CurrencyState {
  /** null = automatic (follows the active language, current default behavior) */
  override: CurrencyOverride;
  setOverride: (override: CurrencyOverride) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      override: null,
      setOverride: (override) => set({ override }),
    }),
    {
      name: 'currency-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
