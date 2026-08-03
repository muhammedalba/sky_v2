"use client";

import React, { useRef } from "react";
import Modal from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/Button";
import { Order } from "@/features/orders/types";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { formatDate } from "@/lib/utils";
import { DownloadIcon } from "@/shared/ui/Icons";
import { Printer as PrinterIcon } from "lucide-react";

interface InvoicePreviewDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const getLocalizedValue = (
  val?: string | { en: string; ar: string },
  locale = "ar",
) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val[locale as "en" | "ar"] || val.ar || val.en || "";
};

const getLocationName = (
  loc?: string | { name?: string | { en?: string; ar?: string } },
) => {
  if (!loc) return "";
  if (typeof loc === "string") return loc;
  if (typeof loc.name === "string") return loc.name;
  if (loc.name && typeof loc.name === "object")
    return loc.name.ar || loc.name.en || "";
  return "";
};

// Helper for Arabic amount in words (تفقيط المبلغ)
function numberToArabicWords(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded <= 0) return "صفر ريال سعودي";

  const units = [
    "",
    "واحد",
    "اثنان",
    "ثلاثة",
    "أربعة",
    "خمسة",
    "ستة",
    "سبعة",
    "ثمانية",
    "تسعة",
  ];
  const tens = [
    "",
    "عشرة",
    "عشرون",
    "ثلاثون",
    "أربعون",
    "خمسون",
    "ستون",
    "سبعون",
    "ثمانون",
    "تسعون",
  ];
  const hundreds = [
    "",
    "مائة",
    "مائتان",
    "ثلاثمائة",
    "أربعمائة",
    "خمسمائة",
    "ستمائة",
    "سبعمائة",
    "ثمانمائة",
    "تسعمائة",
  ];
  const thousands = [
    "",
    "ألف",
    "ألفان",
    "ثلاثة آلاف",
    "أربعة آلاف",
    "خمسة آلاف",
    "ستة آلاف",
    "سبعة آلاف",
    "ثمانية آلاف",
    "تسعة آلاف",
  ];

  if (rounded < 10) return `${units[rounded]} ريال سعودي`;
  if (rounded < 100) {
    const u = rounded % 10;
    const t = Math.floor(rounded / 10);
    return u === 0
      ? `${tens[t]} ريال سعودي`
      : `${units[u]} و${tens[t]} ريال سعودي`;
  }
  if (rounded < 1000) {
    const h = Math.floor(rounded / 100);
    const rem = rounded % 100;
    if (rem === 0) return `${hundreds[h]} ريال سعودي`;
    return `${hundreds[h]} و${numberToArabicWords(rem)}`;
  }
  if (rounded < 10000) {
    const th = Math.floor(rounded / 1000);
    const rem = rounded % 1000;
    if (rem === 0) return `${thousands[th]} ريال سعودي`;
    return `${thousands[th]} و${numberToArabicWords(rem)}`;
  }

  return `${amount.toLocaleString("ar-SA")} ريال سعودي`;
}

// ZATCA-styled visual QR Code component
function ZatcaQrCode({ value }: { value: string }) {
  return (
    <div
      className="w-24 h-24 border border-black p-1 bg-white flex flex-col items-center justify-center"
      data-qr-value={value}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="5" y="5" width="25" height="25" fill="black" />
        <rect x="9" y="9" width="17" height="17" fill="white" />
        <rect x="13" y="13" width="9" height="9" fill="black" />

        <rect x="70" y="5" width="25" height="25" fill="black" />
        <rect x="74" y="9" width="17" height="17" fill="white" />
        <rect x="78" y="13" width="9" height="9" fill="black" />

        <rect x="5" y="70" width="25" height="25" fill="black" />
        <rect x="9" y="74" width="17" height="17" fill="white" />
        <rect x="13" y="78" width="9" height="9" fill="black" />

        <rect x="35" y="5" width="8" height="8" fill="black" />
        <rect x="50" y="5" width="8" height="8" fill="black" />
        <rect x="40" y="15" width="12" height="6" fill="black" />
        <rect x="58" y="15" width="6" height="12" fill="black" />

        <rect x="5" y="35" width="8" height="8" fill="black" />
        <rect x="15" y="45" width="10" height="10" fill="black" />
        <rect x="5" y="58" width="8" height="6" fill="black" />

        <rect x="35" y="35" width="30" height="30" fill="black" />
        <rect x="42" y="42" width="16" height="16" fill="white" />
        <rect x="47" y="47" width="6" height="6" fill="black" />

        <rect x="72" y="35" width="8" height="12" fill="black" />
        <rect x="85" y="40" width="10" height="8" fill="black" />
        <rect x="75" y="52" width="18" height="8" fill="black" />

        <rect x="35" y="70" width="12" height="8" fill="black" />
        <rect x="52" y="75" width="12" height="18" fill="black" />
        <rect x="35" y="85" width="14" height="10" fill="black" />

        <rect x="70" y="70" width="10" height="10" fill="black" />
        <rect x="85" y="70" width="10" height="10" fill="black" />
        <rect x="70" y="85" width="25" height="10" fill="black" />
      </svg>
    </div>
  );
}

