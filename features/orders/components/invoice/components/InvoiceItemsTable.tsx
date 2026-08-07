import React from "react";
import { OrderItem } from "@/features/orders/types";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { getLocalizedValue } from "../utils/invoiceUtils";

interface InvoiceItemsTableProps {
  items?: OrderItem[];
}

export const InvoiceItemsTable: React.FC<InvoiceItemsTableProps> = ({
  items,
}) => {
  const formatCurrency = useFormatCurrency();

  return (
    <div className="border border-black overflow-hidden">
      <table className="w-full text-center border-collapse text-[10px]">
        <thead>
          <tr className="bg-sky-100 text-sky-950 font-bold border-b border-black">
            <th className="p-1.5 border-l border-black w-8">#</th>
            <th className="p-1.5 border-l border-black text-right">
              البيان / Description
            </th>
            <th className="p-1.5 border-l border-black w-14">الكمية / Qty</th>
            <th className="p-1.5 border-l border-black w-20">
              الأفرادي / Price
            </th>
            <th className="p-1.5 border-l border-black w-24">
              الإجمالي / Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black">
          {items?.map((item, idx) => {
            const titleAr =
              getLocalizedValue(item.productId?.title, "ar") || "منتج";
            const titleEn = getLocalizedValue(item.productId?.title, "en");
            const itemQty = item.quantity || 1;
            const itemPrice = item.price || 0;
            const itemTotal = item.totalPrice || itemQty * itemPrice;

            return (
              <tr
                key={item.productId?._id || item.sku || idx}
                className="hover:bg-slate-50"
              >
                <td className="p-1.5 border-l border-black font-medium">
                  {idx + 1}
                </td>
                <td className="p-1.5 border-l border-black text-right">
                  <div className="font-semibold text-slate-900">{titleAr}</div>
                  {titleEn && (
                    <div className="text-[9px] text-slate-600 font-sans">
                      {titleEn}
                    </div>
                  )}
                  {typeof item.variantId === "object" &&
                    item.variantId?.attributes && (
                      <div className="flex flex-wrap gap-1 mt-1 max-w-50">
                        {Object.entries(item.variantId.attributes).map(
                          ([key, val]) => {
                            const valStr =
                              typeof val === "object" && val !== null
                                ? (val.value ?? JSON.stringify(val))
                                : val;
                            return (
                              <span
                                key={key}
                                className="inline-flex items-center px-1 py-0.5 rounded-md text-[8px] bg-secondary/80 text-secondary-foreground border border-border/30 capitalize whitespace-nowrap"
                              >
                                {key}: {String(valStr)}
                              </span>
                            );
                          },
                        )}
                      </div>
                    )}
                </td>
                <td className="p-1.5 border-l border-black font-medium">
                  {itemQty}
                </td>
                <td className="p-1.5 border-l border-black font-mono">
                  {formatCurrency(itemPrice)}
                </td>
                <td className="p-1.5 border-l border-black font-mono font-semibold">
                  {formatCurrency(itemTotal)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
