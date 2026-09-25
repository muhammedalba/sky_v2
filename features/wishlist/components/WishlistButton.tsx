"use client";

import { memo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { HeartIcon } from "@/shared/ui/Icons";
import { Tooltip } from "@/shared/ui/Tooltip";
import { cn } from "@/lib/utils";
import { useSettings } from "@/app/providers/SettingsProvider";
import {
  useIsWishlisted,
  useToggleWishlist,
} from "@/features/wishlist/hooks/useWishlist";
import { Product } from "@/types";

interface WishlistButtonProps {
  product: Product;
  className?: string;
  iconClassName?: string;
  withTooltip?: boolean;
}

/**
 * Heart toggle used on product cards. Works for guests (localStorage) and
 * authenticated users (backend); renders nothing when the wishlist feature
 * is disabled from the store settings.
 */
function WishlistButton({
  product,
  className,
  iconClassName,
  withTooltip = false,
}: WishlistButtonProps) {
  const t = useTranslations("wishlist");
  const settings = useSettings();
  const isWishlisted = useIsWishlisted(product._id);
  const { mutate: toggleWishlist } = useToggleWishlist();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      toggleWishlist({ product, isWishlisted });
    },
    [toggleWishlist, product, isWishlisted],
  );

  if (settings?.features?.wishlist === false) return null;

  const label = isWishlisted ? t("actions.remove") : t("actions.add");
  const icon = (
    <HeartIcon
      className={cn(
        "w-4 h-4 transition-colors",
        isWishlisted && "fill-destructive text-destructive",
        iconClassName,
      )}
    />
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      title={label}
      aria-label={label}
      aria-pressed={isWishlisted}
      className={cn("cursor-pointer", className)}
    >
      {withTooltip ? (
        <Tooltip position="inset" content={label}>
          {icon}
        </Tooltip>
      ) : (
        icon
      )}
    </button>
  );
}

export default memo(WishlistButton);
