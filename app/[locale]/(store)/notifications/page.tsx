"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import {
  useGetNotifications,
  useDeleteNotification,
  useMarkAsRead,
} from "@/features/notifications/hooks/useNotifications";
import { Icons } from "@/shared/ui/Icons";
import { Badge } from "@/shared/ui/Badge";
import { formatDate, getActionBadgeVariant } from "@/lib/utils";
import { Notification } from "@/features/notifications/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Button } from "@/shared/ui/Button";

type TabType = "all" | "unread" | "read";

// ─── helpers ──────────────────────────────────────────────────────────────────

function getNotificationMeta(notification: Notification) {
  const action = notification.action?.toUpperCase() || "";
  const type = notification.type;

  if (action.includes("ORDER"))
    return {
      icon: Icons.ShoppingBag,
      bg: "bg-primary/15",
      text: "text-primary",
      ring: "ring-primary/20",
      dot: "bg-primary",
    };
  if (
    action.includes("PROMO") ||
    action.includes("COUPON") ||
    action.includes("DISCOUNT") ||
    action.includes("OFFER")
  )
    return {
      icon: Icons.Coupons,
      bg: "bg-success/15",
      text: "text-success",
      ring: "ring-success/20",
      dot: "bg-success",
    };
  if (
    action.includes("WARN") ||
    action.includes("ALERT") ||
    action.includes("FAIL")
  )
    return {
      icon: Icons.Warning,
      bg: "bg-destructive",
      text: "text-white",
      ring: "ring-destructive",
      dot: "bg-destructive",
    };
  if (type === "ROLE")
    return {
      icon: Icons.Shield,
      bg: "bg-violet-500/15",
      text: "text-violet-600",
      ring: "ring-violet-500/20",
      dot: "bg-violet-500",
    };
  if (
    type === "BROADCAST" ||
    action.includes("SYSTEM") ||
    action.includes("ANNOUNCE")
  )
    return {
      icon: Icons.AiSpark,
      bg: "bg-primary/10 ",
      text: "text-primary",
      ring: "ring-primary/20",
      dot: "bg-primary",
    };
  return {
    icon: Icons.Bell,
    bg: "bg-primary/10",
    text: "text-primary",
    ring: "ring-primary/20",
    dot: "bg-primary",
  };
}

function groupByDate(
  items: Notification[],
  labels: { today: string; yesterday: string; earlier: string },
) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const groups: Record<string, Notification[]> = {
    [labels.today]: [],
    [labels.yesterday]: [],
    [labels.earlier]: [],
  };
  items.forEach((n) => {
    const d = new Date(n.createdAt);
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (day >= today) groups[labels.today].push(n);
    else if (day >= yesterday) groups[labels.yesterday].push(n);
    else groups[labels.earlier].push(n);
  });
  return Object.entries(groups).filter(([, g]) => g.length > 0);
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex items-start gap-3.5 px-5 py-4 animate-pulse border-b border-border/40 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-muted/65 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-2 pt-0.5">
        <div className="h-3 w-32 bg-muted/60 rounded" />
        <div className="h-3 w-full bg-muted/50 rounded" />
        <div className="h-3 w-2/5 bg-muted/40 rounded" />
      </div>
    </div>
  );
}

// ─── Notification Card ────────────────────────────────────────────────────────

