"use client";

import { ReviewStats } from "@/features/reviews/types";
import { StatCard } from "@/shared/ui/StatCard";
import { Skeleton } from "@/shared/ui/Skeleton";
import { useTranslations } from "next-intl";
import {
  MessageCircleIcon,
  ClockIcon,
  CheckIcon,
  XIcon,
  ShieldCheckIcon,
} from "@/shared/ui/Icons";

interface ReviewStatsCardsProps {
  stats?: ReviewStats;
  isLoading: boolean;
}

export default function ReviewStatsCards({
  stats,
  isLoading,
}: ReviewStatsCardsProps) {
  const t = useTranslations("reviews.admin.stats");

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/50 bg-card p-5 space-y-4 animate-pulse"
          >
            <div className="flex items-start justify-between">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-md" />
            </div>
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-7 w-24 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const approvalRate =
    stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

  const cards = [
    {
      title: t("total"),
      value: stats.total.toLocaleString(),
      Icon: MessageCircleIcon,
      colorFrom: "from-primary/5",
      colorBg: "bg-primary/10 dark:bg-primary/20",
      colorIcon: "text-primary",
      badge: t("badges.allTime"),
      badgeVariant: "default" as const,
    },
    {
      title: t("pending"),
      value: stats.pending.toLocaleString(),
      Icon: ClockIcon,
      colorFrom: "from-amber-500/5",
      colorBg: "bg-amber-500/10 dark:bg-amber-500/20",
      colorIcon: "text-amber-500",
      badge: t("badges.awaitingReview"),
      badgeVariant: "warning" as const,
    },
    {
      title: t("approved"),
      value: stats.approved.toLocaleString(),
      Icon: CheckIcon,
      colorFrom: "from-emerald-500/5",
      colorBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      colorIcon: "text-emerald-500",
      badge: t("badges.published"),
      badgeVariant: "success" as const,
    },
    {
      title: t("rejected"),
      value: stats.rejected.toLocaleString(),
      Icon: XIcon,
      colorFrom: "from-rose-500/5",
      colorBg: "bg-rose-500/10 dark:bg-rose-500/20",
      colorIcon: "text-rose-500",
      badge: t("badges.notPublished"),
      badgeVariant: "destructive" as const,
    },
    {
      title: t("approvalRate"),
      value: `${approvalRate}%`,
      Icon: ShieldCheckIcon,
      colorFrom: "from-blue-500/5",
      colorBg: "bg-blue-500/10 dark:bg-blue-500/20",
      colorIcon: "text-blue-500",
      description: t("approvalRateDescription"),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}
