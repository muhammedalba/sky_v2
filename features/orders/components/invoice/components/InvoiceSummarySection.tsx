import React from "react";
import { ZatcaQrCode } from "./ZatcaQrCode";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";

interface InvoiceSummarySectionProps {
  subtotal: number;
  discount: number;
  shippingAmount: number;
  paymentFees: number;
  taxableSubtotal: number;
  tax: number;
  grandTotal: number;
  siteNameAr: string;
  crNo: string;
  createdAt?: string;
  arabicAmountWords: string;
  invoiceHash?: string;
}

export const InvoiceSummarySection: React.FC<InvoiceSummarySectionProps> = ({
  subtotal,
  discount,
  shippingAmount,
  paymentFees,
  taxableSubtotal,
  tax,
  grandTotal,
  siteNameAr,
  crNo,
  createdAt,
  arabicAmountWords,
  invoiceHash,
}) => {
  const formatCurrency = useFormatCurrency();

  return (
    <div className="space-y-2">
      <div className="flex gap-4 items-start pt-2 flex-wrap">
        {/* Left: ZATCA QR Code */}
        <div className="flex flex-col items-center justify-center p-1 bg-white">
          <ZatcaQrCode
            sellerName={siteNameAr}
            vatNumber={crNo}
            invoiceDateTime={
              createdAt
                ? new Date(createdAt).toISOString()
                : new Date().toISOString()
            }
            totalWithVat={subtotal?.toFixed(2)}
            vatAmount={tax?.toFixed(2)}
            invoiceHash={invoiceHash}
          />
        </div>

        {/* Right: Summary Breakdown Table */}
        <div className="flex-1 border border-black text-[10px]">
          <table className="w-full border-collapse">
            <tbody>
              <tr className="border-b border-black">
                <td className="bg-sky-100 font-bold p-1.5 border-l border-black text-right w-3/5">
                  إجمالي الفاتورة / Total Amount
                </td>
                <td className="p-1.5 font-mono font-bold text-left w-2/5">
                  {formatCurrency(subtotal)}
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="bg-sky-100 font-bold p-1.5 border-l border-black text-right">
                  مجموع الخصومات / Total Discount
                </td>
                <td className="p-1.5 font-mono font-bold text-left">
                  {formatCurrency(discount)}
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="bg-sky-100 font-bold p-1.5 border-l border-black text-right">
                  الصافي بعد الخصم - الخاضع للضريبة / Total Amount (Excluding VAT)
                </td>
                <td className="p-1.5 font-mono font-bold text-left">
                  {formatCurrency(taxableSubtotal)}
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="bg-sky-100 font-bold p-1.5 border-l border-black text-right">
                  تكلفة الشحن / Shipping Cost
                </td>
                <td className="p-1.5 font-mono font-bold text-left">
                  {formatCurrency(shippingAmount)}
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="bg-sky-100 font-bold p-1.5 border-l border-black text-right">
                  رسوم الدفع / Payment Fees
                </td>
                <td className="p-1.5 font-mono font-bold text-left">
                  {formatCurrency(paymentFees)}
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="bg-sky-100 font-bold p-1.5 border-l border-black text-right">
                  ضريبة القيمة المضافة / VAT Amount
                </td>
                <td className="p-1.5 font-mono font-bold text-left">
                  {formatCurrency(tax)}
                </td>
              </tr>
              <tr className="bg-sky-200 text-sky-950 font-black">
                <td className="p-1.5 border-l border-black text-right">
                  الإجمالي شامل ضريبة القيمة المضافة / Total Amount (Including VAT)
                </td>
                <td className="p-1.5 font-mono text-base text-left">
                  {formatCurrency(grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Amount in Words */}
      <div className="bg-slate-100 border border-black p-2 text-center text-xs font-bold text-slate-900">
        المبلغ المطلوب: {arabicAmountWords}
      </div>
    </div>
  );
};
