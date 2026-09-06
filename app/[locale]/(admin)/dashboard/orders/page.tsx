"use client";

import { useMemo, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useOrders,
  useUpdateOrderStatus,
  useDeleteOrder,
} from "@/features/orders/hooks/useOrders";
import { useOrderStats } from "@/features/orders/hooks/useOrderStats";
import { useOrderFilters } from "@/features/orders/hooks/useOrderFilters";
import { useOrderSelection } from "@/features/orders/hooks/useOrderSelection";
import OrderStatsCards from "@/features/orders/components/OrderStatsCards";
import OrderChartsSection from "@/features/orders/components/OrderChartsSection";
import OrderFiltersComponent from "@/features/orders/components/OrderFilters";
import OrdersTable from "@/features/orders/components/OrdersTable";
import OrderMobileCard from "@/features/orders/components/OrderMobileCard";
import OrderDetailDrawer from "@/features/orders/components/OrderDetailDrawer";
import InvoicePreviewDialog from "@/features/orders/components/InvoicePreviewDialog";
import OrderBulkActions from "@/features/orders/components/OrderBulkActions";
import Pagination from "@/shared/ui/Pagination";
import { Order } from "@/types";
import { useQueryState } from "@/shared/hooks/useQueryState";
import EntityPageHeader from "@/shared/ui/dashboard/EntityPageHeader";
import { Permissions } from "@/features/roles/types";
import { RefreshCwIcon } from "@/shared/ui/Icons";
import { useTranslations } from "next-intl";
import Can from "@/components/auth/Can";
import { useConfirmDialog } from "@/shared/hooks/useConfirmDialog";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";

