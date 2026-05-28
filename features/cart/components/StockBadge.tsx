import { useTranslations } from "next-intl";
import { CheckCircle2, AlertCircle } from "lucide-react";

export function StockBadge({
  stock,
  isUnlimitedStock,
}: {
  stock: number | null;
  isUnlimitedStock: boolean;
}) {
  const t = useTranslations("cart");
  // Unlimited stock → always available regardless of the numeric stock value
  if (isUnlimitedStock || stock === null) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full">
        <CheckCircle2 className="w-3.5 h-3.5" />
        {t("item.in_stock")}
      </span>
    );
  }

  if (stock === 0 && !isUnlimitedStock) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive bg-destructive/10 px-2.5 py-1 rounded-full">
        <AlertCircle className="w-3.5 h-3.5" />
        {t("item.out_of_stock")}
      </span>
    );
  }
  if (stock <= 10 && !isUnlimitedStock) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-full">
        <AlertCircle className="w-3.5 h-3.5" />
        {t("item.only_left", { stock })}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full">
      <CheckCircle2 className="w-3.5 h-3.5" />
      {t("item.in_stock")}
    </span>
  );
}
