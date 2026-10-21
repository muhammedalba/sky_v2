"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { Order } from "@/types";

interface OrderTaxNotesProps {
  order: Order;
  className?: string;
}

/**
 * Tax rules snapshotted on the order at purchase time (inclusive / exclusive,
 * taxed charges). Hidden for orders without a stored tax rate — older orders
 * only carry the schema defaults, which would be misleading here.
 */
export default function OrderTaxNotes({ order, className }: OrderTaxNotesProps) {
  const t = useTranslations("orders.taxInfo");

  if (!order.taxPercentage || order.taxPercentage <= 0) return null;

  return (
    <ul
      className={cn(
        "space-y-1 text-[11px] text-muted-foreground list-disc ps-4",
        className,
      )}
    >
      <li>
        {t(order.taxesIncluded ? "pricesIncludeTax" : "pricesExcludeTax", {
          percentage: order.taxPercentage,
        })}
      </li>
      <li>{t(order.applyTaxOnCharges ? "taxOnCharges" : "noTaxOnCharges")}</li>
    </ul>
  );
}
