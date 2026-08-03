"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { AreaTrendChart } from "@/shared/ui/charts/AreaTrendChart";
import { PieCompositionChart } from "@/shared/ui/charts/PieCompositionChart";
import { Skeleton } from "@/shared/ui/Skeleton";
import { OrderStatsResponse } from "@/features/orders/types";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface OrderChartsSectionProps {
  stats?: OrderStatsResponse;
  isLoading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  pending_payment: "#f59e0b",
  pending: "#f97316",
  processing: "#3b82f6",
  shipped: "#6366f1",
  delivered: "#14b8a6",
  completed: "#10b981",
  cancelled: "#ef4444",
  expired: "#6b7280",
};

export default function OrderChartsSection({
  stats,
  isLoading,
}: OrderChartsSectionProps) {
  const formatCurrency = useFormatCurrency();
  const t = useTranslations("orders");

  const statusBreakdown = stats?.statusBreakdown;

  const pieData = useMemo(() => {
    if (!statusBreakdown) return [];
    return Object.entries(statusBreakdown).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace("_", " "),
      value,
      color: STATUS_COLORS[name] || "#6b7280",
    }));
  }, [statusBreakdown]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="border-border/50 bg-card shadow-sm">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-40 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-62.5 w-full rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Orders Trend */}
        <Card className="border-border/50 bg-card shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {t("charts.dailyOrders")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AreaTrendChart
              data={stats.dailyOrders || []}
              dataKey="count"
              color="#6366f1"
              height={250}
              className="mt-2"
            />
          </CardContent>
        </Card>

        {/* Status Breakdown Pie */}
        <Card className="border-border/50 bg-card shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {t("charts.orderStatusDistribution")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PieCompositionChart
              data={pieData}
              height={250}
              innerRadius={55}
              outerRadius={85}
            />
          </CardContent>
        </Card>
      </div>

      {/* Top Products & Top Customers Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Products */}
        {stats.topProducts && stats.topProducts.length > 0 && (
          <Card className="border-border/50 bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {t("charts.topProducts")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.topProducts.map((product, i) => (
                <div
                  key={product.productId}
                  className="flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={cn(
                        "flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold shrink-0",
                        i === 0
                          ? "bg-amber-500/10 text-amber-600"
                          : i === 1
                            ? "bg-gray-300/20 text-gray-500"
                            : i === 2
                              ? "bg-orange-500/10 text-orange-600"
                              : "bg-muted/50 text-muted-foreground",
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-foreground truncate">
                      {product.productName}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-muted-foreground shrink-0 tabular-nums">
                    {product.totalQuantity} {t("charts.sold")}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Top Customers */}
        {stats.topCustomers && stats.topCustomers.length > 0 && (
          <Card className="border-border/50 bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {t("charts.topCustomers")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.topCustomers.map((customer, i) => (
                <div
                  key={customer.userId}
                  className="flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={cn(
                        "flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold shrink-0",
                        i === 0
                          ? "bg-amber-500/10 text-amber-600"
                          : i === 1
                            ? "bg-gray-300/20 text-gray-500"
                            : i === 2
                              ? "bg-orange-500/10 text-orange-600"
                              : "bg-muted/50 text-muted-foreground",
                      )}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {customer.userName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {customer.totalOrders} {t("charts.ordersCount")}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 shrink-0 tabular-nums">
                    {formatCurrency(customer.totalSpent)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
