"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMe } from "@/features/auth/hooks/useAuth";
import { useCartStore } from "@/store/cart-store";
import { syncGuestCart } from "@/features/cart/hooks/useCart";

/**
 * Silently pushes the guest cart (localStorage) to the backend whenever an
 * authenticated user is detected and local items are still pending.
 *
 * Complements the sync in `useLogin` / `useRegister` by covering the flows that
 * bypass them: OAuth redirects (Google/Facebook), a restored session, or a
 * previous sync attempt that failed.
 */
export default function CartSyncer() {
  const queryClient = useQueryClient();
  const { data: user } = useMe();
  const hasGuestItems = useCartStore((state) => state.items.length > 0);

  useEffect(() => {
    if (!user || !hasGuestItems) return;

    syncGuestCart().then((synced) => {
      if (synced) {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      }
    });
  }, [user, hasGuestItems, queryClient]);

  return null;
}
