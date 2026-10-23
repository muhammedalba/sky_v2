"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Can, useCan } from "@/components/auth/Can";
import { Permissions } from "@/features/roles/types";
import { invoicesApi } from "@/features/invoices/api";
import {
  useCreditNotesList,
  useInvoiceStats,
  useInvoices,
  useRegenerateDocument,
  useResendDocument,
} from "@/features/invoices/hooks/useInvoices";
import {
  CreditNoteListItem,
  CreditNoteQuery,
  InvoiceListItem,
  InvoiceQuery,
} from "@/features/invoices/types";
import InvoiceStatsCards from "./InvoiceStatsCards";
import PdfViewerModal from "./PdfViewerModal";
import IssueCreditNoteDialog from "./IssueCreditNoteDialog";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Select } from "@/shared/ui/Select";
import { Tooltip } from "@/shared/ui/Tooltip";
import { DateRangeFilter, DateRangeParams } from "@/shared/ui/DateRangeFilter";
import {
  DownloadIcon,
  EyeIcon,
  FilterIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  SendIcon,
} from "@/shared/ui/Icons";
import EntityDataTable, { Column } from "@/shared/ui/dashboard/EntityDataTable";
import EntityPageHeader from "@/shared/ui/dashboard/EntityPageHeader";
import EntitySearchBar from "@/shared/ui/dashboard/EntitySearchBar";
import { useQueryState } from "@/shared/hooks/useQueryState";
import { useDownloadFile } from "@/shared/hooks/useDownloadFile";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { useToast } from "@/shared/hooks/useToast";
import { getFileUrl } from "@/shared/utils/image.util";
import { formatDate } from "@/lib/utils";

const PAGE_SIZE = 20;
type Tab = "invoices" | "credit-notes";

/** "YYYY-MM-DD" (local day) → ISO bound of that day. */
const dayBound = (day: string, end: boolean) =>
  day
    ? new Date(`${day}T${end ? "23:59:59.999" : "00:00:00"}`).toISOString()
    : undefined;

