"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card } from "@/shared/ui/Card";
import { Skeleton } from "@/shared/ui/Skeleton";
import { ClockIcon, EyeIcon, PackageIcon } from "@/shared/ui/Icons";
import { useMyOrders } from "@/features/orders/hooks/useOrders";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { cn, formatDateTime, getStatusColor } from "@/lib/utils";
import EntityDataTable, {
  type Column,
} from "@/shared/ui/dashboard/EntityDataTable";
import Pagination from "@/shared/ui/Pagination";
import type { Order } from "@/types";
import { OrderRow } from "./OrderRow";
import ProductsSectionHeader from "../../products/components/ProductsSectionHeader";
import ProductsGrid from "../../products/components/ProductsGrid";
import { useRecentlyViewedProducts } from "@/features/products/hooks/useRecentlyViewedProducts";

interface OrdersTabProps {
  locale: string;
}

export function OrdersTab({ locale }: OrdersTabProps) {
  const t = useTranslations("profile");
  const tOrders = useTranslations("orders");
  const formatCurrency = useFormatCurrency();
  const { products: recentlyViewedList } = useRecentlyViewedProducts();
  const [orderPage, setOrderPage] = useState(1);
  const { data: ordersResponse, isLoading: isLoadingOrders } = useMyOrders({
    page: orderPage,
    limit: 10,
    sort: "-createdAt",
  });
  const orders = ordersResponse?.data ?? [];

  const orderColumns: Column<Order>[] = [
    {
      header: tOrders("fields.orderNumber"),
      render: (order) => (
        <span className="font-mono font-bold text-xs text-foreground bg-muted/40 px-2 py-1 rounded-md">
          #{order._id.slice(-6).toUpperCase()}
        </span>
      ),
    },
    {
      header: tOrders("fields.date"),
      render: (order) => (
        <span className="text-sm text-muted-foreground">
          {formatDateTime(order.createdAt, locale)}
        </span>
      ),
    },
    {
      header: tOrders("fields.status"),
      render: (order) => (
        <span
          className={cn(
            "px-2.5 py-1 rounded-lg font-semibold text-xs uppercase tracking-wide",
            getStatusColor(order.status),
          )}
        >
          {tOrders(`status.${order.status.toLowerCase()}`, {
            defaultValue: order.status,
          })}
        </span>
      ),
    },
    {
      header: tOrders("fields.total"),
      render: (order) => (
        <span className="font-bold text-sm text-foreground">
          {formatCurrency(order.grandTotal ?? order.totalPrice ?? 0)}
        </span>
      ),
    },
    {
      header: "",
      render: (order) => (
        <Link
          href={`/${locale}/account/orders/${order._id}`}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-primary transition-colors"
        >
          <EyeIcon className="w-4 h-4" />
        </Link>
      ),
    },
  ];

  return (
    <>
      <div className="px-1">
        <h2 className="text-lg font-bold text-foreground">
          {t("tabs.orders")}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t("ordersTabDescription")}
        </p>
      </div>

      {/* Mobile: compact card list */}
      <div className="block md:hidden">
        <Card className="p-4 border-border/60 bg-card shadow-sm rounded-2xl">
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
        {ordersResponse?.meta?.pagination &&
          ordersResponse.meta.pagination.numberOfPages > 1 && (
            <Pagination
              pagination={ordersResponse.meta.pagination}
              onPageChange={setOrderPage}
              className="mt-4"
            />
          )}
      </div>

      {/* Desktop: data table */}
      <div className="hidden md:block">
        <EntityDataTable
          columns={orderColumns}
          data={orders}
          isLoading={isLoadingOrders}
          pagination={ordersResponse?.meta?.pagination}
          onPageChange={setOrderPage}
          emptyState={{
            title: tOrders("noOrders"),
            description: tOrders("noOrdersDesc"),
            icon: (
              <PackageIcon className="h-10 w-10 text-muted-foreground/40" />
            ),
          }}
        />
      </div>
      {/* ─── 2. RECENTLY VIEWED ──────────────────────────────── */}
      {recentlyViewedList.length > 0 && (
        <section className="relative py-10 sm:py-14 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductsSectionHeader
              icon={ClockIcon}
              title={t("recentlyViewedTitle")}
              description={t("recentlyViewedDesc")}
            />
            <ProductsGrid
              items={recentlyViewedList}
              isLoading={false}
              emptyTitle={t("noProducts")}
              emptyDesc={t("noProductsDesc")}
              withReveal
            />
          </div>
        </section>
      )}
    </>
  );
}
