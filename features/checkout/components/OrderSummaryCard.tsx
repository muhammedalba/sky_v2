"use client";

import Image from "next/image";
import { Package, Tag, ShieldCheck, Lock } from "lucide-react";
import { CartItem, resolveItemData } from "@/features/cart/utils/cartUtils";

interface OrderSummaryCardProps {
  cartItems: CartItem[];
  subtotal: number;
  preview: any;
  isAr: boolean;
  formatCurrency: (n: number) => string;
  getTrans: (v: any) => string;
  showPreviewDetails: boolean;
}

export function OrderSummaryCard({
  cartItems,
  subtotal,
  preview,
  isAr,
  formatCurrency,
  getTrans,
  showPreviewDetails,
}: OrderSummaryCardProps) {
  return (
    <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-xl shadow-primary/5 sticky top-24">
      {/* Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-primary/10 to-transparent border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/15 rounded-xl">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-black text-foreground">
            {isAr ? "ملخص الطلب" : "Order Summary"}
          </h2>
        </div>
      </div>

      {/* Items */}
      <div className="px-5 py-4 space-y-3 max-h-52 overflow-y-auto border-b border-border/40">
        {cartItems.map((item: CartItem, idx: number) => {
          const product = item.product;
          if (!product) return null;
          const { price, image } = resolveItemData(item);
          const title = getTrans(product.title);
          return (
            <div key={idx} className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-border/40 shrink-0 bg-accent/30">
                {image ? (
                  <Image
                    src={image}
                    alt={title as string}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-muted-foreground/40" />
                  </div>
                )}
                <span className="absolute -top-1 -end-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {title as string}
                </p>
                <p className="text-xs text-muted-foreground">
                  × {item.quantity}
                </p>
              </div>
              <span className="text-sm font-bold text-foreground tabular-nums shrink-0">
                {formatCurrency((price || 0) * (item.quantity || 1))}
              </span>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="px-5 py-4 space-y-2.5">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {isAr ? "المجموع الفرعي" : "Subtotal"}
          </span>
          <span className="font-semibold">{formatCurrency(subtotal)}</span>
        </div>

        {preview && showPreviewDetails ? (
          <>
            {preview?.summary?.shippingCost > 0 ? (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {isAr ? "الشحن" : "Shipping"}
                </span>
                <span className="font-semibold">
                  {formatCurrency(preview.summary.shippingCost)}
                </span>
              </div>
            ) : (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {isAr ? "الشحن" : "Shipping"}
                </span>
                <span className="font-bold text-success text-xs bg-success/10 px-2 py-0.5 rounded-lg">
                  {isAr ? "مجاني" : "Free"}
                </span>
              </div>
            )}
            {preview?.summary?.taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {isAr
                    ? `الضريبة (${preview.summary.taxPercentage}%)`
                    : `Tax (${preview.summary.taxPercentage}%)`}
                </span>
                <span className="font-semibold">
                  {formatCurrency(preview?.summary?.taxAmount)}
                </span>
              </div>
            )}
            {preview?.summary?.paymentFees > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {isAr ? "رسوم الدفع" : "Payment Fees"}
                </span>
                <span className="font-semibold">
                  {formatCurrency(preview?.summary?.paymentFees)}
                </span>
              </div>
            )}
            {preview?.summary?.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-success font-semibold flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  {isAr ? "خصم الكوبون" : "Coupon Discount"}
                </span>
                <span className="font-bold text-success">
                  -{formatCurrency(preview?.summary?.discount)}
                </span>
              </div>
            )}
            <div className="h-px bg-border/60 my-2" />
            <div className="flex justify-between items-center">
              <span className="font-black text-base text-foreground">
                {isAr ? "الإجمالي" : "Total"}
              </span>
              <span className="text-2xl font-black text-primary tabular-nums">
                {formatCurrency(preview?.summary?.total)}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {isAr ? "الشحن" : "Shipping"}
              </span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-lg">
                {isAr ? "يحسب لاحقاً" : "Calculated next"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {isAr ? "الضريبة" : "Tax"}
              </span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-lg">
                {isAr ? "يحسب لاحقاً" : "Calculated next"}
              </span>
            </div>
            <div className="h-px bg-border/60 my-2" />
            <div className="flex justify-between items-center">
              <span className="font-black text-base text-foreground">
                {isAr ? "الإجمالي" : "Total"}
              </span>
              <span className="text-2xl font-black text-primary tabular-nums">
                {formatCurrency(subtotal)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Trust badges */}
      <div className="px-5 pb-5">
        <div className="flex items-center gap-3 bg-muted/40 rounded-2xl p-3 border border-border/30">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-xs font-bold text-foreground">
              {isAr ? "دفع آمن ومشفر" : "Secure & Encrypted"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              SSL / 256-bit encryption
            </p>
          </div>
          <Lock className="w-4 h-4 text-muted-foreground ms-auto" />
        </div>
      </div>
    </div>
  );
}
