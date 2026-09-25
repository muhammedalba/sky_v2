"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useToast } from "@/shared/hooks/useToast";
import { wishlistApi } from "@/features/wishlist/api";
import { useMe } from "@/features/auth/hooks/useAuth";
import { useWishlistStore } from "@/store/wishlist-store";
import { useSettings } from "@/app/providers/SettingsProvider";
import { Product } from "@/types";

export const wishlistKeys = {
  all: ["wishlist"] as const,
  list: ["wishlist", "list"] as const,
  ids: ["wishlist", "ids"] as const,
  toggle: ["wishlist", "toggle"] as const,
};

export interface WishlistIdsResponse {
  productIds: string[];
}

export interface WishlistResponse {
  products: Product[];
  count: number;
}

/**
 * `false` on the server and during hydration, `true` afterwards.
 * Guest wishlist lives in localStorage, so reading it before hydration
 * would render a different heart state than the server HTML.
 */
const noopSubscribe = () => () => {};
function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

// ─── Server wishlist (authenticated users) ──────────────────────────────────

/**
 * Fetches the full wishlist (populated products) for authenticated users.
 * Guests read `useWishlistStore` directly.
 */
export function useWishlist() {
  const { data: user } = useMe();

  return useQuery({
    queryKey: wishlistKeys.list,
    queryFn: async (): Promise<WishlistResponse> => {
      const response = await wishlistApi.getWishlist();
      return response?.data ?? { products: [], count: 0 };
    },
    enabled: !!user,
  });
}

// ─── Wishlisted IDs (guest → Zustand/localStorage | authenticated → backend) ─

/**
 * Returns the wishlisted product IDs (newest first) for both guests and
 * authenticated users. Used to paint the heart state and the navbar badge.
 */
export function useWishlistIds(): string[] {
  const { data: user } = useMe();
  const hydrated = useHydrated();
  const guestItems = useWishlistStore((state) => state.items);

  const { data } = useQuery({
    queryKey: wishlistKeys.ids,
    queryFn: async (): Promise<WishlistIdsResponse> => {
      const response = await wishlistApi.getIds();
      return response?.data ?? { productIds: [] };
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  return useMemo(() => {
    if (user) return data?.productIds ?? [];
    if (!hydrated) return [];
    return guestItems.map((item) => item.productId).reverse();
  }, [user, data?.productIds, hydrated, guestItems]);
}

export function useIsWishlisted(productId?: string) {
  const ids = useWishlistIds();
  return !!productId && ids.includes(productId);
}

// ─── Toggle (guest → Zustand/localStorage | authenticated → backend) ────────

/**
 * Adds/removes a product from the wishlist.
 *
 * - Guest: toggles the item in the local Zustand store (persisted via localStorage).
 * - Authenticated: optimistic update on the IDs cache, then calls the backend
 *   and rolls back on failure.
 */
export function useToggleWishlist() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const t = useTranslations("wishlist");
  const { data: user } = useMe();
  const settings = useSettings();
  const toggleLocalItem = useWishlistStore((state) => state.toggleItem);

  return useMutation({
    mutationKey: wishlistKeys.toggle,
    mutationFn: async ({
      product,
      isWishlisted,
    }: {
      product: Product;
      isWishlisted: boolean;
    }): Promise<WishlistIdsResponse | null> => {
      if (settings?.features?.wishlist === false) {
        throw new Error("WISHLIST_DISABLED");
      }

      // Guest: save to Zustand store (persisted in localStorage) — no backend call
      if (!user) {
        toggleLocalItem(product);
        return null;
      }

      // Authenticated: send to backend
      const response = isWishlisted
        ? await wishlistApi.removeItem(product._id)
        : await wishlistApi.addItem(product._id);
      return response?.data ?? null;
    },
    onMutate: async ({ product, isWishlisted }) => {
      if (!user) return undefined;

      await queryClient.cancelQueries({ queryKey: wishlistKeys.ids });
      const previous = queryClient.getQueryData<WishlistIdsResponse>(
        wishlistKeys.ids,
      );
      queryClient.setQueryData<WishlistIdsResponse>(wishlistKeys.ids, (old) => {
        const ids = old?.productIds ?? [];
        return {
          productIds: isWishlisted
            ? ids.filter((id) => id !== product._id)
            : [product._id, ...ids.filter((id) => id !== product._id)],
        };
      });
      return { previous };
    },
    onSuccess: (data, { isWishlisted }) => {
      // Only trust the server snapshot when no other toggle is still in flight,
      // otherwise it would overwrite that toggle's optimistic state.
      if (data && queryClient.isMutating({ mutationKey: wishlistKeys.toggle }) <= 1) {
        queryClient.setQueryData(wishlistKeys.ids, data);
      }
      toast.success(isWishlisted ? t("toast.removed") : t("toast.added"));
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(wishlistKeys.ids, context.previous);
      } else if (context) {
        queryClient.invalidateQueries({ queryKey: wishlistKeys.ids });
      }
      toast.error(
        error.message === "WISHLIST_DISABLED"
          ? t("toast.disabled")
          : error.message || t("toast.error"),
      );
    },
    onSettled: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: wishlistKeys.list });
      }
    },
  });
}

// ─── Clear wishlist ─────────────────────────────────────────────────────────

export function useClearWishlist() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const t = useTranslations("wishlist");
  const { data: user } = useMe();
  const clearLocalWishlist = useWishlistStore((state) => state.clearWishlist);

  return useMutation({
    mutationFn: async () => {
      if (!user) {
        clearLocalWishlist();
        return null;
      }
      const response = await wishlistApi.clearWishlist();
      return response?.data ?? null;
    },
    onSuccess: async () => {
      if (user) {
        await queryClient.invalidateQueries({
          queryKey: wishlistKeys.all,
          refetchType: "all",
        });
      }
      toast.success(t("toast.cleared"));
    },
    onError: (error: Error) => {
      toast.error(error.message || t("toast.error"));
    },
  });
}

// ─── Sync Guest Wishlist to Backend ─────────────────────────────────────────

let inFlightSync: Promise<boolean> | null = null;

/**
 * Sends the guest's local wishlist to the backend in a single bulk request.
 *
 * - Only the items that were actually sent are removed from localStorage, so an
 *   item added while the request is in flight is not lost.
 * - On failure the local items are kept; `WishlistSyncer` retries on the next
 *   authenticated app load.
 * - Concurrent calls (login hook + WishlistSyncer) share the same request.
 *
 * @returns `true` if items were synced (caller should invalidate the wishlist queries).
 */
export const syncGuestWishlist = (): Promise<boolean> => {
  if (inFlightSync) return inFlightSync;

  inFlightSync = (async () => {
    const localItems = useWishlistStore.getState().items;
    if (!localItems || localItems.length === 0) return false;

    const productIds = localItems.map((item) => item.productId);
    try {
      await wishlistApi.syncWishlist(productIds);
      const synced = new Set(productIds);
      useWishlistStore.setState((state) => ({
        items: state.items.filter((item) => !synced.has(item.productId)),
      }));
      return true;
    } catch (error) {
      console.error("Failed to sync guest wishlist", error);
      return false;
    }
  })().finally(() => {
    inFlightSync = null;
  });

  return inFlightSync;
};
