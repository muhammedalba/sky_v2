"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  useGetAdminNotifications,
  useAdminDeleteNotification,
} from "@/features/notifications/hooks/useNotifications";
import EntityDataTable from "@/shared/ui/dashboard/EntityDataTable";
import { BellIcon, SendIcon, TrashIcon } from "@/shared/ui/Icons";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Tooltip } from "@/shared/ui/Tooltip";
import EntityPageHeader from "@/shared/ui/dashboard/EntityPageHeader";
import { useConfirmDialog } from "@/shared/hooks/useConfirmDialog";
import {
  formatEmail,
  formatRelativeTime,
  getActionBadgeVariant,
  getRoleBadgeVariant,
} from "@/lib/utils";
import {
  Notification,
  NotificationRecipient,
} from "@/features/notifications/api";
import { useMemo, useCallback } from "react";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";
import { Can } from "@/components/auth/Can";
import { Permissions } from "@/features/roles/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/shared/hooks/useToast";
import { AxiosError } from "axios";

export default function AdminNotificationsPage() {
  const t = useTranslations("notifications");
  const tButtons = useTranslations("common.buttons");
  const tMessages = useTranslations("common.messages");
  const tUsers = useTranslations("users");
  const router = useRouter();
  const locale = useLocale();
  const toast = useToast();
  // Use the admin-specific endpoint that returns ALL system notifications (not just current user's)
  const { data: response, isLoading } = useGetAdminNotifications(1, 100);
  const deleteMutation = useAdminDeleteNotification();
  const {
    openDialog,
    closeDialog,
    handleConfirm,
    isOpen: isConfirmOpen,
    isLoading: isConfirmLoading,
    title: confirmTitle,
    message: confirmMessage,
  } = useConfirmDialog();

  const handleDelete = useCallback(
    (id: string) => {
      openDialog({
        title: t("admin.globalDelete"),
        message: t("admin.globalDeleteConfirm"),
        onConfirm: async () => {
          try {
            const data = await deleteMutation.mutateAsync(id);
            toast.success(data.message || "Notification deleted globally");
          } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            toast.error(
              err?.response?.data?.message || "Failed to delete notification",
            );
          }
        },
      });
    },
    [openDialog, deleteMutation, t, toast],
  );

  const columns = useMemo(
    () => [
      {
        header: t("columns.type"),
        className: "pl-6 ",
        render: (item: Notification) => {
          let variant: "default" | "warning" | "secondary" | "success" =
            "default";
          let label = t("admin.typeDirect");
          if (item.type.toString().toUpperCase() === "BROADCAST") {
            variant = "secondary";
            label = t("admin.typeBroadcast");
          } else if (item.type.toString().toUpperCase() === "ROLE") {
            variant = "warning";
            label = t("admin.typeRole");
          }
          return (
            <Badge className="bg-transparent" variant={variant}>
              {label}
            </Badge>
          );
        },
      },
      {
        header: t("columns.action"),
        render: (item: Notification) => (
          <Badge variant={getActionBadgeVariant(item.action)}>
            {item.action}
          </Badge>
        ),
      },
      {
        header: t("columns.message"),
        render: (item: Notification) => (
          <span
            className="text-sm font-medium line-clamp-2"
            title={item.message}
          >
            {item.message}
          </span>
        ),
      },
      {
        header: t("columns.recipient"),
        render: (item: Notification) => {
          if (item.type === "BROADCAST") {
            return <span className="text-sm text-muted-foreground">—</span>;
          }
          if (item.type === "ROLE") {
            if (!item.targetRole) {
              return <span className="text-sm text-muted-foreground">N/A</span>;
            }
            if (typeof item.targetRole === "object") {
              const roleName = item.targetRole.name;
              return (
                <Badge
                  className="bg-transparent"
                  variant={getRoleBadgeVariant(item.targetRole?.level || 0)}
                >
                  {tUsers.has(`roles.${roleName.toLowerCase()}`)
                    ? tUsers(`roles.${roleName.toLowerCase()}`)
                    : roleName}
                </Badge>
              );
            }
            return (
              <span className="text-sm text-muted-foreground">
                {String(item.targetRole)}
              </span>
            );
          }
          if (!item.recipient) {
            return <span className="text-sm text-muted-foreground">N/A</span>;
          }
          if (typeof item.recipient === "object") {
            const r = item.recipient as NotificationRecipient & {
              slug?: string;
            };
            const displayEmail = formatEmail(r.email) || r._id;
            return (
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {r.name || r.slug || t("admin.unknownUser")}
                </span>
                {displayEmail && (
                  <span className="text-xs text-muted-foreground">
                    {displayEmail}
                  </span>
                )}
              </div>
            );
          }
          return (
            <span className="text-sm text-muted-foreground">
              {String(item.recipient)}
            </span>
          );
        },
      },
      {
        header: t("columns.date"),
        render: (item: Notification) => (
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(item.createdAt, locale)}
          </span>
        ),
      },
      {
        header: t("columns.actions"),
        className: "text-right pr-6",
        render: (item: Notification) => (
          <div className="flex items-center justify-end gap-2">
            <Can permission={Permissions.DELETE_NOTIFICATION}>
              <Tooltip content={tButtons("delete")}>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDelete(item._id)}
                >
                  <TrashIcon className="h-4 w-4 text-destructive" />
                </Button>
              </Tooltip>
            </Can>
          </div>
        ),
      },
    ],
    [handleDelete, t, tButtons, tUsers, locale],
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <EntityPageHeader
        title={t("admin.title")}
        subtitle={t("admin.list")}
        totalResults={tMessages("showingResults", {
          count: response?.data?.length || 0,
        })}
        action={{
          label: t("admin.sendTitle"),
          icon: <SendIcon className="w-4 h-4" />,
          onClick: () => router.push("/dashboard/notifications/send"),
          permission: Permissions.SEND_NOTIFICATION,
        }}
      />

      <EntityDataTable<Notification>
        data={response?.data || []}
        isLoading={isLoading}
        columns={columns}
        emptyState={{
          title: t("empty"),
          description: t("emptyDesc"),
          icon: <BellIcon className="h-10 w-10 text-muted-foreground/40" />,
        }}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        title={confirmTitle}
        message={confirmMessage}
        confirmText={tButtons("delete")}
        cancelText={tButtons("cancel")}
        isLoading={isConfirmLoading}
      />
    </div>
  );
}
