"use client";

import { useMemo, useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  useAdminReviews,
  useDeleteReview,
  useReviewStats,
  useUpdateReviewStatus,
} from "@/features/reviews/hooks/useReviews";
import ReplyReviewModal from "@/features/reviews/components/dashboard/ReplyReviewModal";
import ReviewStatsCards from "@/features/reviews/components/dashboard/ReviewStatsCards";
import { getReviewErrorMessage } from "@/features/reviews/utils";
import { Review, ReviewStatus, ReviewStats } from "@/features/reviews/types";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/Badge";
import { Tooltip } from "@/shared/ui/Tooltip";
import { Avatar } from "@/shared/ui/CustomAvatar";
import { RatingStars } from "@/shared/ui/RatingStars";
import EntityDataTable from "@/shared/ui/dashboard/EntityDataTable";
import EntityPageHeader from "@/shared/ui/dashboard/EntityPageHeader";
import EntitySearchBar from "@/shared/ui/dashboard/EntitySearchBar";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";
import {
  CheckIcon,
  MessageCircleIcon,
  ShieldCheckIcon,
  TrashIcon,
  XIcon,
} from "@/shared/ui/Icons";
import { useConfirmDialog } from "@/shared/hooks/useConfirmDialog";
import { useQueryState } from "@/shared/hooks/useQueryState";
import { useToast } from "@/shared/hooks/useToast";
import { useTrans } from "@/shared/hooks/useTrans";
import { Can } from "@/components/auth/Can";
import { Permissions } from "@/features/roles/types";
import { formatDate, formatEmail, truncate } from "@/lib/utils";

type ViewTab = ReviewStatus | "all";

const TABS: { key: ViewTab; activeClass: string }[] = [
  {
    key: "pending",
    activeClass: "bg-warning text-white shadow-md shadow-amber-500/20",
  },
  {
    key: "approved",
    activeClass: "bg-success text-white shadow-md shadow-green-500/20",
  },
  {
    key: "rejected",
    activeClass: "bg-destructive text-white shadow-md shadow-red-500/20",
  },
  {
    key: "all",
    activeClass: "bg-primary text-white shadow-md shadow-primary/20",
  },
];

const STATUS_VARIANT: Record<ReviewStatus, "warning" | "success" | "danger"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

const authorOf = (review: Review) =>
  typeof review.user === "object" && review.user
    ? {
        name: review.user.name,
        email: formatEmail(review.user.email),
        avatar:
          typeof review.user.avatar === "string"
            ? review.user.avatar
            : review.user.avatar?.url,
      }
    : { name: "-", email: undefined, avatar: undefined };

