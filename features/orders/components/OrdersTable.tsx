"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/Table";
import { Badge } from "@/shared/ui/Badge";
import { Skeleton } from "@/shared/ui/Skeleton";
import { Tooltip } from "@/shared/ui/Tooltip";
import { Checkbox } from "@/shared/ui/Checkbox";
import ImageWithFallback from "@/shared/ui/image/ImageWithFallback";
import { Order } from "@/types";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import {
  EyeIcon,
  TrashIcon,
  FileTextIcon,
  DownloadIcon,
  ChevronDownIcon,
  EditIcon,
} from "@/shared/ui/Icons";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

// ─── Status color maps ──────────────────────────────────────────────────────────

const ORDER_STATUS_STYLES: Record<string, string> = {
  pending_payment: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  pending: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  processing: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  shipped: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  delivered: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  cancelled: "bg-red-500/10 text-red-600 dark:text-red-400",
  expired: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  INITIATED: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  PAID: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  FAILED: "bg-red-500/10 text-red-600 dark:text-red-400",
  CANCELLED: "bg-red-500/10 text-red-600 dark:text-red-400",
  REFUNDED: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  EXPIRED: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
};

// ─── Props ──────────────────────────────────────────────────────────────────────

interface OrdersTableProps {
  data?: Order[];
  isLoading: boolean;
  isSelected: (id: string) => boolean;
  isAllSelected: boolean;
  onToggleOne: (id: string) => void;
  onToggleAll: () => void;
  onViewOrder: (order: Order) => void;
  onDeleteOrder: (id: string) => void;
  onPreviewInvoice: (order: Order) => void;
  sortField: string;
  sortDirection: string;
  onSort: (field: string, direction: string) => void;
}

// ─── Sortable Header ────────────────────────────────────────────────────────────

function SortableHeader({
  label,
  field,
  currentField,
  currentDir,
  onSort,
  className,
}: {
  label: string;
  field: string;
  currentField: string;
  currentDir: string;
  onSort: (f: string, d: string) => void;
  className?: string;
}) {
  const isActive = currentField === field;
  return (
    <TableHead
      className={cn(
        "cursor-pointer select-none hover:text-foreground transition-colors group/sort",
        className,
      )}
      onClick={() => {
        if (isActive) {
          onSort(field, currentDir === "asc" ? "desc" : "asc");
        } else {
          onSort(field, "desc");
        }
      }}
    >
      <div className="flex items-center gap-1">
        {label}
        <ChevronDownIcon
          className={cn(
            "w-3 h-3 transition-all opacity-0 group-hover/sort:opacity-60",
            isActive && "opacity-100",
            isActive && currentDir === "asc" && "rotate-180",
          )}
        />
      </div>
    </TableHead>
  );
}

// ─── Actions Dropdown ───────────────────────────────────────────────────────────

