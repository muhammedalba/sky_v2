"use client";

import { useTranslations } from "next-intl";
import Modal from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/Button";
import { useUsdNoticeStore } from "@/store/usd-notice-store";

/**
 * Warns the shopper, right after they switch currency display to USD, that
 * USD prices are only an approximate conversion for reference — the actual
 * charge is still made in the storefront's base currency and may differ
 * depending on the exchange rate.
 *
 * Driven by the shared `useUsdNoticeStore` (rather than local/prop state) and
 * mounted once at the storefront layout: any trigger point (currency toggle,
 * locale switcher) just calls `open()`, and the flag survives the client-tree
 * remount that a locale-changing navigation causes.
 */
export default function UsdApproximateNoticeModal() {
  const t = useTranslations("common.currencyToggle");
  const isOpen = useUsdNoticeStore((state) => state.isOpen);
  const close = useUsdNoticeStore((state) => state.close);

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title={t("usdNoticeTitle")}
      size="sm"
      footer={<Button variant="info" onClick={close}>{t("usdNoticeConfirm")}</Button>}
    >
      <p className="text-sm text-muted-foreground leading-relaxed">{t("usdNoticeMessage")}</p>
    </Modal>
  );
}
