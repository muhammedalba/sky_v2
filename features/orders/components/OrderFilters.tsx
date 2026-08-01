"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Select } from "@/shared/ui/Select";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/Badge";
import { XIcon, ChevronDownIcon } from "@/shared/ui/Icons";
import { cn } from "@/lib/utils";
import { OrderFilters as OrderFiltersType } from "@/features/orders/types";
import EntitySearchBar from "@/shared/ui/dashboard/EntitySearchBar";

interface OrderFiltersProps {
  filters: OrderFiltersType;
  activeFilterCount: number;
  hasActiveFilters: boolean;
  onFilterChange: (key: keyof OrderFiltersType, value: string) => void;
  onReset: () => void;
}

export default function OrderFilters({
  filters,
  activeFilterCount,
  hasActiveFilters,
  onFilterChange,
  onReset,
}: OrderFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const t = useTranslations("orders");

  const ORDER_STATUS_OPTIONS = [
    { value: "pending_payment", label: t("status.pending_payment") },
    { value: "pending", label: t("status.pending") },
    { value: "processing", label: t("status.processing") },
    { value: "shipped", label: t("status.shipped") },
    { value: "delivered", label: t("status.delivered") },
    { value: "completed", label: t("status.completed") },
    { value: "cancelled", label: t("status.cancelled") },
    { value: "expired", label: t("status.expired") },
  ];

  const PAYMENT_STATUS_OPTIONS = [
    { value: "INITIATED", label: t("paymentStatus.INITIATED") },
    { value: "PENDING", label: t("paymentStatus.PENDING") },
    { value: "PAID", label: t("paymentStatus.PAID") },
    { value: "FAILED", label: t("paymentStatus.FAILED") },
    { value: "CANCELLED", label: t("paymentStatus.CANCELLED") },
    { value: "REFUNDED", label: t("paymentStatus.REFUNDED") },
    { value: "EXPIRED", label: t("paymentStatus.EXPIRED") },
  ];

  const PAYMENT_METHOD_OPTIONS = [
    { value: "moyasar", label: t("paymentMethods.moyasar") },
    { value: "stripe", label: t("paymentMethods.stripe") },
    { value: "paypal", label: t("paymentMethods.paypal") },
    { value: "cod", label: t("paymentMethods.cod") },
    { value: "banktransfer", label: t("paymentMethods.banktransfer") },
  ];

  return (
    <div className="space-y-3">
      {/* Main row: Search + Toggle + Reset */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <EntitySearchBar
          placeholder={t("filters.search")}
          defaultValue={filters.search}
          onSearch={(value) => onFilterChange("search", value)}
          debounceMs={400}
          className="flex-1 min-w-[240px] max-w-md"
        />
       
        {/* Filter Toggle */}
        <Button
          variant="default"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-10 px-4 gap-2"
        >
          <ChevronDownIcon
            className={cn(
              "w-4 h-4 transition-transform duration-300",
              isExpanded && "rotate-180",
            )}
          />
          {t("filters.toggle")}
          {activeFilterCount > 0 && (
            <Badge className="rounded-full h-5 min-w-5 p-2 text-[10px] font-bold bg-accent text-accent-foreground border-none">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {/* Reset */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-10 px-4 rounded-xl text-muted-foreground hover:text-destructive gap-1.5 border border-destructive"
          >
            <XIcon className="w-3.5 h-3.5" />
            {t("filters.reset")}
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 overflow-hidden transition-all duration-300 py-2",
          isExpanded
            ? "max-h-[500px] opacity-100"
            : "max-h-0 opacity-0 pointer-events-none",
        )}
      >
        <Select
          options={ORDER_STATUS_OPTIONS}
          value={filters.status}
          onChange={(e) => onFilterChange("status", e.target.value)}
          label={t("filters.orderStatus")}
          className="h-10"
        />

        <Select
          options={PAYMENT_STATUS_OPTIONS}
          value={filters.paymentStatus}
          onChange={(e) => onFilterChange("paymentStatus", e.target.value)}
          label={t("filters.paymentStatus")}
          className="h-10"
        />

        <Select
          options={PAYMENT_METHOD_OPTIONS}
          value={filters.paymentMethod}
          onChange={(e) => onFilterChange("paymentMethod", e.target.value)}
          label={t("filters.paymentMethod")}
          className="h-10"
        />

         <div className="flex gap-2">
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onFilterChange('dateFrom', e.target.value)}
            className="flex-1 h-10 px-3 text-sm rounded-xl border border-border/50 bg-secondary/30 transition-all duration-200 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
            placeholder={t("filters.dateFrom")}
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onFilterChange('dateTo', e.target.value)}
            className="flex-1 h-10 px-3 text-sm rounded-xl border border-border/50 bg-secondary/30 transition-all duration-200 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
            placeholder={t("filters.dateTo")}
          />
        </div> 
      </div>
    </div>
  );
}
