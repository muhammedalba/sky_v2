"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useMyOrder } from "@/features/orders/hooks/useOrders";
import { useTrans } from "@/shared/hooks/useTrans";
import { Card, CardContent } from "@/shared/ui/Card";
import { Skeleton } from "@/shared/ui/Skeleton";
import { Button } from "@/shared/ui/Button";
import ImageWithFallback from "@/shared/ui/image/ImageWithFallback";
import OrderTimeline from "@/features/orders/components/OrderTimeline";
import OrderInfoCard from "@/features/orders/components/OrderInfoCard";
import OrderTotalsSummary from "@/features/orders/components/OrderTotalsSummary";
import { VariantAttributes } from "@/shared/ui/VariantAttributes";
import {
  ArrowLeftIcon,
  MapPinIcon,
  CreditCardIcon,
  TruckIcon,
  TagIcon,
  DownloadIcon,
  ShieldCheckIcon,
  PhoneIcon,
  ExternalLinkIcon,
  CopyIcon,
  CheckIcon,
  AlertTriangleIcon,
  HeadphoneIcon,
  Icons,
} from "@/shared/ui/Icons";
import {
  cn,
  formatDate,
  formatOrderNumber,
  getStatusColor,
  getPaymentStatusColor,
} from "@/lib/utils";
import Price from "@/shared/ui/Price";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import { getAttributeLabel } from "@/shared/constants/product-constants";
import Modal from "@/shared/ui/Modal";
import { useDownloadFile } from "@/shared/hooks/useDownloadFile";
import { getFileUrl, getImageUrl } from "@/shared/utils/image.util";
import { useSettings } from "@/app/providers/SettingsProvider";
import { useMyReviewsForProducts } from "@/features/reviews/hooks/useReviews";
import OrderItemReview from "@/features/reviews/components/storefront/OrderItemReview";

const ACTIVE_STATUSES = ["pending", "pending_payment", "processing", "shipped"];
// Same statuses the backend treats as "purchased" (verified-purchase check)
const REVIEWABLE_STATUSES = ["delivered", "completed"];
const INFO_CARD_CLASS = "border-border/60 bg-card";
const INFO_ICON_CLASS = "rounded-xl bg-primary/10";