/** Saves a Blob as a file. */
function saveBlob(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Admin > Invoices & credit notes: the issued tax documents, searchable and
 * filterable by period, with the period's totals and a CSV for the
 * accountant. Read only: an issued document is never edited or deleted; a
 * credit note corrects an invoice ("Issue credit note"). A document that
 * failed to issue can be retried; an issued one can be emailed again.
 */
export default function InvoicesPage() {
  const t = useTranslations("invoices");
  return (
    <Can
      permission={Permissions.VIEW_INVOICES}
      fallback={
        <p className="p-8 text-center text-muted-foreground">{t("noAccess")}</p>
      }
    >
      <InvoicesContent />
    </Can>
  );
}

function InvoicesContent() {
  const t = useTranslations("invoices");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const can = useCan();
  const toast = useToast();
  const formatCurrency = useFormatCurrency();
  const { downloadFile, isDownloading } = useDownloadFile();
  const { mutate: resend, isPending: isResending } = useResendDocument();
  const { mutate: regenerate, isPending: isRegenerating } =
    useRegenerateDocument();

  // Filters live in the URL so a filtered view can be shared / reloaded
  const { getQueryParam, setQueryParam, setQueryParams } = useQueryState();
  const tab = (getQueryParam("tab", "invoices") as Tab) || "invoices";
  const page = Number(getQueryParam("page", "1")) || 1;
  const search = getQueryParam("search", "");
  const status = getQueryParam("status", "");
  const reasonType = getQueryParam("reasonType", "");
  const from = getQueryParam("from", "");
  const to = getQueryParam("to", "");

  const range = useMemo(
    () => ({ from: dayBound(from, false), to: dayBound(to, true) }),
    [from, to],
  );
  const invoiceQuery = useMemo<InvoiceQuery>(
    () => ({
      ...range,
      page,
      limit: PAGE_SIZE,
      search: search || undefined,
      status: (status || undefined) as InvoiceQuery["status"],
    }),
    [range, page, search, status],
  );
  const creditNoteQuery = useMemo<CreditNoteQuery>(
    () => ({
      ...range,
      page,
      limit: PAGE_SIZE,
      search: search || undefined,
      reasonType: (reasonType || undefined) as CreditNoteQuery["reasonType"],
    }),
    [range, page, search, reasonType],
  );

  const invoices = useInvoices(invoiceQuery, tab === "invoices");
  const creditNotes = useCreditNotesList(
    creditNoteQuery,
    tab === "credit-notes",
  );
  const { data: stats, isLoading: isStatsLoading } = useInvoiceStats(range);
  const list = tab === "invoices" ? invoices : creditNotes;

  const [viewing, setViewing] = useState<{ url: string; title: string } | null>(
    null,
  );
  const [crediting, setCrediting] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleTab = (next: Tab) =>
    setQueryParams({ tab: next, page: 1, status: "", reasonType: "" });
  const handleSearch = useCallback(
    (value: string) => setQueryParams({ search: value, page: 1 }),
    [setQueryParams],
  );
  const handleDateApply = useCallback(
    ({ startDate, endDate }: DateRangeParams) =>
      setQueryParams({ from: startDate ?? "", to: endDate ?? "", page: 1 }),
    [setQueryParams],
  );
  const handleDateReset = useCallback(
    () => setQueryParams({ from: "", to: "", page: 1 }),
    [setQueryParams],
  );
  const hasFilters = !!(search || status || reasonType || from || to);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await invoicesApi.exportCsv(
        tab,
        tab === "invoices" ? invoiceQuery : creditNoteQuery,
      );
      const stamp = new Date().toISOString().slice(0, 10);
      saveBlob(blob, `${tab}-${stamp}.csv`);
    } catch {
      toast.error(t("exportError"));
    } finally {
      setIsExporting(false);
    }
  };

  const handleResend = (kind: "invoice" | "credit-note", id: string) =>
    resend(
      { kind, id },
      {
        onSuccess: () => toast.success(t("resent")),
        onError: () => toast.error(t("resendError")),
      },
    );
  const handleRegenerate = (orderId: string, noteId?: string) =>
    regenerate(
      { orderId, noteId },
      {
        onSuccess: () => toast.success(t("regenerated")),
        onError: () => toast.error(t("regenerateError")),
      },
    );

  /** View, download, resend: the same for both documents. */
  const fileActions = (
    file: InvoiceListItem["file"],
    title: string,
    resendAction?: () => void,
  ) => {
    const url = getFileUrl(file);
    if (!url) return null;
    return (
      <>
        <Tooltip content={t("actions.view")}>
          <Button
            size="icon"
            variant="ghost"
            aria-label={t("actions.view")}
            className="h-9 w-9 rounded-lg text-primary hover:bg-primary/10"
            onClick={() => setViewing({ url, title })}
          >
            <EyeIcon className="w-4 h-4" />
          </Button>
        </Tooltip>
        <Tooltip content={t("actions.download")}>
          <Button
            size="icon"
            variant="ghost"
            aria-label={t("actions.download")}
            disabled={isDownloading}
            className="h-9 w-9 rounded-lg hover:bg-muted"
            onClick={() => downloadFile(url, { fileName: `${title}.pdf` })}
          >
            <DownloadIcon className="w-4 h-4" />
          </Button>
        </Tooltip>
        {resendAction && (
          <Tooltip content={t("actions.resend")}>
            <Button
              size="icon"
              variant="ghost"
              aria-label={t("actions.resend")}
              disabled={isResending}
              className="h-9 w-9 rounded-lg hover:bg-muted"
              onClick={resendAction}
            >
              <SendIcon className="w-4 h-4" />
            </Button>
          </Tooltip>
        )}
      </>
    );
  };

  const regenerateButton = (onClick: () => void) => (
    <Tooltip content={t("actions.regenerate")}>
      <Button
        size="icon"
        variant="ghost"
        aria-label={t("actions.regenerate")}
        disabled={isRegenerating}
        className="h-9 w-9 rounded-lg text-warning hover:bg-warning/10"
        onClick={onClick}
      >
        <RefreshCwIcon className="w-4 h-4" />
      </Button>
    </Tooltip>
  );

  const orderLink = (orderId: string, number?: number) => (
    <Link
      href={`/${locale}/dashboard/orders/${orderId}`}
      className="font-mono text-xs text-primary hover:underline"
    >
      #
      {number != null
        ? String(number).padStart(4, "0")
        : orderId.slice(-6).toUpperCase()}
    </Link>
  );

  const invoiceColumns: Column<InvoiceListItem>[] = [
    {
      header: t("fields.number"),
      className: "ps-6",
      render: (inv) => (
        <div className="space-y-0.5">
          <p className="font-mono text-sm font-bold text-foreground whitespace-nowrap">
            {inv.displayNumber}
          </p>
          {orderLink(inv.order, inv.invoiceNumber)}
        </div>
      ),
    },
    {
      header: t("fields.date"),
      render: (inv) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDate(inv.issuedAt, locale)}
        </span>
      ),
    },
    {
      header: t("fields.customer"),
      render: (inv) => (
        <div className="min-w-0 max-w-48">
          <p className="text-sm font-medium truncate">
            {inv.customer?.name || "—"}
          </p>
          {inv.customer?.vatNo && (
            <p
              className="text-[11px] text-muted-foreground font-mono"
              dir="ltr"
            >
              {inv.customer.vatNo}
            </p>
          )}
        </div>
      ),
    },
    {
      header: t("fields.total"),
      render: (inv) => (
        <div className="tabular-nums whitespace-nowrap">
          <p className="text-sm font-bold">
            {formatCurrency(inv.amounts?.grandTotal ?? 0)}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {t("fields.taxValue", {
              tax: formatCurrency(inv.amounts?.tax ?? 0),
            })}
          </p>
        </div>
      ),
    },
    {
      header: t("fields.credited"),
      render: (inv) =>
        inv.credited.count > 0 ? (
          <span className="text-xs text-destructive tabular-nums whitespace-nowrap">
            {t("fields.creditedValue", {
              count: inv.credited.count,
              total: formatCurrency(inv.credited.total),
            })}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      header: t("fields.status"),
      render: (inv) => (
        <div className="space-y-1">
          <Badge variant={inv.status === "generated" ? "success" : "warning"}>
            {t(`status.${inv.status}`)}
          </Badge>
          {inv.customerEmail && (
            <p className="text-[11px] text-muted-foreground whitespace-nowrap">
              {t(`email.${inv.customerEmail}`)}
            </p>
          )}
        </div>
      ),
    },
    {
      header: t("fields.actions"),
      className: "pe-6",
      render: (inv) => (
        <div className="flex items-center gap-1">
          {fileActions(
            inv.file,
            inv.displayNumber,
            can(Permissions.UPDATE_ORDER_STATUS)
              ? () => handleResend("invoice", inv.order)
              : undefined,
          )}
          {inv.status !== "generated" &&
            can(Permissions.UPDATE_ORDER_STATUS) &&
            regenerateButton(() => handleRegenerate(inv.order))}
          {inv.status === "generated" && (
            <Can permission={Permissions.REFUND_ORDER}>
              <Tooltip content={t("actions.issueCreditNote")}>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={t("actions.issueCreditNote")}
                  className="h-9 w-9 rounded-lg text-destructive hover:bg-destructive/10"
                  onClick={() => setCrediting(inv.order)}
                >
                  <RotateCcwIcon className="w-4 h-4" />
                </Button>
              </Tooltip>
            </Can>
          )}
        </div>
      ),
    },
  ];

  const creditNoteColumns: Column<CreditNoteListItem>[] = [
    {
      header: t("fields.number"),
      className: "ps-6",
      render: (note) => (
        <div className="space-y-0.5">
          <p className="font-mono text-sm font-bold text-foreground whitespace-nowrap">
            {note.displayNumber ?? t("status.awaiting_refund")}
          </p>
          <p className="text-[11px] text-muted-foreground font-mono whitespace-nowrap">
            {t("fields.ofInvoice", {
              number: note.invoice?.displayNumber ?? "—",
            })}
          </p>
        </div>
      ),
    },
    {
      header: t("fields.date"),
      render: (note) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {note.issuedAt ? formatDate(note.issuedAt, locale) : "—"}
        </span>
      ),
    },
    {
      header: t("fields.customer"),
      render: (note) => (
        <div className="min-w-0 max-w-48 space-y-0.5">
          <p className="text-sm font-medium truncate">
            {note.customer?.name || "—"}
          </p>
          {orderLink(note.order)}
        </div>
      ),
    },
    {
      header: t("fields.reason"),
      render: (note) => (
        <div className="max-w-56">
          <p className="text-xs font-semibold">
            {t(`reasonTypes.${note.reasonType ?? "defect"}`)}
          </p>
          {note.reason && (
            <p className="text-[11px] text-muted-foreground line-clamp-2">
              {note.reason}
            </p>
          )}
        </div>
      ),
    },
    {
      header: t("fields.total"),
      render: (note) => (
        <div className="tabular-nums whitespace-nowrap">
          <p className="text-sm font-bold">
            {formatCurrency(note.amounts.total)}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {t("fields.taxValue", { tax: formatCurrency(note.amounts.tax) })}
          </p>
        </div>
      ),
    },
    {
      header: t("fields.refund"),
      render: (note) => (
        <div className="tabular-nums whitespace-nowrap space-y-0.5">
          {note.refund && (
            <p className="text-xs">
              {formatCurrency(note.refund.amount)} ·{" "}
              <span className="text-muted-foreground">
                {t(`refundVia.${note.refund.via}`)}
              </span>
            </p>
          )}
          {!!note.deductions?.returnShipping?.total && (
            <p className="text-[11px] text-destructive">
              {t("fields.returnShippingValue", {
                amount: formatCurrency(note.deductions.returnShipping.total),
              })}
            </p>
          )}
        </div>
      ),
    },
    {
      header: t("fields.actions"),
      className: "pe-6",
      render: (note) => (
        <div className="flex items-center gap-1">
          {fileActions(
            note.file,
            note.displayNumber ?? "credit-note",
            can(Permissions.REFUND_ORDER)
              ? () => handleResend("credit-note", note._id)
              : undefined,
          )}
          {note.state === "issued" &&
            note.status === "failed" &&
            can(Permissions.REFUND_ORDER) &&
            regenerateButton(() => handleRegenerate(note.order, note._id))}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <EntityPageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        totalResults={tCommon("results.total", {
          count: list.data?.meta?.total || 0,
        })}
      />

      <InvoiceStatsCards
        stats={stats}
        isLoading={isStatsLoading}
        onShowFailed={() =>
          setQueryParams({
            tab:
              stats && stats.failed.invoices === 0
                ? "credit-notes"
                : "invoices",
            status: stats && stats.failed.invoices === 0 ? "" : "failed",
            page: 1,
          })
        }
      />

      <p className="text-xs text-muted-foreground">{t("immutableNote")}</p>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1" role="tablist">
          {(["invoices", "credit-notes"] as const).map((key) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => handleTab(key)}
              className={`cursor-pointer px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t(`tabs.${key}`)}
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          className="gap-2 rounded-xl"
          onClick={handleExport}
          disabled={isExporting}
        >
          <DownloadIcon className="w-4 h-4" />
          {isExporting ? t("exporting") : t("export")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 items-center">
        {tab === "invoices" ? (
          <Select
            aria-label={t("filters.status")}
            label={t("filters.allStatuses")}
            icon={FilterIcon}
            options={[
              { value: "generated", label: t("status.generated") },
              { value: "failed", label: t("status.failed") },
            ]}
            value={status}
            onChange={(e) =>
              setQueryParams({ status: e.target.value, page: 1 })
            }
          />
        ) : (
          <Select
            aria-label={t("filters.reason")}
            label={t("filters.allReasons")}
            icon={FilterIcon}
            options={[
              { value: "defect", label: t("reasonTypes.defect") },
              { value: "other", label: t("reasonTypes.other") },
            ]}
            value={reasonType}
            onChange={(e) =>
              setQueryParams({ reasonType: e.target.value, page: 1 })
            }
          />
        )}
        <div className="flex items-center gap-2">
          <DateRangeFilter
            onApply={handleDateApply}
            onReset={handleDateReset}
            isLoading={list.isFetching}
          />
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            className="justify-self-start"
            onClick={() =>
              setQueryParams({
                search: "",
                status: "",
                reasonType: "",
                from: "",
                to: "",
                page: 1,
              })
            }
          >
            {t("filters.reset")}
          </Button>
        )}
      </div>

      <EntitySearchBar
        placeholder={t("filters.searchPlaceholder")}
        onSearch={handleSearch}
        defaultValue={search}
        debounceMs={700}
      />

      {tab === "invoices" ? (
        <EntityDataTable<InvoiceListItem>
          data={invoices.data?.data || []}
          isLoading={invoices.isLoading}
          pagination={invoices.data?.meta?.pagination}
          onPageChange={(val) => setQueryParam("page", val)}
          columns={invoiceColumns}
          emptyState={{ title: t("empty.invoices") }}
        />
      ) : (
        <EntityDataTable<CreditNoteListItem>
          data={creditNotes.data?.data || []}
          isLoading={creditNotes.isLoading}
          pagination={creditNotes.data?.meta?.pagination}
          onPageChange={(val) => setQueryParam("page", val)}
          columns={creditNoteColumns}
          emptyState={{ title: t("empty.creditNotes") }}
        />
      )}

      <PdfViewerModal
        url={viewing?.url ?? null}
        title={viewing?.title}
        onClose={() => setViewing(null)}
      />
      <IssueCreditNoteDialog
        orderId={crediting}
        onClose={() => setCrediting(null)}
      />
    </div>
  );
}
