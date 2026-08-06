"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import Modal from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/Button";
import { Order } from "@/features/orders/types";
import { DownloadIcon, SpinnerIcon } from "@/shared/ui/Icons";
import { Printer as PrinterIcon } from "lucide-react";
import { useSettings } from "@/features/settings/hooks/useSettings";

import { useInvoiceData } from "./invoice/hooks/useInvoiceData";
import { InvoiceHeader } from "./invoice/components/InvoiceHeader";
import { InvoiceMetaTable } from "./invoice/components/InvoiceMetaTable";
import { InvoicePartyBox } from "./invoice/components/InvoicePartyBox";
import { InvoiceItemsTable } from "./invoice/components/InvoiceItemsTable";
import { InvoiceSummarySection } from "./invoice/components/InvoiceSummarySection";
import { InvoiceFooterSection } from "./invoice/components/InvoiceFooterSection";

interface InvoicePreviewDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function InvoicePreviewDialog({
  order,
  isOpen,
  onClose,
}: InvoicePreviewDialogProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const { data: settings, isLoading: isSettingsLoading } = useSettings();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Preload PDF modules lazily when dialog opens to eliminate latency on user click
  useEffect(() => {
    if (isOpen) {
      import("html-to-image");
      import("jspdf");
    }
  }, [isOpen]);

  // Extract all calculated invoice data via custom hook
  const data = useInvoiceData(order, settings);

  const handlePrint = useCallback(() => {
    const printContent = printAreaRef.current?.innerHTML;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

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
          <title>فاتورة ضريبية - #${order?.invoiceNumber?.toString()?.toUpperCase()}</title>
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

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  }, [order?.invoiceNumber]);

  const handleDownload = useCallback(async () => {
    const element = printAreaRef.current;
    if (!element) return;

    setIsGeneratingPdf(true);
    try {
      const [{ toPng }, { default: jsPDF }] = await Promise.all([
        import("html-to-image"),
        import("jspdf"),
      ]);

      const pixelRatio = window.devicePixelRatio || 2;
      const imgData = await toPng(element, {
        quality: 1,
        pixelRatio: Math.max(pixelRatio, 2),
        backgroundColor: "#ffffff",
        skipFonts: false,
        fetchRequestInit: { cache: "force-cache" },
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const img = new Image();
      img.src = imgData;
      await new Promise<void>((res) => {
        img.onload = () => res();
      });

      const imgRatio = img.height / img.width;
      const imgWidthFull = pageWidth;
      const imgHeightFull = pageWidth * imgRatio;

      const scale = imgHeightFull > pageHeight ? pageHeight / imgHeightFull : 1;
      const finalW = imgWidthFull * scale;
      const finalH = imgHeightFull * scale;

      const xOffset = (pageWidth - finalW) / 2;

      pdf.addImage(imgData, "PNG", xOffset, 0, finalW, finalH);

      pdf.save(
        `Invoice ${order?.shippingAddress?.firstName ?? "N/A"} ${
          order?.shippingAddress?.lastName ?? "N/A"
        }-${order?.deliveryReceiptNumber ?? "order"}.pdf`,
      );
    } catch (err) {
      console.error("PDF generation failed:", err);
      handlePrint();
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [
    handlePrint,
    order?.shippingAddress?.firstName,
    order?.shippingAddress?.lastName,
    order?.deliveryReceiptNumber,
  ]);

  // Short-circuit rendering if modal is closed or order/data is null
  if (!isOpen || !order || !data) return null;

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
            <PrinterIcon className="w-4 h-4" />Print Invoice
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
                <DownloadIcon className="w-4 h-4" />Download PDF
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="bg-card  p-4 overflow-hidden max-h-[80vh] overflow-y-auto">
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
            className="bg-white text-slate-900 p-6 space-y-4 text-xs font-sans "
            dir="rtl"
          >
            {/* 1. Header Section */}
            <InvoiceHeader
              siteNameAr={data.siteNameAr}
              siteNameEn={data.siteNameEn}
              siteLogo={data.siteLogo}
              crNo={data.crNo}
              vatNo={data.vatNo}
            />

            {/* 2. Invoice Meta Table */}
            <InvoiceMetaTable
              order={order}
              orderYear={data.orderYear}
              customerCity={data.customerCity}
              customerCountry={data.customerCountry}
            />

            {/* 3. Vendor Info Box */}
            <InvoicePartyBox
              titleAr="المورد"
              titleEn="Vendor"
              name={data.siteNameAr}
              vatTitleAr="الرقم الضريبي للمنشأة"
              vatTitleEn="Vendor VAT No"
              vatNo={data.crNo}
              address={{
                country: `${data.companyCountryAr} | ${data.companyCountryEn}`,
                city: `${data.companyCityAr} | ${data.companyCityEn}`,
                area: `${data.companyAreaAr} | ${data.companyAreaEn}`,
                street: `${data.companyStreetAr} | ${data.companyStreetEn}`,
                mailBox: data.mailBox,
                poBox: data.poBox,
              }}
            />

            {/* 4. Customer Info Box */}
            <InvoicePartyBox
              titleAr="العميل"
              titleEn="Customer"
              name={` ${order.shippingAddress?.companyName || (order.shippingAddress?.firstName || "") + " " + (order.shippingAddress?.lastName || "") || "N/A"}`}
              vatTitleAr="الرقم الضريبي للعميل"
              vatTitleEn="Customer VAT No"
              vatNo={data.userVat}
              address={{
                country: data.customerCountry,
                city: data.customerCity,
                area: order.shippingAddress?.building || "-",
                street: order.shippingAddress?.street || "-",
                mailBox: "-",
                poBox: order.shippingAddress?.postalCode || "-",
              }}
            />

            {/* 5. Products Table */}
            <InvoiceItemsTable items={order.items} />

            {/* 6. Summary Breakdown & QR Code Section */}
            <InvoiceSummarySection
              subtotal={data.subtotal}
              discount={data.discount}
              shippingAmount={data.shipping}
              paymentFees={data.paymentFees}
              taxableSubtotal={data.taxableSubtotal}
              tax={data.tax}
              grandTotal={data.grandTotal}
              siteNameAr={data.siteNameAr}
              crNo={data.crNo}
              createdAt={order.createdAt}
              arabicAmountWords={data.arabicAmountWords}
              invoiceHash={order.invoiceHash}
            />

            {/* 7 & 8. Signatures, Bank Details, Return Policy & Footer */}
            <InvoiceFooterSection
              accountName={data.accountName}
              bankName={data.bankName}
              accountNumber={data.accountNumber}
              iban={data.iban}
              companyCountryAr={data.companyCountryAr}
              companyCityAr={data.companyCityAr}
              companyAreaAr={data.companyAreaAr}
              companyStreetAr={data.companyStreetAr}
              companyCountryEn={data.companyCountryEn}
              companyCityEn={data.companyCityEn}
              companyAreaEn={data.companyAreaEn}
              companyStreetEn={data.companyStreetEn}
              mailBox={data.mailBox}
              poBox={data.poBox}
              phone={data.phone}
              email={data.email}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
