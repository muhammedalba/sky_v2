"use client";

import { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useQueryState } from "@/shared/hooks/useQueryState";

import {
  useAdminPaymentMethods,
  useDeletePaymentMethod,
  useUpdatePaymentMethod,
} from "@/features/payments/hooks/usePaymentMethods";
import { Button } from "@/shared/ui/Button";
import EntityDataTable from "@/shared/ui/dashboard/EntityDataTable";
import { EditIcon, PlusIcon, TrashIcon } from "@/shared/ui/Icons";
import { cn } from "@/lib/utils";
import { useConfirmDialog } from "@/shared/hooks/useConfirmDialog";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";
import EntityPageHeader from "@/shared/ui/dashboard/EntityPageHeader";
import EntitySearchBar from "@/shared/ui/dashboard/EntitySearchBar";

import { Switch } from "@/shared/ui/Switch";
import { useToast } from "@/shared/hooks/useToast";
import { Tooltip } from "@/shared/ui/Tooltip";
import { Permissions } from "@/features/roles/types";
import Can from "@/components/auth/Can";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";

type PaymentMethodRow = {
  _id: string;
  name: string;
  code: string;
  type: string;
  fixedFee?: number;
  percentageFee?: number;
  isActive: boolean;
  [key: string]: unknown;
};

type ViewTab = "all" | "active" | "inactive";

const TAB_FILTER_PARAMS: Record<ViewTab, Record<string, string>> = {
  all: {},
  active: { isActive: "true" },
  inactive: { isActive: "false" },
};

export default function PaymentMethodsPage() {
  // hooks
  const { getQueryParam, setQueryParams } = useQueryState();
  const formatCurrency = useFormatCurrency();
  const locale = useLocale();
  const router = useRouter();
  const confirmDialog = useConfirmDialog();
  const toast = useToast();
  // use tras
  const t = useTranslations("paymentMethods");
  const tCommon = useTranslations("common");
  const tButtons = useTranslations("common.buttons");
  // query params
  const page = Number(getQueryParam("page", "1"));
  const search = getQueryParam("search", "");
  const viewTab = getQueryParam("tab", "active") as ViewTab;

  const queryParams = useMemo(
    () => ({
      page,
      limit: 10,
      keywords: search,
      ...TAB_FILTER_PARAMS[viewTab],
    }),
    [page, search, viewTab],
  );
  //get data
  const { data, isLoading, refetch } = useAdminPaymentMethods(queryParams);
  // mutations
  const { mutateAsync: deleteMethodAsync, isPending: deleteMethodPending } =
    useDeletePaymentMethod();
  const { mutateAsync: updateMethodAsync, isPending: updateMethodPending } =
    useUpdatePaymentMethod();
  // handlers
  const handlePageChange = useCallback(
    (val: number) => {
      setQueryParams({ page: val });
    },
    [setQueryParams],
  );

  const handleSearch = useCallback(
    (value: string) => {
      setQueryParams({ search: value, page: 1 });
    },
    [setQueryParams],
  );

  const handleTabChange = useCallback(
    (tabValue: string) => {
      setQueryParams({ tab: tabValue, page: 1 });
    },
    [setQueryParams],
  );

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
        console.log(error);

        toast.error(tCommon("messages.errorOccurred"));
      }
    },
    [updateMethodAsync, toast, tCommon, refetch],
  );

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
    [confirmDialog, deleteMethodAsync, refetch],
  );

  const tabs = [
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
      activeClass: "bg-destructive text-destructive-foreground shadow-sm",
    },
  ];

  const columns = useMemo(
    () => [
      {
        header: t("columns.code"),
        className: "w-48",
        render: (method: PaymentMethodRow) => (
          <div className="flex flex-col gap-1 py-1">
            <div className="font-bold text-base text-foreground font-mono group-hover:text-primary transition-colors">
              {method.name}
            </div>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider opacity-60">
              {method.code}
            </span>
          </div>
        ),
      },
      {
        header: t("columns.type"),
        render: (method: PaymentMethodRow) => (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
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
              {method.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        ),
      },
      {
        header: tButtons("actions"),
        className: "ps-6 text-center",
        render: (method: PaymentMethodRow) => (
          <div className="flex justify-center gap-2 transition-all duration-300">
            <Can permission={Permissions.UPDATE_SETTINGS}>
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

            <Can permission={Permissions.UPDATE_SETTINGS}>
              <Tooltip content={tButtons("delete")}>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-xl bg-background/50 border-border/40 hover:bg-destructive/10 text-destructive hover:text-destructive/70 hover:border-destructive/20 transition-all"
                  onClick={() => handleDelete(method._id, method.name)}
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
    ],
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <EntityPageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        totalResults={data?.meta?.pagination?.totalResults?.toString() || "0"}
        action={{
          label: t("create"),
          icon: <PlusIcon className="w-4 h-4" />,
          onClick: () =>
            router.push(`/${locale}/dashboard/payment-methods/create`),
          disabled: updateMethodPending || isLoading || deleteMethodPending,
          permission: Permissions.UPDATE_SETTINGS,
        }}
      />

      <div className="flex flex-col gap-4">
        <EntitySearchBar
          defaultValue={search}
          onSearch={handleSearch}
          placeholder={t("searchPlaceholder")}
        />

        <div className="border-b border-border/40 pb-4">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${viewTab === tab.key ? tab.activeClass : "bg-muted/50 text-muted-foreground hover:bg-muted/80"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <EntityDataTable<PaymentMethodRow>
        data={data?.data || []}
        isLoading={isLoading}
        pagination={data?.meta?.pagination}
        onPageChange={handlePageChange}
        columns={columns}
        emptyState={{
          title: t("empty.title"),
          description: t("empty.description"),
          createLink: () =>
            router.push(`/${locale}/dashboard/payment-methods/create`),
          createLabel: t("empty.createLabel"),
        }}
      />

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
