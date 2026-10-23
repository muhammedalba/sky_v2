"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useReturnRequests } from "@/features/orders/hooks/useOrders";
import { RETURN_STATUS_STYLES } from "@/features/orders/components/ReturnRequestsCard";
import {
  ReturnRequestListItem,
  ReturnRequestStatus,
} from "@/features/orders/types";
import EntityDataTable, {
  Column,
} from "@/shared/ui/dashboard/EntityDataTable";
import EntityPageHeader from "@/shared/ui/dashboard/EntityPageHeader";
import { formatDate, formatOrderNumber } from "@/lib/utils";

const TABS: (ReturnRequestStatus | "all")[] = [
  "pending",
  "approved",
  "rejected",
  "cancelled",
  "all",
];
const LIMIT = 20;

/**
 * Customers' return requests, newest first, by status (pending first). Each
 * one opens its order, where the admin approves (credit note and refund) or
 * rejects it.
 */
export default function ReturnRequestsPage() {
  const t = useTranslations("orders.returnRequests");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [tab, setTab] = useState<ReturnRequestStatus | "all">("pending");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useReturnRequests({
    status: tab === "all" ? undefined : tab,
    page,
    limit: LIMIT,
  });

  const columns = useMemo<Column<ReturnRequestListItem>[]>(
    () => [
      {
        header: t("columns.order"),
        render: (request) =>
          request.order ? (
            <Link
              href={`/${locale}/dashboard/orders/${request.order._id}`}
              className="font-mono font-bold text-primary hover:underline"
            >
              #{formatOrderNumber(request.order)}
            </Link>
          ) : (
            "-"
          ),
      },
      {
        header: t("columns.customer"),
        render: (request) => (
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {request.user?.name ?? "-"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {request.user?.email}
            </p>
          </div>
        ),
      },
      {
        header: t("columns.reason"),
        render: (request) => (
          <div className="max-w-xs">
            <p className="text-sm font-semibold text-foreground">
              {t(`reasonTypes.${request.reasonType}`)}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {request.note}
            </p>
          </div>
        ),
      },
      {
        header: t("columns.items"),
        render: (request) =>
          t("itemsCount", {
            count: request.lines.reduce((sum, l) => sum + l.quantity, 0),
          }),
      },
      {
        header: t("columns.date"),
        render: (request) => formatDate(request.createdAt, locale),
      },
      {
        header: t("columns.status"),
        render: (request) => (
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${RETURN_STATUS_STYLES[request.status]}`}
          >
            {t(`status.${request.status}`)}
          </span>
        ),
      },
    ],
    [t, locale],
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <EntityPageHeader
        title={t("listTitle")}
        subtitle={t("listSubtitle")}
        totalResults={tCommon("results.total", {
          count: data?.meta?.total ?? 0,
        })}
      />

      <div className="flex items-center gap-1 flex-wrap">
        {TABS.map((key) => (
          <button
            key={key}
            onClick={() => {
              setTab(key);
              setPage(1);
            }}
            disabled={isLoading}
            className={`cursor-pointer px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === key
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {key === "all" ? t("filterAll") : t(`status.${key}`)}
          </button>
        ))}
      </div>

      <EntityDataTable<ReturnRequestListItem>
        data={data?.data ?? []}
        isLoading={isLoading}
        columns={columns}
        pagination={data?.meta?.pagination}
        onPageChange={setPage}
        emptyState={{ title: t("empty") }}
      />
    </div>
  );
}
