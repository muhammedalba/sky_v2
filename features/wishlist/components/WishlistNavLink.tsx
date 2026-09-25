"use client";

import { memo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { cn } from "@/lib/utils";
import { HeartIcon } from "@/shared/ui/Icons";
import { useSettings } from "@/app/providers/SettingsProvider";
import { useWishlistIds } from "@/features/wishlist/hooks/useWishlist";

/** Navbar heart icon linking to the wishlist page, with an item-count badge. */
function WishlistNavLink({ className }: { className?: string }) {
  const t = useTranslations("store.nav");
  const settings = useSettings();
  const count = useWishlistIds().length;

  if (settings?.features?.wishlist === false) return null;

  const label = t.has("wishlist") ? t("wishlist") : "Wishlist";

  return (
    <Link
      href="/wishlist"
      title={label}
      aria-label={`${label} (${count})`}
      className={cn(
        "relative flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-accent/50 transition-all duration-300 group",
        className,
      )}
    >
      <div className="relative cursor-pointer">
        <HeartIcon className="size-4 text-foreground/70 group-hover:text-primary transition-colors duration-300" />
        {count > 0 && (
          <span className="absolute -top-3 -right-4 min-w-4.5 h-4.5 px-1 flex items-center justify-center text-[10px] font-bold text-white bg-primary rounded-full animate-badge-pop shadow-sm">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </div>
    </Link>
  );
}

export default memo(WishlistNavLink);