export default function OrdersPage() {
  const t = useTranslations("orders");
  const { getQueryParam, setQueryParam } = useQueryState();
  const queryClient = useQueryClient();

  const page = Number(getQueryParam("page", "1"));
  const limit = 10;

  // Hooks for filters and selection
  const {
    filters,
    sortField,
    sortDirection,
    setFilter,
    setSorting,
    resetFilters,
    activeFilterCount,
    hasActiveFilters,
  } = useOrderFilters();

  // Combine query parameters
  const queryParams = useMemo(
    () => ({
      page,
      limit,
      status: filters.status || undefined,
      paymentStatus: filters.paymentStatus || undefined,
      paymentMethod: filters.paymentMethod || undefined,
      keywords: filters.search || undefined,
      sort: sortDirection === "desc" ? `-${sortField}` : sortField,
      startDate: filters.dateFrom || undefined,
      endDate: filters.dateTo || undefined,
    }),
    [page, limit, filters, sortField, sortDirection],
  );

  // Fetch orders and stats
  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    isRefetching,
  } = useOrders(queryParams);

  // stats - using filters dateRange only
  const statsQueryParams = useMemo(
    () => ({
      startDate: filters.dateFrom || undefined,
      endDate: filters.dateTo || undefined,
    }),
    [filters],
  );
  const { data: statsData, isLoading: isStatsLoading } =
    useOrderStats(statsQueryParams);

  const orders = useMemo(() => ordersData?.data || [], [ordersData]);
  const orderIds = useMemo(() => orders.map((o) => o._id), [orders]);

  const {
    selectedCount,
    isSelected,
    isAllSelected,
    toggleOne,
    toggleAll,
    clearSelection,
    selectedArray,
  } = useOrderSelection(orderIds);

  // Drawer & Dialog State
  const [selectedOrderForDrawer, setSelectedOrderForDrawer] =
    useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] =
    useState<Order | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Actions
  const updateStatusMutation = useUpdateOrderStatus();
  const deleteOrderMutation = useDeleteOrder();
  const {
    openDialog,
    closeDialog,
    handleConfirm,
    isOpen: isConfirmOpen,
    isLoading: isConfirmLoading,
    title: confirmTitle,
    message: confirmMessage,
    isDangerous: isConfirmDangerous,
  } = useConfirmDialog();

  const handleViewOrder = useCallback((order: Order) => {
    setSelectedOrderForDrawer(order);
    setIsDrawerOpen(true);
  }, []);

  const handlePreviewInvoice = useCallback((order: Order) => {
    setSelectedOrderForInvoice(order);
    setIsInvoiceOpen(true);
  }, []);

  const handleSingleDelete = useCallback(
    (id: string) => {
      openDialog({
        title: t("bulk.deleteTitle") || "Delete Order",
        message:
          t("bulk.deleteMessage", { count: 1 }) ||
          "Are you sure you want to delete this order?",
        isDangerous: true,
        onConfirm: async () => {
          await deleteOrderMutation.mutateAsync(id);
        },
      });
    },
    [deleteOrderMutation, openDialog, t],
  );

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    queryClient.invalidateQueries({ queryKey: ["order-stats"] });
  }, [queryClient]);

  // Bulk Actions
  const handleBulkStatusUpdate = useCallback(
    async (status: string) => {
      await Promise.all(
        selectedArray.map((id) =>
          updateStatusMutation.mutateAsync({ id, status }),
        ),
      );
      clearSelection();
    },
    [selectedArray, updateStatusMutation, clearSelection],
  );

  const handleBulkDelete = useCallback(async () => {
    await Promise.all(
      selectedArray.map((id) => deleteOrderMutation.mutateAsync(id)),
    );
    clearSelection();
  }, [selectedArray, deleteOrderMutation, clearSelection]);

  // Client-side CSV export helper
  const handleExportCsv = useCallback(
    (ordersToExport: Order[], filename: string) => {
      const headers = [
        "Order ID",
        "Customer Name",
        "Customer Email",
        "Status",
        "Payment Status",
        "Payment Method",
        "Quantity",
        "Total",
        "Date",
      ];
      const rows = ordersToExport.map((o) => [
        o._id,
        o.user?.name || "Guest",
        o.user?.email || "",
        o.status,
        o.paymentStatus || "",
        o.paymentMethodCode || o.paymentMethod || "",
        o.totalQuantity || o.items?.length || 0,
        o.grandTotal || o.totalPrice || 0,
        o.createdAt,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8,\uFEFF" +
        [
          headers.join(","),
          ...rows.map((e) =>
            e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","),
          ),
        ].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [],
  );
  // we use letter to filter
  const handleExportAll = useCallback(() => {
    handleExportCsv(
      orders,
      `orders-export-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  }, [orders, handleExportCsv]);

  const handleBulkExport = useCallback(() => {
    const selectedOrders = orders.filter((o) => selectedArray.includes(o._id));
    handleExportCsv(
      selectedOrders,
      `selected-orders-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  }, [orders, selectedArray, handleExportCsv]);

  const handlePageChange = useCallback(
    (val: number) => {
      setQueryParam("page", String(val));
    },
    [setQueryParam],
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-16">
      {/* 1. Header component */}

      <EntityPageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        totalResults={t("totalOrders", {
          count: ordersData?.meta?.pagination?.totalResults || 0,
        })}
        action={{
          label: t("refresh"),
          icon: <RefreshCwIcon className="w-5 h-5" />,
          onClick: handleRefresh,
          disabled: isOrdersLoading || isRefetching,
          permission: Permissions.UPDATE_ORDER_STATUS,
        }}
      />

      {/* 2. Stat Cards Grid */}
      <Can permission={Permissions.VIEW_DASHBOARD_STATS}>
        <OrderStatsCards stats={statsData} isLoading={isStatsLoading} />
      </Can>
      {/* 3. Charts & Analytics Row */}
      <Can permission={Permissions.VIEW_DASHBOARD_STATS}>
        <OrderChartsSection stats={statsData} isLoading={isStatsLoading} />
      </Can>

      {/* 4. Filters & Search Section */}
      <OrderFiltersComponent
        filters={filters}
        activeFilterCount={activeFilterCount}
        hasActiveFilters={hasActiveFilters}
        onFilterChange={setFilter}
        onReset={resetFilters}
      />

      {/* 5. Responsive Orders Grid / Table */}
      <div className="block md:hidden space-y-4">
        {isOrdersLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-border/40 bg-card space-y-4 animate-pulse"
            >
              <div className="flex justify-between">
                <div className="h-5 w-24 bg-muted rounded" />
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
              <div className="h-10 bg-muted rounded-xl" />
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-muted rounded-full" />
                <div className="h-5 w-16 bg-muted rounded-full" />
              </div>
            </div>
          ))
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-border/40 bg-card flex flex-col items-center justify-center py-16 px-6">
            <p className="text-base font-bold text-foreground">
              No orders found
            </p>
          </div>
        ) : (
          orders?.map((order) => (
            <OrderMobileCard
              key={order._id}
              order={order}
              onClick={() => handleViewOrder(order)}
            />
          ))
        )}
      </div>

      <div className="hidden md:block">
        <OrdersTable
          data={orders}
          isLoading={isOrdersLoading}
          isSelected={isSelected}
          isAllSelected={isAllSelected}
          onToggleOne={toggleOne}
          onToggleAll={toggleAll}
          onViewOrder={handleViewOrder}
          onDeleteOrder={handleSingleDelete}
          onPreviewInvoice={handlePreviewInvoice}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={setSorting}
        />
      </div>

      {/* 6. Pagination */}
      {ordersData?.meta?.pagination && (
        <Pagination
          pagination={ordersData.meta.pagination}
          onPageChange={handlePageChange}
        />
      )}

      {/* 7. Floating Bulk Actions */}
      <OrderBulkActions
        selectedCount={selectedCount}
        onClearSelection={clearSelection}
        onBulkStatusUpdate={handleBulkStatusUpdate}
        onBulkDelete={handleBulkDelete}
        onBulkExport={handleBulkExport}
      />

      {/* 8. Order Detail Drawer (max-w-2xl) */}
      <OrderDetailDrawer
        order={selectedOrderForDrawer}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />

      {/* 9. Invoice Preview Dialog */}
      <InvoicePreviewDialog
        order={selectedOrderForInvoice}
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
      />

      {/* 10. Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        title={confirmTitle}
        message={confirmMessage}
        isDangerous={isConfirmDangerous}
        isLoading={isConfirmLoading}
      />
    </div>
  );
}
