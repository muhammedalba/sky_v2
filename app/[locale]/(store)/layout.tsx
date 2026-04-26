import { ReactNode } from 'react';
import MobileBottomNavLoader from '@/components/navigation/MobileBottomNavLoader';
import StoreNavbarLoader from '@/components/navigation/StoreNavbarLoader';
import StoreFooter from '@/widgets/layout/StoreFooter';
import { env } from '@/lib/env';
import type { CategoryItem, SubCategoryItem } from '@/components/navigation/CategoriesScroller';

// ─── Server-side Data Fetch ───────────────────────────────────────────────────

async function getCategories(): Promise<CategoryItem[]> {
  try {
    // Fetch categories and subcategories in parallel
    const [catRes, subCatRes] = await Promise.all([
      fetch(
        `${env.API_URL}${env.ENDPOINTS.CATEGORIES.BASE}?limit=20`,
        {
          next: { revalidate: 300 },
          headers: { 'Content-Type': 'application/json' },
        }
      ),
      fetch(
        `${env.API_URL}${env.ENDPOINTS.SUP_CATEGORIES.BASE}?limit=100`,
        {
          next: { revalidate: 300 },
          headers: { 'Content-Type': 'application/json' },
        }
      ),
    ]);

    // Parse categories
    let categories: CategoryItem[] = [];
    if (catRes.ok) {
      const catJson = await catRes.json();
      const catData = catJson?.data || catJson || [];
      if (Array.isArray(catData)) {
        categories = catData.map((cat: any) => ({
          _id: cat._id,
          name: typeof cat.name === 'string' ? cat.name : (cat.name?.en || cat.name?.ar || ''),
          slug: cat.slug,
          image: cat.image,
          subCategories: [] as SubCategoryItem[],
        }));
      }
    }

    // Parse subcategories and group by parent category
    if (subCatRes.ok && categories.length > 0) {
      const subJson = await subCatRes.json();
      const subData = subJson?.data || subJson || [];

      if (Array.isArray(subData)) {
        // Build a map for fast lookup
        const catMap = new Map<string, CategoryItem>();
        categories.forEach((cat) => catMap.set(cat._id, cat));

        subData.forEach((sub: any) => {
          // category can be a string ID or an object { _id, name }
          const parentId = typeof sub.category === 'string'
            ? sub.category
            : sub.category?._id;

          if (parentId && catMap.has(parentId)) {
            catMap.get(parentId)!.subCategories!.push({
              _id: sub._id,
              name: typeof sub.name === 'string' ? sub.name : (sub.name?.en || sub.name?.ar || ''),
              slug: sub.slug,
            });
          }
        });
      }
    }

    return categories;
  } catch {
    return [];
  }
}

// ─── Layout ───────────────────────────────────────────────────────────────────

interface StoreLayoutProps {
  children: ReactNode;
}

export default async function StoreLayout({ children }: StoreLayoutProps) {
  const categories = await getCategories();

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans antialiased">
      {/* Top Navigation — Mobile & Desktop handled internally */}
      <StoreNavbarLoader categories={categories} />

      <main className="flex-1 pb-[calc(56px+env(safe-area-inset-bottom,0))] md:pb-0">
        {children}
      </main>

      {/* Footer */}
      <StoreFooter />

      {/* Mobile-only bottom navigation */}
      <MobileBottomNavLoader />
    </div>
  );
}