function NotificationCard({
  notification,
  onMarkRead,
  onDelete,
  tButtons,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  tButtons: ReturnType<typeof useTranslations>;
  t: ReturnType<typeof useTranslations>;
}) {
  const meta = getNotificationMeta(notification);
  const IconComponent = meta.icon;
  const isUnread = !notification.isRead;

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3.5 px-5 py-4 transition-all duration-200 cursor-default border-b border-border/40 last:border-0",
        isUnread ? "bg-primary/10 hover:bg-primary/15 " : "hover:bg-muted/30 ",
      )}
    >
      {isUnread && (
        <span className="absolute inset-y-0 ltr:left-0 rtl:right-0 w-[3px] rounded-full bg-primary" />
      )}
      <div
        className={cn(
          "mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ring-1 transition-transform duration-200 group-hover:scale-105",
          meta.bg,
          meta.ring,
        )}
      >
        <IconComponent className={cn("w-4 h-4", meta.text)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          {notification.action && (
            <Badge
              variant={getActionBadgeVariant(notification.action)}
              className="font-mono text-[10px] px-1.5 py-0 h-4 rounded"
            >
              {notification.action}
            </Badge>
          )}
          {isUnread && (
            <span
              className={cn(
                "inline-flex w-1.5 h-1.5 rounded-full shrink-0",
                meta.dot,
              )}
            />
          )}
        </div>
        <p
          className={cn(
            "text-[13px] leading-relaxed",
            isUnread
              ? "text-foreground font-medium"
              : "text-muted-foreground/80",
          )}
        >
          {notification.message}
        </p>
        <p className="flex items-center gap-1.5 mt-1.5 text-[11px] text-muted-foreground/50 font-medium">
          <Icons.Clock className="w-3 h-3" />
          {formatDate(notification.createdAt)}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0 mt-0.5  group-hover:opacity-102 transition-opacity duration-150">
        {isUnread && (
          <button
            onClick={() => onMarkRead(notification._id)}
            title={tButtons("markRead")}
            className="h-7 w-7 flex items-center justify-center rounded-lg text-success hover:text-success hover:bg-success/10 transition-all"
          >
            <Icons.Check className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={() => onDelete(notification._id)}
          title={tButtons("delete")}
          className="h-7 w-7 flex items-center justify-center rounded-lg text-destructive hover:text-destructive/80 hover:bg-destructive/10 transition-all"
        >
          <Icons.Trash className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────

function SideNavItem({
  href,
  icon: Icon,
  label,
  active,
  badge,
  disabled,
  iconClassname,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  badge?: number;
  disabled?: boolean;
  iconClassname?: string;
}) {
  return (
    <Link
      href={disabled ? "#" : href}
      className={cn(
        "group flex items-center gap-3 px-3 py-3 mt-1 rounded-xl text-[13px] font-medium transition-all duration-150",
        active
          ? "bg-secondary text-secondary-foreground font-semibold"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
      )}
    >
      <Icon
        className={cn(
          iconClassname,
          "w-4 h-4 shrink-0",
          active ? "text-primary" : " group-hover:text-foreground/75",
        )}
      />
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className={cn(
            "min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-md text-[10px] font-bold tabular-nums",
            active
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground",
          )}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UserNotificationsPage() {
  const t = useTranslations("notifications");
  const tButtons = useTranslations("common.buttons");
  const tProfile = useTranslations("profile");
  const locale = useLocale();
  const { user, logout, isLoading: isAuthLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: response,
    isLoading,
    refetch,
  } = useGetNotifications(1, 50, { enabled: !!user });
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  const notifications = useMemo<Notification[]>(
    () => response?.data ?? [],
    [response?.data],
  );
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  const handleMarkAllAsRead = () =>
    notifications.filter((n) => !n.isRead).forEach((n) => markAsRead(n._id));
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const filtered = useMemo(
    () =>
      notifications.filter((n) => {
        const matchSearch =
          searchQuery === "" ||
          n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (n.action &&
            n.action.toLowerCase().includes(searchQuery.toLowerCase()));
        if (!matchSearch) return false;
        if (activeTab === "unread") return !n.isRead;
        if (activeTab === "read") return n.isRead;
        return true;
      }),
    [notifications, searchQuery, activeTab],
  );

  const tabCounts = useMemo(
    () => ({
      all: notifications.length,
      unread: unreadCount,
      read: notifications.filter((n) => n.isRead).length,
    }),
    [notifications, unreadCount],
  );

  const dateLabels = useMemo(
    () => ({ today: "Today", yesterday: "Yesterday", earlier: "Earlier" }),
    [],
  );
  const grouped = useMemo(
    () => groupByDate(filtered, dateLabels),
    [filtered, dateLabels],
  );

  const tabs: { key: TabType; label: string }[] = [
    { key: "all", label: t("tabs.all") },
    { key: "unread", label: t("tabs.unread") },
    { key: "read", label: t("tabs.read") },
  ];

  // Sidebar nav items (top)
  const navTop = [
    {
      href: `/${locale}/account`,
      icon: Icons.User,
      label: tProfile("tabs.profile"),
      iconClassname: "text-primary",
    },
    {
      href: `/${locale}/account`,
      icon: Icons.Orders,
      label: tProfile("sections.recent_orders"),
      iconClassname: "text-success",
      badge: 0,
    },
    {
      href: `/${locale}/notifications`,
      icon: Icons.Bell,
      label: t("title"),
      badge: unreadCount,
      active: true,
      iconClassname: "text-warning",
    },
  ];

  // Sidebar nav items (bottom)
  const navBottom = [
    {
      href: `/${locale}/contact`,
      icon: Icons.Mail,
      label: locale === "ar" ? "الدعم والمساعدة" : "Support",
    },
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 bg-background text-foreground transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex gap-5 items-start">
          {/* ── SIDEBAR ──────────────────────────────────────────── */}
          <aside className="hidden lg:flex flex-col w-56 shrink-0 sticky top-24 bg-card text-card-foreground border border-border/60 rounded-2xl shadow-sm backdrop-blur-md">
            {/* User avatar block */}
            <div className="flex items-center gap-3 bg-muted/40 p-4  mb-3 border-b border-border/50">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 font-bold text-base">
                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold truncate text-foreground">
                  {user?.name ?? (locale === "ar" ? "ضيف" : "Guest")}
                </p>
                <p className="text-[11px] truncate text-muted-foreground">
                  {user?.email ?? ""}
                </p>
              </div>
            </div>

            {/* Top nav */}
            <nav className="flex flex-col gap-0.5 flex-1 px-3">
              {navTop.map((item) => (
                <SideNavItem
                  key={item.href + item.label}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={item.active}
                  badge={item.badge}
                  disabled={!user}
                  iconClassname={item.iconClassname}
                />
              ))}
            </nav>

            {/* Bottom nav */}
            <div className="mt-3 p-3 flex flex-col gap-0.5 bg-muted/50 border-t border-border/50">
              {navBottom.map((item) => (
                <SideNavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                />
              ))}

              <Button
                variant={"outline"}
                onClick={() => logout()}
                className="group cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 text-destructive/80 hover:text-destructive hover:bg-destructive/10 w-full text-start"
              >
                <Icons.Logout className="w-4 h-4 shrink-0 text-destructive/60 group-hover:text-destructive" />
                {tProfile("actions.logout")}
              </Button>
            </div>
          </aside>

          {/* ── MAIN CONTENT ─────────────────────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* TOPBAR: title + search + refresh + mark-all */}
            <div className="flex flex-col gap-3 bg-muted/40 text-card-foreground border border-border/60 rounded-2xl p-4 sm:p-5 shadow-sm backdrop-blur-md">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                {/* Title */}
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.05)]">
                      <Icons.Bell className="w-4 h-4 text-primary" />
                    </div>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -inset-e-1 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-black shadow-sm">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </div>
                  <div>
                    <h1 className="text-[15px] font-bold title-gradient">
                      {t("title")}
                    </h1>
                    <p className="text-[12px] text-muted-foreground">
                      {t("subtitle", { count: unreadCount })}
                    </p>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRefresh}
                    disabled={isLoading || isRefreshing || !user}
                    className={cn(
                      "h-8 w-8 flex items-center justify-center rounded-xl transition-all cursor-pointer",
                      "border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5",
                      (isLoading || isRefreshing) &&
                        "opacity-40 cursor-not-allowed",
                      !user && "opacity-40 cursor-not-allowed",
                    )}
                  >
                    <Icons.RefreshCw
                      className={cn(
                        "w-3.5 h-3.5 text-primary",
                        (isLoading || isRefreshing) && "animate-spin",
                      )}
                    />
                  </button>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="flex items-center gap-1.5 h-8 px-3.5 rounded-xl text-[12px] font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-sm"
                    >
                      <Icons.Check className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">
                        {t("markAllAsRead")}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* FILTER TABS + SEARCH ROW */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {/* Filter tabs */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border/50">
                  {tabs.map((tab) => {
                    const active = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={cn(
                          "flex items-center cursor-pointer gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-all duration-150 select-none border border-transparent",
                          active
                            ? "text-primary bg-background border border-border shadow"
                            : "text-muted-foreground hover:text-foreground",
                             tab.key === "unread" && "text-success/70",
                        )}
                      >
                        {tab.label}
                        <span
                          className={cn(
                            "min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded text-[10px] font-mono tabular-nums font-bold",
                            active
                              ? "bg-primary/15 text-primary"
                              : "bg-muted/70 text-muted-foreground",
                            tab.key === "unread" && "text-success",
                          )}
                        >
                          {tabCounts[tab.key]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Search */}
                <div className="relative flex-1">
                  <span className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/60">
                    <Icons.Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("searchPlaceholder")}
                    className="w-full h-9 ltr:pl-9 rtl:pr-9 ltr:pr-8 rtl:pl-8 rounded-xl text-[13px] outline-none transition-all bg-muted/30 border border-border/70 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute ltr:right-2 rtl:left-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground/75"
                    >
                      <Icons.X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* FEED PANEL */}
            <div className="bg-card text-card-foreground border border-border/60 rounded-2xl overflow-hidden shadow-sm backdrop-blur-md">
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border/50 bg-muted/70">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {tabs.find((tab) => tab.key === activeTab)?.label}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground/60">
                  {filtered.length}
                </span>
              </div>

              {/* Content */}
              {isAuthLoading || isLoading ? (
                <div>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : !user ? (
                <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                  <div className="relative mb-6">
                    <div className="absolute -inset-8 rounded-full bg-primary/5 blur-2xl" />
                    <div className="relative w-16 h-16 rounded-2xl bg-muted/60 border border-border flex items-center justify-center">
                      <Icons.User className="w-7 h-7 text-muted-foreground/45" />
                    </div>
                  </div>
                  <h3 className="text-[15px] font-semibold mb-1 text-warning">
                    {locale === "ar"
                      ? "قم بتسجيل الدخول لرؤية الإشعارات"
                      : "Login to view notifications"}
                  </h3>
                  <p className="text-[13px] leading-relaxed max-w-xs mb-5 text-muted-foreground/80">
                    {locale === "ar"
                      ? "يجب عليك تسجيل الدخول بحسابك لتتمكن من تصفح الإشعارات الخاصة بك."
                      : "You must log in to your account to view your notifications."}
                  </p>
                  <Link href={`/${locale}/login`}>
                    <button className="h-10 cursor-pointer px-6 rounded-lg text-[13px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm">
                      {locale === "ar" ? "تسجيل الدخول" : "Login"}
                    </button>
                  </Link>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                  <div className="relative mb-6">
                    <div className="absolute -inset-8 rounded-full bg-primary/5 blur-2xl" />
                    <div className="relative w-16 h-16 rounded-2xl bg-muted/60 border border-border flex items-center justify-center">
                      <Icons.Bell className="w-7 h-7 text-muted-foreground/45" />
                    </div>
                  </div>
                  <h3 className="text-[15px] font-semibold mb-1 text-foreground">
                    {t("empty")}
                  </h3>
                  <p className="text-[13px] leading-relaxed max-w-xs mb-5 text-muted-foreground/80">
                    {searchQuery ? t("empty") : t("emptyDesc")}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="h-8 px-4 rounded-lg text-[12px] font-semibold border border-border text-muted-foreground hover:bg-muted transition-all"
                    >
                      {tButtons("clearAll")}
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  {grouped.map(([label, items]) => (
                    <section key={label}>
                      <div className="flex items-center gap-3 px-5 py-2 border-b border-border/30 bg-muted/40">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/75">
                          {label}
                        </span>
                        <div className="flex-1 h-px bg-border/40" />
                        <span className="text-[13px] font-mono text-primary">
                          {items.length}
                        </span>
                      </div>
                      {items.map((n) => (
                        <NotificationCard
                          key={n._id}
                          notification={n}
                          onMarkRead={markAsRead}
                          onDelete={deleteNotification}
                          tButtons={tButtons}
                          t={t}
                        />
                      ))}
                    </section>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
