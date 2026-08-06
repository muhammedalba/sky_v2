import React from "react";
import { Order } from "@/features/orders/types";
import { formatDate } from "@/lib/utils";

interface InvoiceMetaTableProps {
  order: Order;
  orderYear: number;
  customerCity: string;
  customerCountry: string;
}

export const InvoiceMetaTable: React.FC<InvoiceMetaTableProps> = ({
  order,
  orderYear,
  customerCity,
  customerCountry,
}) => {
  const customerName =
    order.shippingAddress?.companyName ||
    (order.shippingAddress?.firstName || "") +
      " " +
      (order.shippingAddress?.lastName || "") ||
    "--";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 border-t border-black"></div>
        <h2 className="px-6 py-1 bg-sky-100 text-sky-950 border border-black font-black text-sm rounded text-center min-w-55">
          فاتورة ضريبية / Tax Invoice
        </h2>
        <div className="flex-1 border-t border-black"></div>
      </div>

      <table className="w-full border border-black text-center text-[10px] border-collapse">
        <tbody>
          <tr className="border-b border-black bg-muted">
            <td className="bg-slate-100 font-bold border-l border-black p-1.5 w-1/6">
              التاريخ / Date:
            </td>
            <td className="p-1.5 border-l border-black w-2/6 font-bold">
              {formatDate(order.createdAt, "en-US", "numeric")}
            </td>
            <td className="bg-slate-100 font-bold border-l border-black p-1.5 w-1/6">
              الرقم / No:
            </td>
            <td className="p-1.5 font-bold w-2/6">
              RUH-8-{orderYear}-
              {order.invoiceNumber
                ? String(order.invoiceNumber).padStart(4, "0")
                : order._id?.slice(-4)?.toUpperCase() || ""}
            </td>
          </tr>
          <tr className="border-b border-black">
            <td className="bg-slate-100 font-bold border-l border-black p-1.5">
              مكان التوصيل / Place of delivery:
            </td>
            <td colSpan={3} className="p-1.5 text-right font-semibold">
              {[customerCity, customerCountry]
                .filter(Boolean)
                .join(", ") || "المملكة العربية السعودية"}
            </td>
          </tr>
          <tr className="bg-muted">
            <td className="bg-slate-100 font-bold border-l border-black p-1.5">
              البيان / Description:
            </td>
            <td colSpan={3} className="p-1.5 text-right font-semibold">
              {`طلب شراء من العميل :  ${customerName}- ${order.deliveryReceiptNumber}`}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
