import { ReactNode } from 'react';
import MobileBottomNavLoader from '@/components/navigation/MobileBottomNavLoader';
import StoreNavbarLoader from '@/components/navigation/StoreNavbarLoader';
import StoreFooter from '@/widgets/layout/StoreFooter';
import { env } from '@/lib/env';
import type { CategoryItem } from '@/components/navigation/CategoriesScroller';

// ─── Server-side Data Fetch ───────────────────────────────────────────────────

async function getCategories(): Promise<CategoryItem[]> {
  try {
    const res = await fetch(
      `${env.API_URL}${env.ENDPOINTS.CATEGORIES.BASE}?limit=20`,
      {
        next: { revalidate: 300 },
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!res.ok) return [];

    const json = await res.json();
    const data: CategoryItem[] = json?.data ||  [];
    if (!Array.isArray(data)) return [];

    return data;
  } catch {
    return [];
  }
}

// Settings are fetched once in [locale]/layout.tsx via the shared
// getStoreSettings() (shared/api/settings.ts) with ISR cache tag 'settings'.
// They reach all client components through SettingsProvider — no extra fetch needed here.

// ─── Layout ───────────────────────────────────────────────────────────────────

interface StoreLayoutProps {
  children: ReactNode;
}

export default async function StoreLayout({ children }: StoreLayoutProps) {
  const categories = await getCategories();
  return (
    <div className="min-h-screen  flex flex-col bg-background font-sans antialiased">
      {/* Top Navigation — Mobile & Desktop handled internally */}
      <StoreNavbarLoader categories={categories} />

      <main className="flex-1  pb-[calc(56px+env(safe-area-inset-bottom,0))] md:pb-0">
        {children}
      </main>

      {/* Footer */}
      <StoreFooter />

      {/* Mobile-only bottom navigation */}
      <MobileBottomNavLoader />
    </div>
  );
}
