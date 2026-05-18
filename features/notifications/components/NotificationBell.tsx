"use client";

import { memo } from "react";
import { useNotificationStore } from "@/store/notification-store";
import { Icons } from "@/shared/ui/Icons";
import { Button } from "@/shared/ui/Button";
import { Dropdown } from "@/shared/ui/CustomDropdown";
import { useTranslations } from "next-intl";
import { formatDate } from "@/lib/utils";
import { useMarkAsRead } from "@/features/notifications/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { useRouter } from "@/navigation";
import { useMe } from "@/features/auth/hooks/useAuth";
import { checkUserPermission } from "@/lib/auth";
import { Permissions } from "@/features/roles/types";

const NotificationBell = () => {
  const t = useTranslations("notifications");
  const router = useRouter();
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const notifications = useNotificationStore((state) => state.notifications);
  const { data: user } = useMe();

  const { mutate: markAsRead } = useMarkAsRead();

  // Admins go to admin dashboard, regular users go to their own notifications page
  const isAdmin = checkUserPermission(user ?? null, Permissions.UPDATE_SETTINGS);
  const notificationsPath = isAdmin ? "/dashboard/notifications" : "/account/notifications";

  const handleNotificationClick = (id: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead(id);
    }
    router.push(notificationsPath);
  };

  const handleViewAll = () => {
    router.push(notificationsPath);
  };

  const triggerBtn = (
    <div
      className="relative p-2 rounded-lg cursor-pointer hover:bg-muted/60 transition-colors text-foreground hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      aria-label={t("title")}
    >
      <Icons.Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground ring-2 ring-background">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </div>
  );

  return (
    <Dropdown trigger={triggerBtn} width="w-80" className="p-0 border-border/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-card">
        <span className="font-semibold">{t("title")}</span>
        {unreadCount > 0 && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {unreadCount} {t("unread")}
          </span>
        )}
      </div>

      <div className="max-h-[300px] overflow-y-auto bg-card">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <Icons.Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">
              {t("empty")}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {t("emptyDesc")}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.slice(0, 5).map((notification) => (
              <button
                key={notification._id}
                className={cn(
                  "flex flex-col items-start p-4 text-left border-b border-border/40 transition-colors hover:bg-muted/30",
                  !notification.isRead && "bg-primary/5",
                )}
                onClick={() =>
                  handleNotificationClick(
                    notification._id,
                    notification.isRead,
                  )
                }
              >
                <div className="flex items-start justify-between w-full mb-1">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      !notification.isRead
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {notification.action}
                  </span>
                  {!notification.isRead && (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </div>
                <p
                  className={cn(
                    "text-xs line-clamp-2",
                    !notification.isRead
                      ? "text-foreground/80"
                      : "text-muted-foreground",
                  )}
                >
                  {notification.message}
                </p>
                <span className="text-[10px] text-muted-foreground mt-2">
                  {formatDate(notification.createdAt)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-2 border-t border-border/40 bg-card">
        <Button
          variant="ghost"
          className="w-full text-xs h-8 text-primary hover:text-primary/80"
          onClick={handleViewAll}
        >
          {t("viewAll")}
        </Button>
      </div>
    </Dropdown>
  );
};

export default memo(NotificationBell);
