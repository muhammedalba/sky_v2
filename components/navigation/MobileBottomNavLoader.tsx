'use client';

import dynamic from 'next/dynamic';

/**
 * Client-side wrapper that lazy-loads the MobileBottomNav.
 * This exists because `dynamic({ ssr: false })` requires a Client Component
 * in Next.js 16+ with Turbopack. The (store)/layout.tsx stays a Server Component.
 */
const MobileBottomNav = dynamic(
  () => import('@/components/navigation/MobileBottomNav'),
  {
    ssr: false,
    loading: () => null, // No flash — nav loads quickly anyway
  }
);

export default function MobileBottomNavLoader() {
  return <MobileBottomNav />;
}
