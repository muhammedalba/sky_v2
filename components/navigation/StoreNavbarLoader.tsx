'use client';

import dynamic from 'next/dynamic';
import type { CategoryItem } from './CategoriesScroller';

/**
 * Client wrapper that lazy-loads both navigation bars.
 * Categories are passed as server-fetched props (serialized).
 * Each navbar handles its own responsive visibility (md:hidden / hidden md:block).
 */


const DesktopNavbar = dynamic(() => import('./DesktopNavbar'), {
  ssr: false,
  loading: () => null,
});

interface StoreNavbarLoaderProps {
  categories: CategoryItem[];
}

export default function StoreNavbarLoader({ categories }: StoreNavbarLoaderProps) {
  return (
      <DesktopNavbar categories={categories} />

  );
}