// ── Copy-to-clipboard pill for the delivery verification code ─────────────
function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // clipboard API unavailable — silently ignore
        }
      }}
      className="inline-flex items-center gap-2 font-mono font-black text-lg tracking-widest bg-background/60 border border-border/60 rounded-xl px-4 py-2 hover:border-primary/40 transition-colors"
    >
      {code}
      {copied ? (
        <CheckIcon className="w-4 h-4 text-success" />
      ) : (
        <CopyIcon className="w-4 h-4 text-muted-foreground" />
      )}
    </button>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("orders");
  const { downloadFile, isDownloading } = useDownloadFile();
  const getTrans = useTrans();
  const isAr = locale == "ar";
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const { data: order, isLoading, isError } = useMyOrder(id);

  const formattedAddress = useMemo(() => {
    if (!order?.shippingAddress) return "";
    const addr = order.shippingAddress;
    return [
      getTrans(addr.country?.name),
      getTrans(addr.city?.name),
      addr.street && `${t("shippingInfo.street")}: ${addr.street}`,
      addr.building && `${t("shippingInfo.building")}: ${addr.building}`,
      addr.postalCode && `${t("shippingInfo.postalCode")}: ${addr.postalCode}`,
    ]
      .filter(Boolean)
      .join(" — ");
  }, [order?.shippingAddress, getTrans, t]);

  // ── Reviews (hooks stay above the early returns) ─────────────────────────
  // 1) Only delivered orders ask for reviews, and only if the admin enabled them
  const settings = useSettings();
  const reviewsEnabled = settings?.features?.reviews !== false;
  const isDeliveredOrder = !!order && REVIEWABLE_STATUSES.includes(order.status);

  // 2) One prompt per product: the same product can appear several times
  //    (different variants) but a user reviews a product only once. Products
  //    no longer on the store come back unpopulated (no slug) and are skipped.
  const { reviewableIds, firstItemIndex } = useMemo(() => {
    const firstIndex = new Map<string, number>();
    order?.items?.forEach((item, idx) => {
      const productId = item.productId?._id;
      if (productId && item.productId?.slug && !firstIndex.has(productId)) {
        firstIndex.set(productId, idx);
      }
    });
    return { reviewableIds: [...firstIndex.keys()], firstItemIndex: firstIndex };
  }, [order?.items]);

  const showReviews = reviewsEnabled && isDeliveredOrder && reviewableIds.length > 0;

  // 3) The user's existing reviews for all those products in ONE request
  const { data: myReviews } = useMyReviewsForProducts(reviewableIds, {
    enabled: showReviews,
  });

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen pt-36 pb-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    );
  }

  // ── Not found / not owned ────────────────────────────────────────────────
  if (isError || !order) {
    return (
      <div className="min-h-screen pt-36 pb-20 bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertTriangleIcon className="w-8 h-8" />
          </div>
          <h1 className="text-lg font-bold text-foreground mb-1">
            {t("orderNotFound")}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {t("orderNotFoundDesc")}
          </p>
          <Link href={`/${locale}/account`}>
            <Button variant="outline" className="gap-2">
              <ArrowLeftIcon className="w-4 h-4 rtl:rotate-180" />
              {t("goBack")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  const handleDownloadReceipt = () => {
    const ext =
      getImageUrl(order.transferReceiptImg)?.split(".").pop()?.split("?")[0] ||
      "jpg";
    downloadFile(order.transferReceiptImg, {
      fileName: `receipt-${order.user?.name || "transfer"}.${ext}`,
    });
  };
  const invoiceUrl = getFileUrl(order.InvoicePdf);
  const receiptUrl = getFileUrl(order.DeliveryReceiptImage);
  const transferReceiptUrl = getFileUrl(order.transferReceiptImg);

  const shippingLogo =
    typeof order.shippingProviderId === "object"
      ? order.shippingProviderId?.logo
      : undefined;

  const isActiveOrder = ACTIVE_STATUSES.includes(order.status);

  return (
    <>
      <div className="min-h-screen pt-36 pb-20 bg-background text-foreground transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          {/* Back */}
          <ScrollReveal animation="fade">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4 rtl:rotate-180" />
              {t("goBack")}
            </button>
          </ScrollReveal>

          {/* Header */}
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 sm:p-8 shadow-sm">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <ScrollReveal
                  animation="slide-up"
                  className="flex items-center gap-2.5 flex-wrap"
                >
                  <span className="font-mono font-black text-lg text-foreground bg-muted px-3 py-1 rounded-lg">
                    #{formatOrderNumber(order)}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 font-semibold text-xs uppercase tracking-wide",
                      getStatusColor(order.status),
                    )}
                  >
                    {t(`status.${order.status.toLowerCase()}`, {
                      defaultValue: order.status,
                    })}
                  </span>
                </ScrollReveal>
                <ScrollReveal animation="fade">
                  <p className="text-xs text-muted-foreground">
                    {t("placedOn", {
                      date: formatDate(order.createdAt, locale),
                    })}
                  </p>
                </ScrollReveal>
              </div>

              {invoiceUrl && (
                <ScrollReveal animation="fade">
                  <a
                    href={invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="gap-2">
                      <DownloadIcon className="w-4 h-4 text-primary" />
                      {t("downloadInvoice")}
                    </Button>
                  </a>
                </ScrollReveal>
              )}
            </div>
          </div>

          {/* Address + Payment */}
          <ScrollReveal
            animation="fade"
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <OrderInfoCard
              icon={MapPinIcon}
              title={t("shippingAddress")}
              className={INFO_CARD_CLASS}
              iconWrapperClassName={INFO_ICON_CLASS}
            >
              {formattedAddress ? (
                <>
                  {(order.shippingAddress?.firstName ||
                    order.shippingAddress?.lastName) && (
                    <p className="text-xs font-medium text-foreground">
                      {[
                        order.shippingAddress?.firstName,
                        order.shippingAddress?.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    {formattedAddress}
                  </p>
                  {order.shippingAddress?.phone && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                      <PhoneIcon className="w-3.5 h-3.5" />
                      {order.shippingAddress.phone}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  {t("noAddress")}
                </p>
              )}
            </OrderInfoCard>

            <OrderInfoCard
              icon={CreditCardIcon}
              title={t("paymentMethod")}
              className={INFO_CARD_CLASS}
              iconWrapperClassName={INFO_ICON_CLASS}
            >
              <p className="text-xs font-medium text-foreground capitalize">
                {order.paymentMethodCode || order.paymentMethod || "—"}
              </p>
              <span
                className={cn(
                  "inline-flex mt-1.5 rounded-full px-2.5 py-0.5 font-semibold text-[10px] uppercase tracking-wide",
                  getPaymentStatusColor(order.paymentStatus || ""),
                )}
              >
                {order.paymentStatus
                  ? t(`paymentStatus.${order.paymentStatus.toUpperCase()}`, {
                      defaultValue: order.paymentStatus,
                    })
                  : "—"}
              </span>
              {transferReceiptUrl && (
                <a
                  href={transferReceiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80"
                >
                  <ExternalLinkIcon className="w-3.5 h-3.5" />
                  {t("paymentInfo.viewReceipt")}
                </a>
              )}
            </OrderInfoCard>
          </ScrollReveal>

          {/* Shipping provider */}
          {(order.shippingProviderId || order.shippingMethod) && (
            <ScrollReveal animation="fade">
              <OrderInfoCard
                icon={TruckIcon}
                title={t("shippingProvider")}
                className={INFO_CARD_CLASS}
                iconWrapperClassName={INFO_ICON_CLASS}
              >
                <div className="flex items-center gap-2">
                  {shippingLogo && (
                    <div className="w-6 h-6 rounded-md relative overflow-hidden shrink-0 bg-white border border-border/40">
                      <ImageWithFallback
                        src={shippingLogo}
                        alt=""
                        fill
                        sizes="24px"
                        className="object-contain"
                      />
                    </div>
                  )}
                  <p className="text-xs font-medium text-foreground">
                    {typeof order.shippingProviderId === "object" &&
                    order.shippingProviderId
                      ? order.shippingProviderId.name
                      : order.shippingMethod || "—"}
                  </p>
                </div>
                {order.shippingRateId?.estimatedDays && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("delivery", {
                      days: order.shippingRateId.estimatedDays,
                    })}
                  </p>
                )}
                {typeof order.shippingProviderId === "object" &&
                  order.shippingProviderId?.trackingUrl && (
                    <a
                      href={order.shippingProviderId.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80"
                    >
                      <ExternalLinkIcon className="w-3.5 h-3.5" />
                      {locale === "ar" ? "تتبع الشحنة" : "Track shipment"}
                    </a>
                  )}
              </OrderInfoCard>
            </ScrollReveal>
          )}
          {/* Delivery verification code — actionable for the customer while in flight */}
          {order.DeliveryVerificationCode && isActiveOrder && (
            <Card className="border-primary/20 bg-primary/5">
              <ScrollReveal animation="fade">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="h-10 w-10 rounded-xl shrink-0 bg-primary/15 text-primary flex items-center justify-center">
                    <ShieldCheckIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground">
                      {t("deliveryVerificationCode.title")}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("deliveryVerificationCode.description")}
                    </p>
                  </div>
                  <CopyCode code={order?.DeliveryVerificationCode} />
                </CardContent>
              </ScrollReveal>
            </Card>
          )}
          {/* Delivery receipt image */}
          {receiptUrl && (
            <ScrollReveal animation="fade">
              <Card className="border-border/60 bg-card">
                <div className="flex items-center justify-between bg-accent/70  border-b  ">
                  <div className="w-full p-4  flex gap-2 items-center">
                    <Icons.Upload className="text-warning w-5 h-5" />
                    <h4 className="text-sm font-bold title-gradient ">
                      {t("deliveryInfo.title")}
                    </h4>
                  </div>
                  <Button
                    onClick={() => setIsReceiptModalOpen(true)}
                    variant="outline2"
                    className="gap-1"
                  >
                    <DownloadIcon className="w-4 h-4 " />
                    {t("deliveryInfo.title")}
                  </Button>
                </div>
                <CardContent className="p-5 sm:p-6">
                  <div className="relative w-full max-w-xs aspect-video rounded-xl overflow-hidden border border-border/40 bg-muted/30">
                    <ImageWithFallback
                      src={receiptUrl}
                      alt={t("deliveryInfo.title")}
                      fill
                      sizes="320px"
                      className="object-cover"
                    />
                  </div>
                  {order.deliveryName && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {t("deliveryInfo.deliveryName")}: {order.deliveryName}
                    </p>
                  )}
                </CardContent>
              </Card>
            </ScrollReveal>
          )}
          {/* Items */}
          <Card className="border-border/60 bg-card overflow-hidden">
            <div className="flex items-center gap-2 w-full bg-accent/70 p-5">
              <ScrollReveal animation="slide-right">
                <h3 className="text-sm font-bold title-gradient ">
                  {t("orderItems")}
                </h3>
              </ScrollReveal>
            </div>
            <CardContent className="space-y-4 pt-0">
              <div className="divide-y divide-border/40">
                {order.items?.map((item, idx) => {
                  const product = item.productId;
                  const image = product?.imageCover || product?.images?.[0];
                  const title = getTrans(product?.title);
                  const content = (
                    <>
                      <div className="w-16 h-16 rounded-xl relative overflow-hidden shrink-0 bg-muted/40 border border-border/40">
                        <ImageWithFallback
                          src={image}
                          alt={title}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {title}
                        </p>
                        <div className="text-xs text-muted-foreground mt-1 flex gap-1">
                          {(item.sku || item.variantId?.sku) && (
                            <span className="font-mono">
                              {item.sku || item.variantId?.sku}
                            </span>
                          )}
                          {" : "}
                        </div>
                        <VariantAttributes
                          attributes={item.variantId?.attributes}
                          className="mt-1.5"
                          getLabel={(key) => getAttributeLabel(key, isAr)}
                        />
                        <div className="text-xs text-muted-foreground mt-1 flex gap-1">
                          {t("qty")}: {item.quantity} ×
                          <Price amount={item.price} animate={false} />
                        </div>
                      </div>
                    </>
                  );
                  // Review prompt only on the first row of each product
                  const showItemReview =
                    showReviews &&
                    !!product?._id &&
                    firstItemIndex.get(product._id) === idx;

                  return (
                    <ScrollReveal
                      animation="fade"
                      delay={idx * 400}
                      key={idx}
                      className={cn(
                        "py-4 first:pt-0 last:pb-0",
                        idx === 0 ? "mt-4" : "",
                      )}
                    >
                      <div className="flex items-center gap-4">
                        {product?.slug ? (
                          <Link
                            href={`/${locale}/products/${product.slug}`}
                            className="flex items-center gap-4 flex-1 min-w-0 group"
                          >
                            {content}
                          </Link>
                        ) : (
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            {content}
                          </div>
                        )}
                        <Price
                          amount={item.price}
                          className="font-bold text-sm text-foreground shrink-0 tabular-nums"
                          animate={false}
                        />
                      </div>

                      {/* Kept OUTSIDE the product <Link>: clicking a star must
                          not navigate. ms-20 aligns it under the product text
                          (64px image + 16px gap). */}
                      {showItemReview && product?._id && (
                        <div className="mt-3 ms-20">
                          <OrderItemReview
                            productId={product._id}
                            review={myReviews?.get(product._id)}
                          />
                        </div>
                      )}
                    </ScrollReveal>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          {/* Coupon */}
          {order.couponCode && (
            <ScrollReveal
              animation="fade"
              className="flex items-center gap-2 text-xs"
            >
              <TagIcon className="w-4 h-4 text-success shrink-0" />
              <span className="text-muted-foreground">{t("coupon")}:</span>
              <span className="font-mono font-bold bg-success/10 text-success px-2 py-0.5 rounded">
                {order.couponCode}
              </span>
            </ScrollReveal>
          )}
          {/* Order Summary */}
          <OrderTotalsSummary order={order} className={INFO_CARD_CLASS} />
          {/* Order Timeline */}
          <OrderTimeline order={order} />
          {/* Support */}
          {order.customerServiceContact && (
            <ScrollReveal animation="fade">
              <Card className="border-border/60 bg-secondary/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl shrink-0 bg-background flex items-center justify-center border border-border/40">
                    <HeadphoneIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">
                      {locale === "ar" ? "بحاجة إلى مساعدة؟" : "Need help?"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.customerServiceContact}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          )}
        </div>
      </div>
      {/* Full Preview Modal */}
      {receiptUrl && (
        <Modal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          title={t("paymentInfo.transferReceipt")}
          size="lg"
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative w-full max-h-[70vh] flex items-center justify-center overflow-auto rounded-xl bg-muted/10 p-2  border border-border">
              <ImageWithFallback
                src={order.DeliveryReceiptImage}
                alt={t("paymentInfo.transferReceipt")}
                width={800}
                height={800}
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="flex items-center justify-end gap-3 w-full pt-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs rounded-xl"
                onClick={handleDownloadReceipt}
                disabled={isDownloading}
              >
                <DownloadIcon className="w-4 h-4" />
                {t("paymentInfo.downloadReceipt")}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