export default function InvoicePreviewDialog({
  order,
  isOpen,
  onClose,
}: InvoicePreviewDialogProps) {
  const formatCurrency = useFormatCurrency();
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printAreaRef.current?.innerHTML;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Copy all existing stylesheets and style elements from the main document
    const headStyles = Array.from(
      document.querySelectorAll('style, link[rel="stylesheet"]'),
    )
      .map((node) => node.outerHTML)
      .join("\n");

    const customPrintStyle = `
      <style>
        @media print {
          @page { size: A4 portrait; margin: 8mm; }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        body {
          background-color: #ffffff !important;
          color: #000000 !important;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
          padding: 12px !important;
          margin: 0 !important;
          direction: rtl !important;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      </style>
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <title>فاتورة ضريبية - #${order?._id?.toUpperCase()}</title>
          ${headStyles}
          ${customPrintStyle}
        </head>
        <body class="bg-white text-slate-900 p-4">
          <div class="max-w-[850px] mx-auto bg-white text-slate-900">
            ${printContent}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Wait slightly for stylesheets and images to render in the print window
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  };

  const handleDownload = () => {
    if (order?.InvoicePdf) {
      const link = document.createElement("a");
      link.href = order.InvoicePdf;
      link.download = `Invoice-${order._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    handlePrint();
  };

  if (!order) return null;

  const subtotal = order.totalPrice || 0;
  const shipping = order.shippingAmount || 0;
  const discount = order.discountAmount || 0;
  const taxableSubtotal = subtotal - discount;
  const tax = order.taxAmount || taxableSubtotal * 0.15;
  const grandTotal = order.grandTotal || taxableSubtotal + tax + shipping;
  const orderYear = order.createdAt
    ? new Date(order.createdAt).getFullYear()
    : 2026;
  const userVat =
    (order.user as unknown as { vatNumber?: string })?.vatNumber || "-";
  const customerCountry =
    getLocationName(order.shippingAddress?.country) ||
    "المملكة العربية السعودية";
  const customerCity = getLocationName(order.shippingAddress?.city) || "-";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="معاينة الفاتورة الضريبية / Tax Invoice Preview"
      size="xl"
      footer={
        <div className="flex gap-2.5">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <PrinterIcon className="w-4 h-4" /> طباعة الفاتورة / Print Invoice
          </Button>
          <Button variant="default" onClick={handleDownload} className="gap-2">
            <DownloadIcon className="w-4 h-4" /> تحميل PDF / Download PDF
          </Button>
        </div>
      }
    >
      <div className="bg-card border border-border/40 rounded-2xl p-4 overflow-hidden max-h-[80vh] overflow-y-auto">
        {/* Printable Invoice Container */}
        <div
          ref={printAreaRef}
          className="bg-white text-slate-900 p-6 space-y-4 text-xs font-sans border border-slate-300 rounded-lg shadow-sm"
          dir="rtl"
        >
          {/* 1. Header Section with Logo & Bilingual Company Details */}
          <div className="grid grid-cols-3 items-center gap-2 pb-4 border-b border-black">
            {/* Left Column: English Info */}
            <div
              className="text-left text-[11px] leading-snug space-y-0.5 text-slate-800"
              dir="ltr"
            >
              <p className="font-bold text-xs text-black uppercase">
                Sky Galaxy Co. For trading
              </p>
              <p>
                <span className="font-semibold">CR No.:</span> 1010881633
              </p>
              <p>
                <span className="font-semibold">VAT Registration number:</span>{" "}
                311658655700003
              </p>
            </div>

            {/* Center Column: Logo & Tagline */}
            <div className="flex flex-col items-center justify-center text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/images/logo.png"
                alt="Sky Galaxy Logo"
                className="h-14 w-auto object-contain mb-1"
              />
              <p className="font-bold text-[12px] text-sky-950">Sky Galaxy</p>
              <p className="text-[9px] text-slate-600 font-medium">
                for insulation and building materials
              </p>
            </div>

            {/* Right Column: Arabic Info */}
            <div
              className="text-right text-[11px] leading-snug space-y-0.5 text-slate-800"
              dir="rtl"
            >
              <p className="font-bold text-xs text-black">
                شركة مجرة السماء للتجارة
              </p>
              <p>
                <span className="font-semibold">رقم السجل التجاري:</span>{" "}
                1010881633
              </p>
              <p>
                <span className="font-semibold">رقم التسجيل الضريبي:</span>{" "}
                311658655700003
              </p>
            </div>
          </div>

          {/* 2. Invoice Title Badge & Meta Grid Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 border-t border-black"></div>
              <h2 className="px-6 py-1 bg-sky-100 text-sky-950 border border-black font-black text-sm rounded text-center min-w-[220px]">
                فاتورة ضريبية / Tax Invoice
              </h2>
              <div className="flex-1 border-t border-black"></div>
            </div>

            <table className="w-full border border-black text-center text-[10px] border-collapse">
              <tbody>
                <tr className="border-b border-black">
                  <td className="bg-slate-100 font-bold border-l border-black p-1.5 w-1/6">
                    التاريخ / Date:
                  </td>
                  <td className="p-1.5 border-l border-black w-2/6">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="bg-slate-100 font-bold border-l border-black p-1.5 w-1/6">
                    الرقم / No:
                  </td>
                  <td className="p-1.5 font-mono font-bold w-2/6">
                    RUH-2-{orderYear} -{" "}
                    {order._id?.slice(-4)?.toUpperCase() || "7786"}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="bg-slate-100 font-bold border-l border-black p-1.5">
                    اذن الاستلام / Delivery No:
                  </td>
                  <td className="p-1.5 border-l border-black">
                    DEL-{order._id?.slice(-4)?.toUpperCase() || "-"}
                  </td>
                  <td className="bg-slate-100 font-bold border-l border-black p-1.5">
                    طلب الشراء / Sales Order:
                  </td>
                  <td className="p-1.5 font-mono">
                    #{order._id?.toUpperCase()}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="bg-slate-100 font-bold border-l border-black p-1.5">
                    مكان التوصيل / Place of delivery:
                  </td>
                  <td colSpan={3} className="p-1.5 text-right font-medium">
                    {[customerCity, customerCountry]
                      .filter(Boolean)
                      .join(", ") || "المملكة العربية السعودية"}
                  </td>
                </tr>
                <tr>
                  <td className="bg-slate-100 font-bold border-l border-black p-1.5">
                    البيان / Description:
                  </td>
                  <td colSpan={3} className="p-1.5 text-right font-medium">
                    {order.notes ||
                      `طلب شراء من العميل: ${order.user?.name || "عميل متجر مجرة السماء"}`}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Vendor Info Box */}
          <div className="border border-black text-[10px]">
            <div className="bg-sky-100 text-sky-950 font-bold p-1.5 border-b border-black flex justify-between items-center">
              <span>المورد / Vendor: شركة مجرة السماء للتجارة</span>
              <span>
                الرقم الضريبي للمنشأة / Vendor VAT No: 311658655700003
              </span>
            </div>
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-black font-semibold">
                  <th className="p-1 border-l border-black">البلد | Country</th>
                  <th className="p-1 border-l border-black">المدينة | City</th>
                  <th className="p-1 border-l border-black">المنطقة | Area</th>
                  <th className="p-1 border-l border-black">الشارع | Street</th>
                  <th className="p-1 border-l border-black">
                    صندوق بريد | Mail Box
                  </th>
                  <th className="p-1">الرمز البريدي | Po Box</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-1 border-l border-black">
                    المملكة العربية السعودية
                  </td>
                  <td className="p-1 border-l border-black">الرياض</td>
                  <td className="p-1 border-l border-black">حي جرير</td>
                  <td className="p-1 border-l border-black">
                    طريق صلاح الدين الايوبي
                  </td>
                  <td className="p-1 border-l border-black">7284</td>
                  <td className="p-1">12837</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 4. Customer Info Box */}
          <div className="border border-black text-[10px]">
            <div className="bg-sky-100 text-sky-950 font-bold p-1.5 border-b border-black flex justify-between items-center">
              <span>العميل / Customer: {order.user?.name || "عميل كوين"}</span>
              <span>الرقم الضريبي للعميل / Customer VAT No: {userVat}</span>
            </div>
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-black font-semibold">
                  <th className="p-1 border-l border-black">البلد | Country</th>
                  <th className="p-1 border-l border-black">المدينة | City</th>
                  <th className="p-1 border-l border-black">المنطقة | Area</th>
                  <th className="p-1 border-l border-black">الشارع | Street</th>
                  <th className="p-1 border-l border-black">
                    صندوق بريد | Mail Box
                  </th>
                  <th className="p-1">الرمز البريدي | Po Box</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-1 border-l border-black">
                    {customerCountry}
                  </td>
                  <td className="p-1 border-l border-black">{customerCity}</td>
                  <td className="p-1 border-l border-black">
                    {order.shippingAddress?.building || "-"}
                  </td>
                  <td className="p-1 border-l border-black">
                    {order.shippingAddress?.street || "-"}
                  </td>
                  <td className="p-1 border-l border-black">-</td>
                  <td className="p-1">
                    {order.shippingAddress?.postalCode || "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 5. Products Table */}
          <div className="border border-black overflow-hidden">
            <table className="w-full text-center border-collapse text-[10px]">
              <thead>
                <tr className="bg-sky-100 text-sky-950 font-bold border-b border-black">
                  <th className="p-1.5 border-l border-black w-8">#</th>
                  <th className="p-1.5 border-l border-black text-right">
                    البيان / Description
                  </th>
                  <th className="p-1.5 border-l border-black w-14">
                    الكمية / Qty
                  </th>
                  <th className="p-1.5 border-l border-black w-20">
                    الأفرادي / Price
                  </th>
                  <th className="p-1.5 border-l border-black w-24">
                    الإجمالي / Total
                  </th>
                  <th className="p-1.5 border-l border-black w-20">
                    الضريبة / VAT
                  </th>
                  <th className="p-1.5 w-24">المجموع النهائي / Final Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                {order.items?.map((item, idx) => {
                  const titleAr =
                    getLocalizedValue(item.productId?.title, "ar") || "منتج";
                  const titleEn = getLocalizedValue(
                    item.productId?.title,
                    "en",
                  );
                  const itemQty = item.quantity || 1;
                  const itemPrice = item.price || 0;
                  const itemTotal = item.totalPrice || itemQty * itemPrice;
                  const itemVat = itemTotal * 0.15;
                  const itemFinalTotal = itemTotal + itemVat;

                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-1.5 border-l border-black font-medium">
                        {idx + 1}
                      </td>
                      <td className="p-1.5 border-l border-black text-right">
                        <div className="font-semibold text-slate-900">
                          {titleAr}
                        </div>
                        {titleEn && (
                          <div className="text-[9px] text-slate-600 font-sans">
                            {titleEn}
                          </div>
                        )}
                        {item.sku && (
                          <div className="text-[9px] font-mono text-slate-500">
                            SKU: {item.sku}
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
                      <td className="p-1.5 border-l border-black font-mono text-slate-700">
                        {formatCurrency(itemVat)}
                      </td>
                      <td className="p-1.5 font-mono font-bold text-slate-900">
                        {formatCurrency(itemFinalTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 6. Summary Breakdown & QR Code Section */}
          <div className="flex gap-4 items-start pt-2">
            {/* Left: ZATCA QR Code */}
            <div className="flex flex-col items-center justify-center p-2 border border-black rounded bg-white">
              <ZatcaQrCode
                value={`Sky Galaxy|311658655700003|${order.createdAt}|${grandTotal}|${tax}`}
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
                      الصافي بعد الخصم - الخاضع للضريبة / Total Amount
                      (Excluding 15% VAT)
                    </td>
                    <td className="p-1.5 font-mono font-bold text-left">
                      {formatCurrency(taxableSubtotal)}
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="bg-sky-100 font-bold p-1.5 border-l border-black text-right">
                      ضريبة القيمة المضافة 15% / 15% VAT
                    </td>
                    <td className="p-1.5 font-mono font-bold text-left">
                      {formatCurrency(tax)}
                    </td>
                  </tr>
                  <tr className="bg-sky-200 text-sky-950 font-black">
                    <td className="p-1.5 border-l border-black text-right">
                      الإجمالي شامل 15% ضريبة القيمة المضافة / Total Amount
                      (Including 15% VAT)
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
            المبلغ المطلوب: {numberToArabicWords(grandTotal)}
          </div>

          {/* 7. Signatures & Bank Details */}
          <div className="grid grid-cols-2 gap-4 border border-black p-3 text-[10px]">
            {/* Signatures */}
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-dashed border-slate-400 pb-2">
                <span className="font-bold">أعدت من قبل / Prepared by:</span>
                <span className="font-mono">...........................</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold">المستلم / Received by:</span>
                <span className="font-mono">...........................</span>
              </div>
            </div>

            {/* Bank Account Info */}
            <div className="bg-slate-50 border-r border-black p-2 space-y-1 text-right font-medium">
              <p>
                <span className="font-bold">اسم الحساب / Account Name:</span>{" "}
                شركة مجرة السماء للتجارة
              </p>
              <p>
                <span className="font-bold">البنك / Bank:</span> مصرف الراجحي
              </p>
              <p>
                <span className="font-bold">رقم الحساب / Account No.:</span>{" "}
                289608019786591
              </p>
              <p>
                <span className="font-bold">رقم الحساب الدولي / IBAN:</span>{" "}
                SA21 8000 0289 6080 1978 6591
              </p>
            </div>
          </div>

          {/* Return Policy */}
          <div className="border border-red-500 bg-red-50 p-2 text-center text-[10px] font-semibold text-red-900">
            <p className="font-bold text-red-700 underline mb-0.5">
              سياسة الاستبدال والاسترجاع:
            </p>
            <p>
              استبدال واسترجاع خلال 5 أيام فقط من تاريخ الفاتورة شرط ان تكون
              المنتجات على حالتها الاصلية
            </p>
          </div>

          {/* 8. Company Official Address & Contact Info Footer */}
          <div className="border-t-2 border-black pt-2 text-center text-[9px] space-y-1 text-slate-700">
            <p className="font-semibold">
              المملكة العربية السعودية - الرياض - حي جرير - طريق صلاح الدين
              الأيوبي - رقم المبنى 5050 - الرقم البريدي 12837 - الرقم الفرعي
              7284
            </p>
            <p dir="ltr" className="font-sans text-[8.5px]">
              Kingdom of Saudi Arabia - Riyadh - Jareer Dist. - Salah Al Din Al
              Ayoubi Rd - Building No. 5050 - Postal Code 12837 - Secondary No.
              7284
            </p>
            <div className="flex justify-between items-center text-[8.5px] font-mono pt-1 text-slate-600 border-t border-slate-200">
              <span>
                Printed On:{" "}
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                })}
              </span>
              <span>1 / 1</span>
              <span>Mob: +966 054 485 7553 - E-mail: info@skygalaxyco.com</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
