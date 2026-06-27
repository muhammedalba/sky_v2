'use client';

import React, { useRef } from 'react';
import Modal from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { Order } from '@/types';
import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';
import { formatDate } from '@/lib/utils';
import { DownloadIcon } from '@/shared/ui/Icons';
import { Printer as PrinterIcon } from 'lucide-react';

interface InvoicePreviewDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const getLocalizedValue = (val?: string | { en: string; ar: string }, locale = 'en') => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val[locale as 'en' | 'ar'] || val.en || val.ar || '';
};

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

    const style = `
      <style>
        body { font-family: sans-serif; padding: 20px; color: #000; }
        .no-print { display: none; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border-bottom: 1px solid #ddd; padding: 8px; text-align: start; }
        th { background-color: #f5f5f5; }
        .text-right { text-align: end; }
        .text-center { text-align: center; }
        .bold { font-weight: bold; }
        .flex { display: flex; }
        .justify-between { justify-content: space-between; }
        .gap-4 { gap: 16px; }
        .mb-8 { margin-bottom: 32px; }
        .mt-8 { margin-top: 32px; }
        .border-t { border-top: 1px solid #ccc; }
        .pt-4 { padding-top: 16px; }
      </style>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<html><head><title>Invoice #${order?._id?.toUpperCase()}</title>${style}</head><body>${printContent}</body></html>`);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const handleDownload = () => {
    // If InvoicePdf exists, download it
    if (order?.InvoicePdf) {
      const link = document.createElement('a');
      link.href = order.InvoicePdf;
      link.download = `Invoice-${order._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Otherwise trigger print window to save as PDF
    handlePrint();
  };

  if (!order) return null;

  const subtotal = order.totalPrice || 0;
  const shipping = order.shippingAmount || 0;
  const discount = order.discountAmount || 0;
  const tax = order.taxAmount || 0;
  const grandTotal = order.grandTotal || order.totalPrice || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invoice Preview"
      size="lg"
      footer={
        <div className="flex gap-2.5">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <PrinterIcon className="w-4 h-4" /> Print Invoice
          </Button>
          <Button variant="default" onClick={handleDownload} className="gap-2">
            <DownloadIcon className="w-4 h-4" /> Download PDF
          </Button>
        </div>
      }
    >
      <div className="bg-card border border-border/40 rounded-2xl p-6 overflow-hidden">
        {/* Printable Area */}
        <div ref={printAreaRef} className="space-y-8 bg-card text-foreground">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-border/20 pb-6">
            <div>
              <h2 className="text-xl font-black uppercase tracking-wider text-primary">
                skyGalaxy Store
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Tax Number: 300000000000003
              </p>
              <p className="text-xs text-muted-foreground">
                Riyadh, Saudi Arabia
              </p>
            </div>
            <div className="text-end">
              <h3 className="text-lg font-black text-foreground">INVOICE</h3>
              <p className="text-xs text-muted-foreground mt-1 font-mono font-semibold">
                #{order._id?.toUpperCase()}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Date: {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          {/* Customer & Shipping info */}
          <div className="grid grid-cols-2 gap-8 text-xs">
            <div>
              <h4 className="font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Billed To
              </h4>
              <p className="font-semibold text-foreground">
                {order.user?.name || 'Guest Customer'}
              </p>
              <p className="text-muted-foreground mt-0.5">
                {order.user?.email || ''}
              </p>
              {order.user?.phone && (
                <p className="text-muted-foreground">{order.user.phone}</p>
              )}
            </div>
            <div>
              <h4 className="font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Shipping Details
              </h4>
              {order.shippingAddress ? (
                <p className="text-muted-foreground leading-relaxed">
                  {[
                    order.shippingAddress.building,
                    order.shippingAddress.street,
                    order.shippingAddress.city,
                    order.shippingAddress.country,
                    order.shippingAddress.postalCode,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              ) : (
                <p className="text-muted-foreground italic">No address provided</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-start border-collapse text-xs mt-6">
            <thead>
              <tr className="border-b border-border/40 text-muted-foreground font-semibold">
                <th className="pb-3 w-1/2">Product Description</th>
                <th className="pb-3 text-center">Quantity</th>
                <th className="pb-3 text-end">Price</th>
                <th className="pb-3 text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {order.items?.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 font-semibold text-foreground">
                    {getLocalizedValue(item.productId?.title, 'en') || 'Unknown Product'}
                    {item.sku && (
                      <span className="block text-[10px] text-muted-foreground font-mono font-medium mt-0.5">
                        SKU: {item.sku}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-center font-medium">{item.quantity}</td>
                  <td className="py-3 text-end text-muted-foreground tabular-nums">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="py-3 text-end font-bold text-foreground tabular-nums">
                    {formatCurrency(item.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary Breakdown */}
          <div className="flex justify-end pt-4 border-t border-border/20">
            <div className="w-64 text-xs space-y-2.5">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums font-semibold">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              {shipping > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="tabular-nums font-semibold">
                    {formatCurrency(shipping)}
                  </span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-red-500 dark:text-red-400">
                  <span>Discount</span>
                  <span className="tabular-nums font-bold">
                    -{formatCurrency(discount)}
                  </span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax</span>
                  <span className="tabular-nums font-semibold">
                    {formatCurrency(tax)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-border/30 pt-2 text-sm font-black text-foreground">
                <span>Total Due</span>
                <span className="tabular-nums text-primary text-base">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
