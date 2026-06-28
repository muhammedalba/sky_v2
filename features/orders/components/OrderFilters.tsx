"use client";

import { useState } from "react";
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

const ORDER_STATUS_OPTIONS = [
  { value: "pending_payment", label: "Pending Payment" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "expired", label: "Expired" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "INITIATED", label: "Initiated" },
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "EXPIRED", label: "Expired" },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: "moyasar", label: "Moyasar" },
  { value: "stripe", label: "Stripe" },
  { value: "paypal", label: "PayPal" },
  { value: "cod", label: "Cash on Delivery" },
  { value: "banktransfer", label: "Bank Transfer" },
];

export default function OrderFilters({
  filters,
  activeFilterCount,
  hasActiveFilters,
  onFilterChange,
  onReset,
}: OrderFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);


  return (
    <div className="space-y-3">
      {/* Main row: Search + Toggle + Reset */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <EntitySearchBar
          placeholder="Search orders, customers, emails..."
          defaultValue={filters.search}
          onSearch={(value) => onFilterChange("search", value)}
          debounceMs={400}
          className="flex-1 min-w-[240px] max-w-md"
        />
       
        {/* Filter Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-10 px-4 rounded-xl gap-2"
        >
          <ChevronDownIcon
            className={cn(
              "w-4 h-4 transition-transform duration-300",
              isExpanded && "rotate-180",
            )}
          />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="rounded-full h-5 min-w-5 px-1.5 text-[10px] font-bold bg-primary text-primary-foreground border-none">
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
            className="h-10 px-4 rounded-xl text-muted-foreground hover:text-destructive gap-1.5"
          >
            <XIcon className="w-3.5 h-3.5" />
            Reset
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 overflow-hidden transition-all duration-300",
          isExpanded
            ? "max-h-[500px] opacity-100"
            : "max-h-0 opacity-0 pointer-events-none",
        )}
      >
        <Select
          options={ORDER_STATUS_OPTIONS}
          value={filters.status}
          onChange={(e) => onFilterChange("status", e.target.value)}
          label="Order Status"
          className="h-10"
        />

        <Select
          options={PAYMENT_STATUS_OPTIONS}
          value={filters.paymentStatus}
          onChange={(e) => onFilterChange("paymentStatus", e.target.value)}
          label="Payment Status"
          className="h-10"
        />

        <Select
          options={PAYMENT_METHOD_OPTIONS}
          value={filters.paymentMethod}
          onChange={(e) => onFilterChange("paymentMethod", e.target.value)}
          label="Payment Method"
          className="h-10"
        />

         <div className="flex gap-2">
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onFilterChange('dateFrom', e.target.value)}
            className="flex-1 h-10 px-3 text-sm rounded-xl border border-border/50 bg-secondary/30 transition-all duration-200 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
            placeholder="From"
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onFilterChange('dateTo', e.target.value)}
            className="flex-1 h-10 px-3 text-sm rounded-xl border border-border/50 bg-secondary/30 transition-all duration-200 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
            placeholder="To"
          />
        </div> 
      </div>
    </div>
  );
}
