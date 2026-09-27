'use client';

import dynamic from 'next/dynamic';

/**
 * Client-side wrapper that lazy-loads the CartDrawer.
 * The drawer is closed on first paint, so it's split out of the initial
 * bundle and fetched after hydration instead of blocking it.
 * `dynamic({ ssr: false })` requires a Client Component, hence this wrapper.
 */
const CartDrawer = dynamic(
  () => import('@/features/cart/components/CartDrawer'),
  {
    ssr: false,
    loading: () => null,
  }
);

export default function CartDrawerLoader() {
  return <CartDrawer />;
}
