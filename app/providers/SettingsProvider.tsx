'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { StoreSettings } from '@/shared/types/settings';

/**
 * Settings Context
 * Holds the global store configuration
 */
const SettingsContext = createContext<StoreSettings | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
  settings: StoreSettings;
}

/**
 * Enterprise Settings Provider
 * Wraps the application to provide access to settings via context
 * Optimized with useMemo to prevent unnecessary re-renders
 */
export default function SettingsProvider({ children, settings }: SettingsProviderProps) {
  // Memoize the settings to ensure stability across re-renders
  const value = useMemo(() => settings, [settings]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * useSettings Hook
 * Professional hook to access store settings with built-in safety check
 */
export function useSettings() {
  const context = useContext(SettingsContext);
  
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  
  return context;
}
