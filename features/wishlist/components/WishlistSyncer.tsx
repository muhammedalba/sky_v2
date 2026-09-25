"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMe } from "@/features/auth/hooks/useAuth";
import { useWishlistStore } from "@/store/wishlist-store";
import {
  syncGuestWishlist,
  wishlistKeys,
} from "@/features/wishlist/hooks/useWishlist";

/**
 * Silently pushes the guest wishlist (localStorage) to the backend whenever an
 * authenticated user is detected and local items are still pending.
 *
 * Complements the sync in `useLogin` / `useRegister` by covering the flows that
 * bypass them: OAuth redirects (Google/Facebook), a restored session, or a
 * previous sync attempt that failed.
 */
export default function WishlistSyncer() {
  const queryClient = useQueryClient();
  const { data: user } = useMe();
  const hasGuestItems = useWishlistStore((state) => state.items.length > 0);

  useEffect(() => {
    if (!user || !hasGuestItems) return;

    syncGuestWishlist().then((synced) => {
      if (synced) {
        queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
      }
    });
  }, [user, hasGuestItems, queryClient]);

  return null;
}
