"use client";

import { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

// Custom Hooks
import { useQueryState } from "@/shared/hooks/useQueryState";
import { useConfirmDialog } from "@/shared/hooks/useConfirmDialog";
import { useToast } from "@/shared/hooks/useToast";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";

// Mutations & Queries
import {
  useAdminPaymentMethods,
  useDeletePaymentMethod,
  useUpdatePaymentMethod,
} from "@/features/payments/hooks/usePaymentMethods";

// UI Components
import { Button } from "@/shared/ui/Button";
import EntityDataTable from "@/shared/ui/dashboard/EntityDataTable";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";
import EntityPageHeader from "@/shared/ui/dashboard/EntityPageHeader";
import EntitySearchBar from "@/shared/ui/dashboard/EntitySearchBar";
import { Switch } from "@/shared/ui/Switch";
import { Tooltip } from "@/shared/ui/Tooltip";
import Can from "@/components/auth/Can";

// Icons & Utils
import { EditIcon, PlusIcon, TrashIcon } from "@/shared/ui/Icons";
import { cn } from "@/lib/utils";

// Types
import { Permissions } from "@/features/roles/types";
import { PaymentMethodRow } from "@/features/payments/types";
import { useTrans } from "@/shared/hooks/useTrans";

/**
 * Defines the available tabs for filtering payment methods.
 */
type ViewTab = "all" | "active" | "inactive";

/**
 * Maps each view tab to its corresponding API query parameter.
 */
const TAB_FILTER_PARAMS: Record<ViewTab, Record<string, string>> = {
  all: {},
  active: { isActive: "true" },
  inactive: { isActive: "false" },
};

/**
 * PaymentMethodsPage Component
 * * Renders the dashboard page for managing payment methods. Includes functionality
 * for searching, filtering by status, pagination, updating status, and deleting entries.
 * * @returns {JSX.Element} The fully rendered Payment Methods management page.
 */
export default function PaymentMethodsPage() {
  // ===========================================================================
  // Hooks & Utilities
  // ===========================================================================
  const { getQueryParam, setQueryParams } = useQueryState();
  const formatCurrency = useFormatCurrency();
  const router = useRouter();
  const confirmDialog = useConfirmDialog();
  const toast = useToast();
  const getTrans = useTrans();

  // Translations
  const t = useTranslations("paymentMethods");
  const tCommon = useTranslations("common");
  const tButtons = useTranslations("common.buttons");
  const locale = useLocale();

  // ===========================================================================
  // State & Query Parameters
  // ===========================================================================
  const page = Number(getQueryParam("page", "1"));
  const search = getQueryParam("search", "");
  const viewTab = getQueryParam("tab", "active") as ViewTab;

  /**
   * Memoized query parameters to fetch the payment methods.
   * Prevents unnecessary re-fetching if parameters haven't changed.
   */
  const queryParams = useMemo(
    () => ({
      page,
      limit: 10,
      keywords: search,
      locale,
      ...TAB_FILTER_PARAMS[viewTab],
    }),
    [page, search, viewTab, locale],
  );

  // ===========================================================================
  // Data Fetching & Mutations
  // ===========================================================================
  const { data, isLoading, refetch } = useAdminPaymentMethods(queryParams);

  const { mutateAsync: deleteMethodAsync, isPending: deleteMethodPending } =
    useDeletePaymentMethod();

  const { mutateAsync: updateMethodAsync, isPending: updateMethodPending } =
    useUpdatePaymentMethod();

  // ===========================================================================
  // Event Handlers
  // ===========================================================================

  /**
   * Updates the current page index in the URL query.
   */
  const handlePageChange = useCallback(
    (val: number) => {
      setQueryParams({ page: val });
    },
    [setQueryParams],
  );

  /**
   * Updates the search keyword in the URL query and resets to page 1.
   */
  const handleSearch = useCallback(
    (value: string) => {
      setQueryParams({ search: value, page: 1 });
    },
    [setQueryParams],
  );

  /**
   * Updates the active tab filter in the URL query and resets to page 1.
   */
  const handleTabChange = useCallback(
    (tabValue: string) => {
      setQueryParams({ tab: tabValue, page: 1 });
    },
    [setQueryParams],
  );

  /**
   * Toggles the active status of a payment method.
   * * @param {PaymentMethodRow} method - The payment method being updated.
   * @param {boolean} newStatus - The new boolean status.
   */
  const handleStatusChange = useCallback(
    async (method: PaymentMethodRow, newStatus: boolean) => {
      if (newStatus === undefined) return;
      try {
        await updateMethodAsync({
          id: method._id,
          data: { isActive: newStatus },
        });
        toast.success(tCommon("messages.updateSuccess"));
        refetch();
      } catch (error: unknown) {
        console.error("Failed to update status:", error);
        toast.error(tCommon("messages.errorOccurred"));
      }
    },
    [updateMethodAsync, toast, tCommon, refetch],
  );

  /**
   * Opens the confirmation dialog for deleting a payment method.
   * * @param {string} id - The ID of the payment method.
   * @param {string} name - The name of the payment method (for display).
   */
  const handleDelete = useCallback(
    (id: string, name: string) => {
      confirmDialog.openDialog({
        title: t("deleteConfirmationTitle"),
        message: t("deleteConfirmationMessage", { name }),
        onConfirm: async () => {
          await deleteMethodAsync(id);
          refetch();
        },
      });
    },
    [confirmDialog, deleteMethodAsync, refetch, t],
  );

  // ===========================================================================
  // UI Configurations (Tabs & Columns)
  // ===========================================================================

  /**
   * Configuration array for the filter tabs.
   */
  const tabs = useMemo(
    () => [
      {
        label: t("tabs.all"),
        key: "all",
        activeClass: "bg-primary text-primary-foreground shadow-sm",
      },
      {
        label: t("tabs.active"),
        key: "active",
        activeClass: "bg-emerald-500 text-white shadow-sm",
      },
      {
        label: t("tabs.inactive"),
        key: "inactive",
        activeClass: "bg-destructive/70 text-destructive-foreground shadow-sm",
      },
    ],
    [t],
  );

  /**
   * Configuration array for the DataTable columns.
   * Wrapped in useMemo to prevent unnecessary re-renders of the table component.
   */
  const columns = useMemo(
    () => [
      {
        header: t("columns.code"),
        className: "w-48",
        render: (method: PaymentMethodRow) => (
          <div className="flex flex-col gap-1 py-1">
            <div className="font-bold text-base text-foreground font-mono group-hover:text-primary transition-colors">
              {getTrans(method.name)}
            </div>
            <span className="text-[10px] text-destructive font-medium uppercase tracking-wider opacity-80">
              {method.code}
            </span>
          </div> 
        ),
      },
      {
        header: t("columns.type"),
        render: (method: PaymentMethodRow) => (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-semibold">
            {t(`types.${method.type}`)}
          </span>
        ),
      },
      {
        header: t("columns.fees"),
        render: (method: PaymentMethodRow) => (
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">
              {method?.fixedFee
                ? formatCurrency(method.fixedFee || 0)
                : `${method?.percentageFee || 0}%`}
            </span>
          </div>
        ),
      },
      {
        header: "Status",
        render: (method: PaymentMethodRow) => (
          <div className="flex items-center gap-2">
            <Switch
              checked={method.isActive}
              onCheckedChange={(checked) => handleStatusChange(method, checked)}
            />
            <span
              className={cn(
                "text-xs font-bold uppercase tracking-wider",
                method.isActive ? "text-success" : "text-muted-foreground",
              )}
            >
              {method.isActive ? t("tabs.active") : t("tabs.inactive")}
            </span>
          </div>
        ),
      },
      {
        header: tButtons("actions"),
        className: "ps-6 text-center",
        render: (method: PaymentMethodRow) => (
          <div className="flex justify-center gap-2 transition-all duration-300">
            {/* Edit Action */}
            <Can permission={Permissions.UPDATE_PAYMENT_METHOD}>
              <Tooltip content={tButtons("edit")}>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 text-primary rounded-xl bg-background/50 border-border/40 hover:bg-primary/10 hover:text-primary/70 hover:border-primary/20 transition-all"
                  onClick={() =>
                    router.push(`/dashboard/payment-methods/${method._id}/edit`)
                  }
                  disabled={
                    updateMethodPending || isLoading || deleteMethodPending
                  }
                >
                  <EditIcon className="h-4 w-4" />
                </Button>
              </Tooltip>
            </Can>

            {/* Delete Action */}
            <Can permission={Permissions.DELETE_PAYMENT_METHOD}>
              <Tooltip content={tButtons("delete")}>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-xl bg-background/50 border-border/40 hover:bg-destructive/10 text-destructive hover:text-destructive/70 hover:border-destructive/20 transition-all"
                  onClick={() => handleDelete(method._id, getTrans(method.name))}
                  isLoading={deleteMethodPending}
                  disabled={
                    deleteMethodPending || isLoading || updateMethodPending
                  }
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </Tooltip>
            </Can>
          </div>
        ),
      },
    ],
    [
      t,
      tButtons,
      router,
      handleDelete,
      deleteMethodPending,
      updateMethodPending,
      handleStatusChange,
      isLoading,
      formatCurrency,
      getTrans,
    ],
  );

  // ===========================================================================
  // Render
  // ===========================================================================
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <EntityPageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        totalResults={data?.meta?.pagination?.totalResults?.toString() || "0"}
        action={{
          label: t("create"),
          icon: <PlusIcon className="w-4 h-4" />,
          onClick: () => router.push(`/dashboard/payment-methods/create`),
          disabled: updateMethodPending || isLoading || deleteMethodPending,
          permission: Permissions.CREATE_PAYMENT_METHOD,
        }}
      />

      {/* Filters & Search */}
      <div className="flex flex-col gap-4">
        <EntitySearchBar
          defaultValue={search}
          onSearch={handleSearch}
          placeholder={t("searchPlaceholder")}
        />

        {/* Status Tabs */}
        <div className="border-b border-border/40 pb-4">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                disabled={
                  viewTab === tab.key ||
                  isLoading ||
                  deleteMethodPending ||
                  updateMethodPending
                }
                onClick={() => handleTabChange(tab.key)}
                className={cn(
                  "px-4 py-2 cursor-pointer rounded-xl text-sm font-bold ",
                  viewTab === tab.key
                    ? tab.activeClass
                    : "bg-muted/50 text-muted-foreground hover:bg-muted/80",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <EntityDataTable<PaymentMethodRow>
        data={data?.data ?? []}
        isLoading={isLoading}
        pagination={data?.meta?.pagination}
        onPageChange={handlePageChange}
        columns={columns}
        emptyState={{
          title: t("empty.title"),
          description: t("empty.description"),
          createLink: () => router.push(`/dashboard/payment-methods/create`),
          createLabel: t("empty.createLabel"),
        }}
      />

      {/* Shared Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.closeDialog}
        onConfirm={confirmDialog.handleConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={tButtons("delete")}
        cancelText={tButtons("cancel")}
        isDangerous={confirmDialog.isDangerous}
        isLoading={confirmDialog.isLoading}
      />
    </div>
  );
}