function ActionsDropdown({
  onView,
  onDelete,
  onPreviewInvoice,
  orderId,
}: {
  onView: () => void;
  onDelete: () => void;
  onPreviewInvoice: () => void;
  orderId: string;
}) {
  const t = useTranslations("orders");
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen) {
      setIsOpen(false);
    } else {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        const isRtl =
          typeof document !== "undefined" &&
          document.documentElement.dir === "rtl";
        const menuWidth = 192; // w-48 is 192px
        const leftPos = isRtl
          ? rect.left + window.scrollX
          : rect.right + window.scrollX - menuWidth;

        setCoords({
          top: rect.bottom + window.scrollY + 4,
          left: leftPos,
        });
        setIsOpen(true);
      }
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        buttonRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted/60 transition-colors"
      >
        <svg
          className="w-4 h-4 text-muted-foreground"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "absolute",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
            }}
            className="z-50 w-48 py-1.5 bg-popover border border-border rounded-xl shadow-xl animate-in fade-in zoom-in-95 duration-200"
          >
            <Link
              href={`/dashboard/orders/${orderId}`}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground hover:bg-muted/60 transition-colors text-start"
            >
              <EditIcon className="w-4 h-4 text-muted-foreground" />
              {t("manageOrder")}
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView();
                setIsOpen(false);
              }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground hover:bg-muted/60 transition-colors text-start"
            >
              <EyeIcon className="w-4 h-4 text-muted-foreground" /> {t("actions.viewDetails")}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreviewInvoice();
                setIsOpen(false);
              }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground hover:bg-muted/60 transition-colors text-start"
            >
              <FileTextIcon className="w-4 h-4 text-muted-foreground" /> {t("viewInvoice")}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground hover:bg-muted/60 transition-colors text-start"
            >
              <DownloadIcon className="w-4 h-4 text-muted-foreground" /> {t("downloadInvoice")}
            </button>
            <div className="border-t border-border/50 my-1" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                setIsOpen(false);
              }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors text-start"
            >
              <TrashIcon className="w-4 h-4" /> {t("actions.delete")}
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function OrdersTable({
  data,
  isLoading,
  isSelected,
  isAllSelected,
  onToggleOne,
  onToggleAll,
  onViewOrder,
  onDeleteOrder,
  onPreviewInvoice,
  sortField,
  sortDirection,
  onSort,
}: OrdersTableProps) {
  const formatCurrency = useFormatCurrency();
  const t = useTranslations("orders");
  const locale = useLocale();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
        <Table className="border-none shadow-none rounded-none">
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-b border-border/40">
              {Array.from({ length: 8 }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-full rounded" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={i} className="border-b border-border/20 h-16">
                {Array.from({ length: 8 }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton
                      className={cn("h-5 rounded", j === 0 ? "w-5" : "w-full")}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-border/40 bg-card flex flex-col items-center justify-center py-20 px-6">
        <div className="p-4 rounded-2xl bg-muted/30 ring-1 ring-border/20 mb-4">
          <svg
            className="w-10 h-10 text-muted-foreground/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <p className="text-lg font-bold text-foreground mb-1">
          {t("noOrders")}
        </p>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Your shop&apos;s sales journey starts here. Adjust your filters or
          promote your products to get sales!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm ">
      <div className="overflow-x-auto">
        <Table className="border-none shadow-none rounded-none ">
          <TableHeader className="bg-muted/30 border-b border-border/40 sticky top-0 z-10 ">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-12 ps-4">
                <Checkbox
                  checked={isAllSelected}
                  onChange={onToggleAll}
                  ref={undefined}
                />
              </TableHead>
              <TableHead>{t("orderNumber")}</TableHead>
              <TableHead>{t("fields.customer")}</TableHead>
              <SortableHeader
                label={t("fields.status")}
                field="status"
                currentField={sortField}
                currentDir={sortDirection}
                onSort={onSort}
              />
              <TableHead>{t("paymentStatusLabel")}</TableHead>
              {/* <TableHead>Method</TableHead> */}
              <TableHead className="hidden xl:table-cell">{t("qty")}</TableHead>
              {/* <TableHead className="hidden lg:table-cell">Subtotal</TableHead> */}
              <TableHead className="hidden xl:table-cell">{t("shipping")}</TableHead>
              <TableHead className="hidden xl:table-cell">{t("discount")}</TableHead>
              <SortableHeader
                label={t("fields.total")}
                field="grandTotal"
                currentField={sortField}
                currentDir={sortDirection}
                onSort={onSort}
              />
              <SortableHeader
                label={t("fields.date")}
                field="createdAt"
                currentField={sortField}
                currentDir={sortDirection}
                onSort={onSort}
              />
              <TableHead className="text-end pe-4">{t("actions.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((order, idx) => (
              <TableRow
                key={order._id}
                className={cn(
                  "group cursor-pointer hover:bg-muted/40 transition-all duration-200 border-b border-border/20 last:border-0 h-16",
                  isSelected(order._id) && "bg-primary/5",
                )}
                onClick={() => onViewOrder(order)}
              >
                {/* Checkbox */}
                <TableCell
                  className="ps-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={isSelected(order._id)}
                    onChange={() => onToggleOne(order._id)}
                  />
                </TableCell>

                {/* Order ID */}
                <TableCell>
                  <span className="font-mono font-bold text-xs text-foreground bg-muted/40 px-2 py-1 rounded-md">
                    #{order._id?.slice(-8).toUpperCase()}
                  </span>
                </TableCell>

                {/* Customer */}
                <TableCell>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-full shrink-0 overflow-hidden relative bg-muted/30">
                      <ImageWithFallback
                        src={order.user?.avatar || ""}
                        alt={order.user?.name || "Guest"}
                        fill
                        sizes="32px"
                        loading={idx < 5 ? "eager" : "lazy"}
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate max-w-[140px]">
                        {order.user?.name || "Guest"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                        {order.user?.email || ""}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge
                    className={cn(
                      "rounded-full px-2.5 py-0.5 font-semibold text-[10px] uppercase tracking-wider border-none",
                      ORDER_STATUS_STYLES[order.status] ||
                        "bg-muted text-muted-foreground",
                    )}
                  >
                    {order.status ? t(`status.${order.status}`) : "—"}
                  </Badge>
                </TableCell>

                {/* Payment Status */}
                <TableCell>
                  <Badge
                    className={cn(
                      "rounded-full px-2.5 py-0.5 font-semibold text-[10px] uppercase tracking-wider border-none",
                      PAYMENT_STATUS_STYLES[order.paymentStatus || ""] ||
                        "bg-muted text-muted-foreground",
                    )}
                  >
                    {order.paymentStatus ? t(`paymentStatus.${order.paymentStatus.toUpperCase()}`, { defaultValue: order.paymentStatus }) : "—"}
                  </Badge>
                </TableCell>

                {/* Payment Method 
                <TableCell>
                  <span className="text-xs font-medium text-muted-foreground capitalize">
                    {order.paymentMethodCode || order.paymentMethod || '—'}
                  </span>
                </TableCell>*/}

                {/* Quantity */}
                <TableCell className="hidden xl:table-cell">
                  <span className="text-sm font-medium tabular-nums">
                    {order.totalQuantity ?? order.items?.length ?? 0}
                  </span>
                </TableCell>

                {/* Subtotal 
                <TableCell className="hidden lg:table-cell">
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {formatCurrency(order.totalPrice || 0)}
                  </span>
                </TableCell>*/}

                {/* Shipping */}
                <TableCell className="hidden xl:table-cell">
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {formatCurrency(order.shippingAmount || 0)}
                  </span>
                </TableCell>

                {/* Discount */}
                <TableCell className="hidden xl:table-cell">
                  {(order.discountAmount || 0) > 0 ? (
                    <span className="text-sm tabular-nums text-red-500 dark:text-red-400">
                      -{formatCurrency(order.discountAmount || 0)}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground/50">—</span>
                  )}
                </TableCell>

                {/* Grand Total */}
                <TableCell>
                  <span className="text-sm font-bold tabular-nums text-foreground">
                    {formatCurrency(order.grandTotal || order.totalPrice || 0)}
                  </span>
                </TableCell>

                {/* Date */}
                <TableCell>
                  <Tooltip content={formatDate(order.createdAt)}>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatRelativeTime(order.createdAt, locale === "ar" ? "ar" : "en-US")}
                    </span>
                  </Tooltip>
                </TableCell>

                {/* Actions */}
                <TableCell
                  className="text-end pe-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-end">
                    <ActionsDropdown
                      onView={() => onViewOrder(order)}
                      onDelete={() => onDeleteOrder(order._id)}
                      onPreviewInvoice={() => onPreviewInvoice(order)}
                      orderId={order._id}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
