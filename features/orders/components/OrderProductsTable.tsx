"use client";

import { Order } from "@/features/orders/types";

import ImageWithFallback from "@/shared/ui/image/ImageWithFallback";
import { useTrans } from "@/shared/hooks/useTrans";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";

interface OrderProductsTableProps {
  order: Order;
}

export default function OrderProductsTable({ order }: OrderProductsTableProps) {
  const getTrans = useTrans();
 const t = useTranslations("orders");
  const totalItemsCount = order.items?.length || 0;
const formatCurrency = useFormatCurrency();
  return (
    <div className="border border-border/40 shadow-xs bg-card rounded-2xl overflow-hidden">
      <div className="p-4 bg-muted">
        <h3 className="text-md font-bold title-gradient ">
            {t("orderItems")} ({totalItemsCount})
        </h3>
      </div >
      <div className="overflow-x-auto ">
        {/* Products List Compact Table */}
        <div className="space-y-2">
          <div className="rounded-xl overflow-x-auto bg-card">
            <table className="w-full text-start border-collapse text-xs">
              <thead>
                <tr className="bg-muted/40 border-b border-border/40 text-muted-foreground font-semibold  ">
                  <th className="p-3 text-start ">{t("product")}</th>
                  <th className="p-3 text-start ">{t("sku")}</th>
                  <th className="p-3 text-start ">{t("qty")}</th>
                  <th className="p-3 text-start ">{t("unitPrice")}</th>
                  <th className="p-3 text-start ">{t("fields.total")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {order.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-muted/10">
                    <td className="p-3 flex items-center gap-2 min-w-0">
                      <Link href={`/dashboard/products/${item.productId?.slug}/edit`} className="w-8 h-8 rounded-lg relative overflow-hidden shrink-0 bg-muted/40">
                        {(item.productId?.imageCover ||
                          item.productId?.images?.[0]) && (
                          <ImageWithFallback
                            src={
                              item.productId.imageCover ||
                              item.productId.images?.[0] ||
                              ""
                            }
                            alt={getTrans(item.productId.title)}
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        )}
                      </Link>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-foreground truncate max-w-[150px]">
                          {getTrans(item.productId?.title)}
                        </span>
                        {typeof item.variantId === "object" &&
                          item.variantId?.attributes && (
                            <div className="flex flex-wrap gap-1 mt-1 max-w-[200px]">
                              {Object.entries(item.variantId.attributes).map(
                                ([key, val]) => {
                                  const valStr =
                                    typeof val === "object" && val
                                      ? ((val as Record<string, unknown>)
                                          .value ?? JSON.stringify(val))
                                      : val;
                                  return (
                                    <span
                                      key={key}
                                      className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-secondary/80 text-secondary-foreground border border-border/30 capitalize whitespace-nowrap"
                                    >
                                      {key}: {String(valStr)}
                                    </span>
                                  );
                                },
                              )}
                            </div>
                          )}
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground font-mono">
                      {item.sku || item.variantId?.sku || "—"}
                    </td>
                    <td className="p-3 text-center font-medium">
                      {item.quantity}
                    </td>
                    <td className="p-3 text-end text-muted-foreground tabular-nums">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="p-3 text-end font-bold text-foreground tabular-nums">
                      {formatCurrency(item.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="py-4 border-t border-border/40 text-center bg-muted">
        <Link
          href="/dashboard/products"
          className="text-xs font-bold text-primary hover:underline hover:text-primary/90 transition-colors"
        >
         {t("actions.viewProducts")}
        </Link>
      </div>
    </div>
  );
}
