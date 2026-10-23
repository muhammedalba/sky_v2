"use client";

import { useTranslations } from "next-intl";
import { InvoiceStats } from "@/features/invoices/types";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { Card, CardContent } from "@/shared/ui/Card";
import { Skeleton } from "@/shared/ui/Skeleton";
import {
  AlertTriangleIcon,
  DollarSignIcon,
  FileTextIcon,
  RotateCcwIcon,
} from "@/shared/ui/Icons";

interface InvoiceStatsCardsProps {
  stats?: InvoiceStats;
  isLoading: boolean;
  /** The "failed" card filters the current tab to what failed. */
  onShowFailed: () => void;
}

/**
 * The period's totals: invoices, credit notes, their net (what the store
 * keeps, and its VAT), and documents that failed to issue.
 */
export default function InvoiceStatsCards({
  stats,
  isLoading,
  onShowFailed,
}: InvoiceStatsCardsProps) {
  const t = useTranslations("invoices.stats");
  const formatCurrency = useFormatCurrency();

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  const failed = stats.failed.invoices + stats.failed.creditNotes;
  const cards = [
    {
      key: "invoices",
      icon: FileTextIcon,
      tone: "text-primary bg-primary/10",
      value: formatCurrency(stats.invoices.total),
      detail: t("countTax", {
        count: stats.invoices.count,
        tax: formatCurrency(stats.invoices.tax),
      }),
    },
    {
      key: "creditNotes",
      icon: RotateCcwIcon,
      tone: "text-destructive bg-destructive/10",
      value: formatCurrency(stats.creditNotes.total),
      detail: t("countTax", {
        count: stats.creditNotes.count,
        tax: formatCurrency(stats.creditNotes.tax),
      }),
    },
    {
      key: "net",
      icon: DollarSignIcon,
      tone: "text-success bg-success/10",
      value: formatCurrency(stats.net.total),
      detail: t("netTax", { tax: formatCurrency(stats.net.tax) }),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map(({ key, icon: Icon, tone, value, detail }) => (
        <Card key={key} className="rounded-2xl border-border/50">
          <CardContent className="p-5 flex items-start gap-4">
            <div className={`rounded-xl p-2.5 ${tone}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">
                {t(key)}
              </p>
              <p className="text-xl font-black tabular-nums text-foreground">
                {value}
              </p>
              <p className="text-xs text-muted-foreground tabular-nums">
                {detail}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}

      <button
        type="button"
        onClick={onShowFailed}
        disabled={failed === 0}
        className="text-start disabled:cursor-default"
      >
        <Card
          className={`h-full rounded-2xl ${
            failed > 0 ? "border-warning/60 bg-warning/5" : "border-border/50"
          }`}
        >
          <CardContent className="p-5 flex items-start gap-4">
            <div
              className={`rounded-xl p-2.5 ${
                failed > 0
                  ? "text-warning bg-warning/10"
                  : "text-muted-foreground bg-muted"
              }`}
            >
              <AlertTriangleIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">
                {t("failed")}
              </p>
              <p className="text-xl font-black tabular-nums text-foreground">
                {failed}
              </p>
              <p className="text-xs text-muted-foreground">
                {failed > 0
                  ? t("failedDetail", {
                      invoices: stats.failed.invoices,
                      creditNotes: stats.failed.creditNotes,
                    })
                  : t("noneFailed")}
              </p>
            </div>
          </CardContent>
        </Card>
      </button>
    </div>
  );
}
