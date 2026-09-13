"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { Button } from "@/shared/ui/Button";
import { Price } from "@/shared/ui/Price";
import {
  ListChecksIcon,
  ShoppingCartIcon,
  VisaIcon,
  MastercardIcon,
  CreditCardIcon,
} from "@/shared/ui/Icons";
import VariantAttributes from "@/shared/ui/VariantAttributes";
import { ProductVariant } from "@/types";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";

export interface ProductOrderCardProps {
  selectedVariant: ProductVariant | null;
  displayPrice: number;
  quantity: number;
  unitText: string;
  canOrder: boolean;
  isAddingToCart: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
  getAttributeLabel: (key: string) => string;
}

export default function ProductOrderCard({
  selectedVariant,
  displayPrice,
  quantity,
  unitText,
  canOrder,
  isAddingToCart,
  onAddToCart,
  onBuyNow,
  getAttributeLabel,
}: ProductOrderCardProps) {
  const t = useTranslations("product");
  const commonT = useTranslations("common");

  const isOutOfStock = !canOrder;

  return (
    <div className="lg:col-span-4 bg-background rounded-2xl border border-border/50 p-5 sm:p-6 space-y-5">
      <ScrollReveal animation="slide-right" delay={100} className="flex items-center gap-2 font-bold text-sm title-gradient">
        <ListChecksIcon className="w-4 h-4 text-primary" />
        {t("order.yourSelection")}
      </ScrollReveal>

      {selectedVariant ? (
        <VariantAttributes
          attributes={selectedVariant.attributes}
          getLabel={getAttributeLabel}
          badgeClassName="text-[10px] px-2 py-0.5"
        />
      ) : (
        <ScrollReveal animation="fade"  className="text-xs text-muted-foreground">
          {t("order.noSelection")}
        </ScrollReveal>
      )}

      <div className="space-y-2 pt-3 border-t border-border/40">
        <ScrollReveal animation="slide-up" className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {t("order.unitPrice")}
          </span>
          <span className="font-semibold flex items-center gap-1">
            <Price
              amount={displayPrice}
              className="text-base font-medium"
              currencyClassName="text-muted-foreground/60"
            />
            / {unitText}
          </span>
        </ScrollReveal>
        <ScrollReveal animation="fade" className="flex items-center justify-between">
          <span className="font-bold text-sm">
            {t("order.totalPrice")}
          </span>
          <span className="text-xl font-bold text-primary">
            <Price
              amount={displayPrice * quantity}
              className="text-xl font-bold text-primary"
              currencyClassName="text-muted-foreground/60"
            />
          </span>
        </ScrollReveal>
      </div>

      <div className="space-y-2.5 pt-1">
        <Button
          onClick={onAddToCart}
          disabled={!canOrder}
          isLoading={isAddingToCart}
          className="w-full gap-2"
        >
          <ShoppingCartIcon className="w-4 h-4" />
          {isOutOfStock
            ? commonT("buttons.out_of_stock")
            : commonT("buttons.add_to_cart")}
        </Button>
        <Button
          onClick={onBuyNow}
          disabled={!canOrder}
          isLoading={isAddingToCart}
          variant={"outline2"}
          className="w-full bg-background border border-primary/30 text-primary"
        >
          {t("actions.buyNow")}
        </Button>
      </div>

      <ScrollReveal animation="fade" className="text-center text-xs text-muted-foreground">
        {t("actions.needHelp")}{" "}
        <Link
          href="/contact"
          className="text-primary font-semibold hover:underline"
        >
          {t("actions.contactSupport")}
        </Link>
      </ScrollReveal>

      <ScrollReveal animation="fade" className="flex items-center justify-center gap-3 pt-3 border-t border-border/40">
        <VisaIcon className="h-5 w-auto opacity-70" />
        <MastercardIcon className="h-5 w-auto opacity-70" />
        <CreditCardIcon className="h-5 w-auto opacity-70" />
      </ScrollReveal>
    </div>
  );
}
