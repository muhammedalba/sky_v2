"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Skeleton } from "@/shared/ui/Skeleton";
import { StatCard } from "@/shared/ui/StatCard";
import {
  ChevronRightIcon,
  RefreshCwIcon,
  ShoppingCartIcon,
} from "@/shared/ui/Icons";
import { useMyOrders } from "@/features/orders/hooks/useOrders";
import type { User } from "@/types";
import { OrderRow } from "./OrderRow";

interface OverviewTabProps {
  user: User;
  locale: string;
  onViewAllOrders: () => void;
}

export function OverviewTab({ user, locale, onViewAllOrders }: OverviewTabProps) {
  const t = useTranslations("profile");
  const tOrders = useTranslations("orders");

  // Overview only ever needs the 5 most-recent orders — a lighter query
  // than the paginated list the Orders tab uses.
  const { data: ordersResponse, isLoading: isLoadingOrders } = useMyOrders({
    page: 1,
    limit: 5,
    sort: "-createdAt",
  });
  const orders = ordersResponse?.data ?? [];
  // total orders comes straight from the user document's running counter —
  // zero extra cost. Active orders is computed by the backend (a cheap
  // countDocuments alongside the same request) and piggybacked on the
  // response above — no extra request, no client-side scan.
  const totalOrdersCount = user?.totalOrder ?? 0;
  const activeOrdersCount =
    Number(ordersResponse?.meta?.pagination?.activeCount) || 0;

  const stats = [
    {
      title: t("stats.total_orders"),
      value: totalOrdersCount,
      Icon: ShoppingCartIcon,
      colorFrom: "from-primary/5",
      colorBg: "bg-primary/10 dark:bg-primary/20",
      colorIcon: "text-primary",
    },
    {
      title: t("stats.active_orders"),
      value: activeOrdersCount,
      Icon: RefreshCwIcon,
      colorFrom: "from-blue-500/5",
      colorBg: "bg-blue-500/10 dark:bg-blue-500/20",
      colorIcon: "text-blue-500",
    },
  ];

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Recent Orders section */}
      <Card className="p-6 border-border/60 bg-card shadow-sm rounded-2xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-border/40">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {t("sections.recent_orders")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("sections.recent_orders_description")}
            </p>
          </div>
          {totalOrdersCount > 5 && (
            <Button
              variant="ghost"
              className="font-semibold text-primary hover:text-primary/90 text-sm gap-1"
              onClick={onViewAllOrders}
            >
              {t("actions.view_all_orders")}
              <ChevronRightIcon className="w-4 h-4 rtl:rotate-180" />
            </Button>
          )}
        </div>

        {isLoadingOrders ? (
          <div className="divide-y divide-border/40">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <Skeleton className="h-4 w-14" />
                  <Skeleton className="h-6 w-16 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            {tOrders("noOrders")}
          </p>
        ) : (
          <div className="divide-y divide-border/40">
            {orders.map((order) => (
              <OrderRow key={order._id} order={order} locale={locale} />
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
