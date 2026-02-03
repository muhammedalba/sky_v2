'use client';

import { useEffect, useState } from 'react';
import { useUIStore } from '@/store/ui-store';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // logic to sync store with localstorage/system preference on mount
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // If we have a standalone 'theme' key (used by layout script), prioritize it
    // If not, fall back to system preference
    // The Zustand 'persist' middleware might have already loaded 'ui-storage', 
    // checking if 'theme' key differs ensures we respect the script's logic.
    
    let effectiveTheme: 'light' | 'dark' = 'light';
    
    if (storedTheme) {
      effectiveTheme = storedTheme;
    } else if (systemPrefersDark) {
      effectiveTheme = 'dark';
    }

    // If the store's theme doesn't match the effective theme (e.g. store is default 'light' but system is 'dark'),
    // we update the store.
    if (theme !== effectiveTheme) {
      setTheme(effectiveTheme);
    }
    
    // Explicitly set the class to ensure it matches the store (redundancy for safety)
    document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
    
  }, [setTheme, theme]); 

  // Prevent hydration mismatch by rendering only after mount? 
  // No, we want children to render. The theme flash is handled by script. 
  // This provider just syncs the store.
  
  return <>{children}</>;
}
