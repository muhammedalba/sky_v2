"use client";

import { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import Modal from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/Button";
import { Order } from "@/features/orders/types";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { formatDate } from "@/lib/utils";
import { DownloadIcon, SpinnerIcon } from "@/shared/ui/Icons";
import { Printer as PrinterIcon } from "lucide-react";
import { useSettings } from "@/features/settings/hooks/useSettings";


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

/**
 * Encodes invoice data into ZATCA Phase-1 compliant Base64 TLV string.
 * Format per ZATCA standard:
 *   Tag 01 → Seller Name
 *   Tag 02 → VAT Registration Number
 *   Tag 03 → Invoice Date/Time (ISO 8601)
 *   Tag 04 → Invoice Total (with VAT)
 *   Tag 05 → VAT Amount
 *
 * The resulting Base64 string is what the official ZATCA "Fatoora" app scans.
 */
function buildZatcaTlvBase64({
  sellerName,
  vatNumber,
  invoiceDateTime,
  totalWithVat,
  vatAmount,
}: {
  sellerName: string;
  vatNumber: string;
  invoiceDateTime: string;
  totalWithVat: string;
  vatAmount: string;
}): string {
  const encoder = new TextEncoder();

  function encodeTlv(tag: number, value: string): Uint8Array {
    const valueBytes = encoder.encode(value);
    const tlv = new Uint8Array(2 + valueBytes.length);
    tlv[0] = tag;
    tlv[1] = valueBytes.length;
    tlv.set(valueBytes, 2);
    return tlv;
  }

  const fields = [
    encodeTlv(1, sellerName),
    encodeTlv(2, vatNumber),
    encodeTlv(3, invoiceDateTime),
    encodeTlv(4, totalWithVat),
    encodeTlv(5, vatAmount),
  ];

  const totalLength = fields.reduce((sum, f) => sum + f.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const field of fields) {
    merged.set(field, offset);
    offset += field.length;
  }

  // Convert Uint8Array → Base64
  let binary = "";
  merged.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
}

/**
 * ZATCA Phase-1 QR Code component.
 * Accepts structured invoice data, encodes it to TLV Base64,
 * and renders a real scannable QR code.
 */
function ZatcaQrCode({
  sellerName,
  vatNumber,
  invoiceDateTime,
  totalWithVat,
  vatAmount,
}: {
  sellerName: string;
  vatNumber: string;
  invoiceDateTime: string;
  totalWithVat: string;
  vatAmount: string;
}) {
  const base64Tlv = buildZatcaTlvBase64({
    sellerName,
    vatNumber,
    invoiceDateTime,
    totalWithVat,
    vatAmount,
  });

  return (
    <div className="w-36 h-36 bg-white flex flex-col items-center justify-center">
      <QRCodeSVG
        value={base64Tlv}
        size={140}
        bgColor="#ffffff"
        fgColor="#000000"
        level="M"
      />
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
  const { data: settings, isLoading: isSettingsLoading } = useSettings();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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
          <div class="max-w-212.5 mx-auto bg-white text-slate-900">
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

  const handleDownload = async () => {
    const element = printAreaRef.current;
    if (!element) return;

    setIsGeneratingPdf(true);
    try {
      // html-to-image uses SVG foreignObject: the browser itself renders the element,
      // so all modern CSS (oklch, lab, grid, etc.) works natively without a custom parser.
      const [{ toPng }, { default: jsPDF }] = await Promise.all([
        import("html-to-image"),
        import("jspdf"),
      ]);

      // Capture at 2x pixel ratio for retina quality
      const pixelRatio = window.devicePixelRatio || 2;
      const imgData = await toPng(element, {
        quality: 1,
        pixelRatio: Math.max(pixelRatio, 2),
        backgroundColor: "#ffffff",
        skipFonts: false, // keep Arabic fonts
        fetchRequestInit: { cache: "force-cache" },
      });

      // A4: 210 × 297 mm
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Fit the entire invoice into a single A4 page:
      // If the image is taller than the page, scale it down proportionally.
      const img = new Image();
      img.src = imgData;
      await new Promise<void>((res) => {
        img.onload = () => res();
      });

      const imgRatio = img.height / img.width;
      const imgWidthFull = pageWidth;
      const imgHeightFull = pageWidth * imgRatio;

      // Scale down if the content overflows page height
      const scale = imgHeightFull > pageHeight ? pageHeight / imgHeightFull : 1;
      const finalW = imgWidthFull * scale;
      const finalH = imgHeightFull * scale;

      // Center horizontally in case scale reduced the width
      const xOffset = (pageWidth - finalW) / 2;

      pdf.addImage(imgData, "PNG", xOffset, 0, finalW, finalH);

      pdf.save(
        `Invoice ${order?.shippingAddress?.firstName ?? "N/A"} ${
          order?.shippingAddress?.lastName ?? "N/A"
        }-${order?.deliveryReceiptNumber ?? "order"}.pdf`,
      );
    } catch (err) {
      console.error("PDF generation failed:", err);
      // Fallback: open browser print dialog
      handlePrint();
    } finally {
      setIsGeneratingPdf(false);
    }
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

  // Dynamic Store Settings
  const siteNameAr = getLocalizedValue(settings?.siteName, "ar") || "متجري";
  const siteNameEn = getLocalizedValue(settings?.siteName, "en") || "My Store";
  const siteLogo = settings?.logo || "/assets/images/logo.png";
  const crNo = settings?.businessAddress?.crNo || "-";
  const vatNo = settings?.businessAddress?.vatNo || "-";

  const bankName = settings?.bankTransferDetails?.bankName || "-";
  const accountName = settings?.bankTransferDetails?.accountName || "-";
  const accountNumber = settings?.bankTransferDetails?.accountNumber || "-";
  const iban = settings?.bankTransferDetails?.iban || "-";

  const email = settings?.contactInfo?.email || "";
  const phone = settings?.contactInfo?.phones?.[0] || "";

  const companyCountryAr =
    getLocalizedValue(settings?.businessAddress?.country, "ar") ||
    "المملكة العربية السعودية";
  const companyCountryEn =
    getLocalizedValue(settings?.businessAddress?.country, "en") ||
    "Saudi Arabia";
  const companyCityAr =
    getLocalizedValue(settings?.businessAddress?.city, "ar") || "-";
  const companyCityEn =
    getLocalizedValue(settings?.businessAddress?.city, "en") || "-";
  const companyAreaAr =
    getLocalizedValue(settings?.businessAddress?.area, "ar") || "-";
  const companyAreaEn =
    getLocalizedValue(settings?.businessAddress?.area, "en") || "-";
  const companyStreetAr =
    getLocalizedValue(settings?.businessAddress?.street, "ar") || "-";
  const companyStreetEn =
    getLocalizedValue(settings?.businessAddress?.street, "en") || "-";
  const mailBox = settings?.businessAddress?.mailBox || "-";
  const poBox = settings?.businessAddress?.poBox || "-";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="معاينة الفاتورة الضريبية / Tax Invoice Preview"
      size="xl"
      footer={
        <div className="flex gap-2.5">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="gap-2"
            disabled={isSettingsLoading}
          >
            <PrinterIcon className="w-4 h-4" /> طباعة الفاتورة / Print Invoice
          </Button>
          <Button
            variant="default"
            onClick={handleDownload}
            className="gap-2"
            disabled={isSettingsLoading || isGeneratingPdf}
          >
            {isGeneratingPdf ? (
              <>
                <SpinnerIcon className="w-4 h-4 animate-spin" />
                جاري إنشاء PDF...
              </>
            ) : (
              <>
                <DownloadIcon className="w-4 h-4" /> تحميل PDF / Download PDF
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="bg-card border border-border/40 rounded-2xl p-4 overflow-hidden max-h-[80vh] overflow-y-auto">
        {isSettingsLoading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <SpinnerIcon className="w-8 h-8 text-primary" />
            <p className="text-xs font-bold text-muted-foreground">
              جاري تحميل إعدادات الفاتورة...
            </p>
          </div>
        ) : (
          /* Printable Invoice Container */
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
                  {siteNameEn}
                </p>
                <p>
                  <span className="font-semibold">CR No.:</span> {crNo}
                </p>
                <p>
                  <span className="font-semibold">
                    VAT Registration number:
                  </span>{" "}
                  {vatNo}
                </p>
              </div>

              {/* Center Column: Logo & Tagline */}
              <div className="flex flex-col items-center justify-center text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={siteLogo}
                  alt={`${siteNameAr} Logo`}
                  className="h-14 w-auto object-contain mb-1"
                />
                <p className="font-bold text-[12px] text-sky-950">
                  {siteNameAr}
                </p>
                <p className="text-[9px] text-slate-600 font-medium">
                  {siteNameEn}
                </p>
              </div>

              {/* Right Column: Arabic Info */}
              <div
                className="text-right text-[11px] leading-snug space-y-0.5 text-slate-800"
                dir="rtl"
              >
                <p className="font-bold text-xs text-black">{siteNameAr}</p>
                <p>
                  <span className="font-semibold">رقم السجل التجاري:</span>{" "}
                  {crNo}
                </p>
                <p>
                  <span className="font-semibold">رقم التسجيل الضريبي:</span>{" "}
                  {vatNo}
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
                    <td className="p-1.5 border-l border-black font-bold">
                      {order.deliveryReceiptNumber ||
                        `DEL-${order._id?.slice(-4)?.toUpperCase() || "-"}`}
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
                <span>المورد / Vendor: {siteNameAr}</span>
                <span>الرقم الضريبي للمنشأة / Vendor VAT No: {vatNo}</span>
              </div>
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-black font-semibold">
                    <th className="p-1 border-l border-black">
                      البلد | Country
                    </th>
                    <th className="p-1 border-l border-black">
                      المدينة | City
                    </th>
                    <th className="p-1 border-l border-black">
                      المنطقة | Area
                    </th>
                    <th className="p-1 border-l border-black">
                      الشارع | Street
                    </th>
                    <th className="p-1 border-l border-black">
                      صندوق بريد | Mail Box
                    </th>
                    <th className="p-1">الرمز البريدي | Po Box</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-1 border-l border-black">
                      {companyCountryAr} | {companyCountryEn}
                    </td>
                    <td className="p-1 border-l border-black">
                      {companyCityAr} | {companyCityEn}
                    </td>
                    <td className="p-1 border-l border-black">
                      {companyAreaAr} | {companyAreaEn}
                    </td>
                    <td className="p-1 border-l border-black">
                      {companyStreetAr} | {companyStreetEn}
                    </td>
                    <td className="p-1 border-l border-black">{mailBox}</td>
                    <td className="p-1">{poBox}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. Customer Info Box */}
            <div className="border border-black text-[10px]">
              <div className="bg-sky-100 text-sky-950 font-bold p-1.5 border-b border-black flex justify-between items-center">
                <span>
                  العميل / Customer: {order.user?.name || "عميل كوين"}
                </span>
                <span>الرقم الضريبي للعميل / Customer VAT No: {userVat}</span>
              </div>
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-black font-semibold">
                    <th className="p-1 border-l border-black">
                      البلد | Country
                    </th>
                    <th className="p-1 border-l border-black">
                      المدينة | City
                    </th>
                    <th className="p-1 border-l border-black">
                      المنطقة | Area
                    </th>
                    <th className="p-1 border-l border-black">
                      الشارع | Street
                    </th>
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
                    <td className="p-1 border-l border-black">
                      {customerCity}
                    </td>
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
                    <th className="p-1.5 w-24">
                      المجموع النهائي / Final Total
                    </th>
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
            <div className="space-y-2">
              <div className="flex gap-4 items-start pt-2">
                {/* Left: ZATCA QR Code */}
                <div className="flex flex-col items-center justify-center p-2 border border-black rounded bg-white">
                  <ZatcaQrCode
                    sellerName={siteNameAr}
                    vatNumber={crNo}
                    invoiceDateTime={
                      order.createdAt
                        ? new Date(order.createdAt).toISOString()
                        : new Date().toISOString()
                    }
                    totalWithVat={grandTotal.toFixed(2)}
                    vatAmount={tax.toFixed(2)}
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
                          (Excluding VAT)
                        </td>
                        <td className="p-1.5 font-mono font-bold text-left">
                          {formatCurrency(taxableSubtotal)}
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
                          الإجمالي شامل ضريبة القيمة المضافة / Total Amount
                          (Including VAT)
                        </td>
                        <td className="p-1.5 font-mono text-base text-left">
                          {formatCurrency(grandTotal)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
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
                  {accountName}
                </p>
                <p>
                  <span className="font-bold">البنك / Bank:</span> {bankName}
                </p>
                <p>
                  <span className="font-bold">رقم الحساب / Account No.:</span>{" "}
                  {accountNumber}
                </p>
                <p>
                  <span className="font-bold">رقم الحساب الدولي / IBAN:</span>{" "}
                  {iban}
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
                {companyCountryAr} - {companyCityAr} - {companyAreaAr} -{" "}
                {companyStreetAr} - صندوق بريد {mailBox} - الرمز البريدي {poBox}
              </p>
              <p dir="ltr" className="font-sans text-[8.5px]">
                {companyCountryEn} - {companyCityEn} - {companyAreaEn} -{" "}
                {companyStreetEn} - P.O. Box {mailBox} - Postal Code {poBox}
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
                <span>
                  {phone && `Mob: ${phone} - `}
                  {email && `E-mail: ${email}`}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