export default function ReviewsPage() {
  const locale = useLocale();
  const t = useTranslations("reviews.admin");
  const tCommon = useTranslations("common");
  const tButtons = useTranslations("buttons");
  const getTrans = useTrans();
  const { success: toastSuccess, error: toastError } = useToast();

  // State management via URL
  const { getQueryParam, setQueryParam, setQueryParams } = useQueryState();
  const page = Number(getQueryParam("page", "1"));
  const search = getQueryParam("search", "");
  const viewTab = getQueryParam("tab", "pending") as ViewTab;
  const verifiedOnly = getQueryParam<string>("verified", "") === "true";

  const queryParams = useMemo(
    () => ({
      page,
      limit: 10,
      keywords: search || undefined,
      ...(viewTab !== "all" && { status: viewTab }),
      ...(verifiedOnly && { isVerifiedPurchase: "true" }),
    }),
    [page, search, viewTab, verifiedOnly],
  );

  // Data fetching
  const { data, isLoading } = useAdminReviews(queryParams);
  const { data: stats, isLoading: isStatsLoading } = useReviewStats();

  const {
    mutateAsync: updateStatusAsync,
    isPending: statusPending,
    variables: statusVars,
  } = useUpdateReviewStatus();
  const { mutateAsync: deleteReviewAsync } = useDeleteReview();

  const [replyTarget, setReplyTarget] = useState<Review | null>(null);
  const {
    openDialog,
    closeDialog,
    handleConfirm,
    isOpen: isConfirmOpen,
    isLoading: isConfirmLoading,
    title: confirmTitle,
    message: confirmMessage,
  } = useConfirmDialog();

  // Handlers
  const handlePageChange = useCallback(
    (val: number) => setQueryParam("page", val),
    [setQueryParam],
  );
  const handleTabChange = useCallback(
    (val: ViewTab) => setQueryParams({ tab: val, page: 1 }),
    [setQueryParams],
  );
  const handleSearch = useCallback(
    (value: string) => setQueryParams({ search: value, page: 1 }),
    [setQueryParams],
  );
  const toggleVerified = useCallback(
    () => setQueryParams({ verified: verifiedOnly ? "" : "true", page: 1 }),
    [setQueryParams, verifiedOnly],
  );

  const handleStatus = useCallback(
    async (review: Review, status: "approved" | "rejected") => {
      try {
        await updateStatusAsync({ id: review._id, status });
        toastSuccess(
          t(status === "approved" ? "messages.approved" : "messages.rejected"),
        );
      } catch (error) {
        toastError(getReviewErrorMessage(error, t("messages.error")));
      }
    },
    [updateStatusAsync, toastSuccess, toastError, t],
  );

  const handleDelete = useCallback(
    (review: Review) => {
      openDialog({
        title: t("messages.deleteConfirm"),
        message: t("messages.deleteConfirmMessage", {
          name: authorOf(review).name,
        }),
        onConfirm: async () => {
          try {
            await deleteReviewAsync(review._id);
            toastSuccess(t("messages.deleted"));
          } catch (error) {
            toastError(getReviewErrorMessage(error, t("messages.error")));
          }
        },
      });
    },
    [openDialog, deleteReviewAsync, toastSuccess, toastError, t],
  );

  const isRowBusy = useCallback(
    (review: Review) => statusPending && statusVars?.id === review._id,
    [statusPending, statusVars],
  );

  const columns = useMemo(
    () => [
      {
        header: t("fields.customer"),
        className: "ps-6",
        render: (review: Review) => {
          const author = authorOf(review);
          return (
            <div className="flex items-center gap-3 min-w-45">
              <Avatar
                src={author.avatar}
                alt={author.name}
                fallback={author.name.charAt(0) || "?"}
                size="sm"
              />
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-bold text-sm truncate">
                  {author.name}
                </span>
                {author.email && (
                  <span className="text-[11px] text-muted-foreground truncate">
                    {author.email}
                  </span>
                )}
                {review.isVerifiedPurchase && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-success">
                    <ShieldCheckIcon className="w-3 h-3" />
                    {t("verified")}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        header: t("fields.product"),
        render: (review: Review) => {
          if (typeof review.product !== "object" || !review.product) {
            return <span className="text-muted-foreground">-</span>;
          }
          const product = review.product;
          const title = getTrans(product.title);
          // Off-store products: no link (the store page would 404) + a flag
          const offStoreBadge = product.isDeleted
            ? { label: t("productDeleted"), variant: "danger" as const }
            : product.isActive === false
              ? { label: t("productInactive"), variant: "secondary" as const }
              : null;

          return (
            <div className="flex flex-col items-start gap-1">
              {offStoreBadge ? (
                <span className="text-sm font-medium text-muted-foreground" title={title}>
                  {truncate(title, 28)}
                </span>
              ) : (
                <a
                  href={`/${locale}/products/${product.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:text-primary transition-colors"
                  title={title}
                >
                  {truncate(title, 28)}
                </a>
              )}
              {offStoreBadge && (
                <Badge variant={offStoreBadge.variant} className="text-[10px]">
                  {offStoreBadge.label}
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        header: t("fields.rating"),
        render: (review: Review) => (
          <RatingStars rating={review.rating} starClassName="w-3.5 h-3.5" />
        ),
      },
      {
        header: t("fields.comment"),
        render: (review: Review) => (
          <div className="flex flex-col gap-1 max-w-65">
            <span className="text-sm text-foreground/80 wrap-break-word ">
              {truncate(review.comment, 70)}
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {review.editedAt && (
                <span className="text-[10px] text-muted-foreground">
                  {t("edited")}
                </span>
              )}
              {review.adminReply && (
                <Badge variant="info" className="text-[10px]">
                  {t("replied")}
                </Badge>
              )}
            </div>
          </div>
        ),
      },
      {
        header: t("fields.status"),
        render: (review: Review) => (
          <Badge variant={STATUS_VARIANT[review.status]}>
            {t(`status.${review.status}`)}
          </Badge>
        ),
      },
      {
        header: t("fields.date"),
        render: (review: Review) => (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDate(review.createdAt, locale)}
          </span>
        ),
      },
      {
        header: t("fields.actions"),
        className: "pe-6 text-center",
        render: (review: Review) => (
          <div className="flex justify-center gap-1.5">
            <Can permission={Permissions.MANAGE_REVIEWS}>
              {review.status !== "approved" && (
                <Tooltip content={t("actions.approve")}>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={t("actions.approve")}
                    className="h-10 w-10 rounded-lg hover:bg-success/10 text-success"
                    onClick={() => handleStatus(review, "approved")}
                    disabled={isRowBusy(review)}
                  >
                    <CheckIcon className="w-4 h-4" />
                  </Button>
                </Tooltip>
              )}
              {review.status !== "rejected" && (
                <Tooltip content={t("actions.reject")}>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={t("actions.reject")}
                    className="h-10 w-10 rounded-lg hover:bg-warning/10 text-warning"
                    onClick={() => handleStatus(review, "rejected")}
                    disabled={isRowBusy(review)}
                  >
                    <XIcon className="w-4 h-4" />
                  </Button>
                </Tooltip>
              )}
              {!review.adminReply && (
                <Tooltip content={t("actions.reply")}>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={t("actions.reply")}
                    className="h-10 w-10 rounded-lg hover:bg-primary/10 text-primary"
                    onClick={() => setReplyTarget(review)}
                  >
                    <MessageCircleIcon className="w-4 h-4" />
                  </Button>
                </Tooltip>
              )}
            </Can>
            <Can permission={Permissions.DELETE_REVIEW}>
              <Tooltip content={t("actions.delete")}>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={t("actions.delete")}
                  className="h-10 w-10 rounded-lg hover:bg-destructive/10 text-destructive"
                  onClick={() => handleDelete(review)}
                  disabled={isRowBusy(review)}
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </Tooltip>
            </Can>
          </div>
        ),
      },
    ],
    [t, locale, getTrans, handleStatus, handleDelete, isRowBusy],
  );

  const expandableContent = useCallback(
    (review: Review) => (
      <div className="space-y-3 ">
        <div className="p-2 border border-muted-foreground/5 bg-accent rounded-xl">
          <p className="text-xs font-bold text-muted-foreground mb-2">
            {t("fullComment")} :
          </p>
          <p className="text-sm whitespace-pre-line wrap-break-word">
            {review.comment}
          </p>
        </div>
        {review.adminReply && (
          <div className="rounded-xl border border-primary/5 bg-primary/5 p-3">
            <p className="text-xs font-bold text-primary mb-1">
              {t("adminReply")} ·{" "}
              {formatDate(review.adminReply.repliedAt, locale)}
            </p>
            <p className="text-sm whitespace-pre-line wrap-break-word">
              {review.adminReply.text}
            </p>
          </div>
        )}
      </div>
    ),
    [t, locale],
  );

  const countFor = (key: ViewTab) =>
    stats
      ? stats[key === "all" ? "total" : (key as keyof ReviewStats)]
      : undefined;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <EntityPageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        totalResults={tCommon("results.total", {
          count: data?.meta?.pagination?.totalResults || 0,
        })}
      />

      <ReviewStatsCards stats={stats} isLoading={isStatsLoading} />

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-1 flex-wrap">
          {TABS.map((tab) => {
            const count = countFor(tab.key);
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                disabled={isLoading}
                className={`cursor-pointer px-5 py-2 rounded-xl text-xs font-bold transition-all ${viewTab === tab.key ? tab.activeClass : "bg-muted/50 text-muted-foreground hover:bg-muted/80"}`}
              >
                {t(`tabs.${tab.key}`)}
                {count !== undefined && (
                  <span className="ms-1.5 opacity-80">({count})</span>
                )}
              </button>
            );
          })}
        </div>
        <button
          onClick={toggleVerified}
          disabled={isLoading}
          aria-pressed={verifiedOnly}
          className={`cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${verifiedOnly ? "bg-success/15 text-success ring-1 ring-success/30" : "bg-muted/60 text-muted-foreground hover:bg-muted/80"}`}
        >
          <ShieldCheckIcon className="w-4 h-4" />
          {t("verifiedOnly")}
        </button>
      </div>

      <EntitySearchBar
        placeholder={t("searchPlaceholder")}
        onSearch={handleSearch}
        defaultValue={search}
        debounceMs={700}
        disabled={isLoading}
      />

      <EntityDataTable<Review>
        data={data?.data || []}
        isLoading={isLoading}
        pagination={data?.meta?.pagination}
        onPageChange={handlePageChange}
        columns={columns}
        expandableContent={expandableContent}
        emptyState={{
          title: t("emptyState.title"),
          description: t("emptyState.description"),
        }}
      />

      <ReplyReviewModal
        key={replyTarget?._id ?? "none"}
        review={replyTarget}
        onClose={() => setReplyTarget(null)}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        title={confirmTitle}
        message={confirmMessage}
        confirmText={tButtons("confirm")}
        cancelText={tButtons("cancel")}
        isDangerous={true}
        isLoading={isConfirmLoading}
      />
    </div>
  );
}
