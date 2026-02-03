import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UIState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      theme: 'light',
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setTheme: (theme) => {
        set({ theme });
        if (typeof window !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark');
          localStorage.setItem('theme', theme);
          document.cookie = `theme=${theme}; path=/; max-age=31536000; SameSite=Lax`;
        }
      },
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist theme and sidebar state
      partialize: (state) => ({ 
        theme: state.theme, 
        sidebarCollapsed: state.sidebarCollapsed 
      }),
      onRehydrateStorage: () => (state) => {
        if (typeof window !== 'undefined' && state) {
          // Double-check with standalone theme key to prevent mismatches during locale switches
          const standaloneTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
          if (standaloneTheme && (standaloneTheme === 'dark' || standaloneTheme === 'light')) {
            state.theme = standaloneTheme;
          }
          document.documentElement.classList.toggle('dark', state.theme === 'dark');
        }
      }
    }
  )
);
