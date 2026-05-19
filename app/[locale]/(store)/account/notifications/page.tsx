'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useGetNotifications, useDeleteNotification, useMarkAsRead } from '@/features/notifications/hooks/useNotifications';
import { Icons } from '@/shared/ui/Icons';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { formatDate, getActionBadgeVariant } from '@/lib/utils';
import { Notification } from '@/features/notifications/api';
import { cn } from '@/lib/utils';

type TabType = 'all' | 'unread' | 'read';

// ─── helpers ──────────────────────────────────────────────────────────────────

function getNotificationMeta(notification: Notification) {
  const action = notification.action?.toUpperCase() || '';
  const type   = notification.type;

  if (action.includes('ORDER'))
    return { icon: Icons.ShoppingBag, bg: 'bg-blue-500/10', text: 'text-blue-500',   ring: 'ring-blue-500/20' };
  if (action.includes('PROMO') || action.includes('COUPON') || action.includes('DISCOUNT') || action.includes('OFFER'))
    return { icon: Icons.Coupons,     bg: 'bg-emerald-500/10', text: 'text-emerald-500', ring: 'ring-emerald-500/20' };
  if (action.includes('WARN') || action.includes('ALERT') || action.includes('FAIL'))
    return { icon: Icons.Warning,     bg: 'bg-amber-500/10',   text: 'text-amber-500',   ring: 'ring-amber-500/20' };
  if (type === 'ROLE')
    return { icon: Icons.Shield,      bg: 'bg-indigo-500/10',  text: 'text-indigo-500',  ring: 'ring-indigo-500/20' };
  if (type === 'BROADCAST' || action.includes('SYSTEM') || action.includes('ANNOUNCE'))
    return { icon: Icons.AiSpark,     bg: 'bg-purple-500/10',  text: 'text-purple-500',  ring: 'ring-purple-500/20' };

  return { icon: Icons.Bell, bg: 'bg-primary/10', text: 'text-primary', ring: 'ring-primary/20' };
}

/** Group a sorted notification list into date buckets */
function groupByDate(items: Notification[], labels: { today: string; yesterday: string; earlier: string }) {
  const now      = new Date();
  const today    = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

  const groups: Record<string, Notification[]> = {
    [labels.today]:     [],
    [labels.yesterday]: [],
    [labels.earlier]:   [],
  };

  items.forEach(n => {
    const d = new Date(n.createdAt);
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (day >= today)          groups[labels.today].push(n);
    else if (day >= yesterday) groups[labels.yesterday].push(n);
    else                       groups[labels.earlier].push(n);
  });

  return Object.entries(groups).filter(([, g]) => g.length > 0);
}

// ─── sub-components ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex items-start gap-4 p-5 rounded-2xl border border-border/40 bg-card/50 animate-pulse">
      <div className="w-11 h-11 rounded-xl bg-muted shrink-0" />
      <div className="flex-1 space-y-2.5 pt-0.5">
        <div className="flex gap-2">
          <div className="h-4 w-20 bg-muted rounded-md" />
          <div className="h-4 w-16 bg-muted rounded-md" />
        </div>
        <div className="h-4 w-full bg-muted rounded-md" />
        <div className="h-3.5 w-2/5 bg-muted rounded-md" />
      </div>
    </div>
  );
}

interface NotificationCardProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete:   (id: string) => void;
  tButtons:   ReturnType<typeof useTranslations>;
  t:          ReturnType<typeof useTranslations>;
}

function NotificationCard({ notification, onMarkRead, onDelete, tButtons, t }: NotificationCardProps) {
  const meta          = getNotificationMeta(notification);
  const IconComponent = meta.icon;
  const isUnread      = !notification.isRead;

  const typeBadgeVariant =
    notification.type === 'BROADCAST' ? 'default' :
    notification.type === 'ROLE'      ? 'secondary' : 'outline';

  const typeLabel =
    notification.type === 'BROADCAST' ? t('admin.typeBroadcast') :
    notification.type === 'ROLE'      ? t('admin.typeRole') :
                                         t('admin.typeDirect');

  return (
    <div
      className={cn(
        'group relative flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200',
        'hover:shadow-lg hover:shadow-black/5 hover:-translate-y-px',
        isUnread
          ? 'bg-primary/[0.025] border-primary/20 hover:border-primary/40'
          : 'bg-card/60 border-border/40 hover:border-border/70 hover:bg-card/80',
      )}
    >
      {/* Unread accent bar */}
      {isUnread && (
        <span className="absolute inset-y-3 ltr:left-0 rtl:right-0 w-[3px] rounded-full bg-primary" />
      )}

      {/* Icon */}
      <div
        className={cn(
          'mt-0.5 w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ring-1 transition-transform duration-200 group-hover:scale-105',
          meta.bg, meta.ring,
        )}
      >
        <IconComponent className={cn('w-5 h-5', meta.text)} />
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={typeBadgeVariant} className="text-[11px] py-0.5 px-2 rounded-lg font-semibold">
            {typeLabel}
          </Badge>
          {notification.action && (
            <Badge
              variant={getActionBadgeVariant(notification.action)}
              className="font-mono text-[11px] px-2 py-0.5 rounded-lg font-semibold"
            >
              {notification.action}
            </Badge>
          )}
          {isUnread && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(var(--primary),0.8)] ms-1" />
          )}
        </div>

        {/* Message */}
        <p className={cn(
          'text-sm leading-relaxed',
          isUnread ? 'font-semibold text-foreground' : 'text-muted-foreground',
        )}>
          {notification.message}
        </p>

        {/* Timestamp */}
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
          <Icons.Clock className="w-3 h-3" />
          {formatDate(notification.createdAt)}
        </p>
      </div>

      {/* Actions (appear on hover / always visible on mobile) */}
      <div className={cn(
        'flex items-center gap-1.5 shrink-0',
        'sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity sm:duration-150',
      )}>
        {isUnread && (
          <button
            onClick={() => onMarkRead(notification._id)}
            title={tButtons('markRead')}
            className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-150"
          >
            <Icons.Check className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('markAsRead')}</span>
          </button>
        )}
        <button
          onClick={() => onDelete(notification._id)}
          title={tButtons('delete')}
          className="flex items-center justify-center h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150"
        >
          <Icons.Trash className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function UserNotificationsPage() {
  const t        = useTranslations('notifications');
  const tButtons = useTranslations('common.buttons');

  const [activeTab,    setActiveTab]    = useState<TabType>('all');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: response, isLoading, refetch } = useGetNotifications(1, 50);
  const { mutate: markAsRead }       = useMarkAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  const notifications: Notification[] = response?.data || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllAsRead = () =>
    notifications.filter(n => !n.isRead).forEach(n => markAsRead(n._id));

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Filtered list
  const filtered = useMemo(() =>
    notifications.filter(n => {
      const matchSearch =
        searchQuery === '' ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.action && n.action.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchSearch) return false;
      if (activeTab === 'unread') return !n.isRead;
      if (activeTab === 'read')   return  n.isRead;
      return true;
    }),
    [notifications, searchQuery, activeTab],
  );

  // Tab counts
  const tabCounts = useMemo(() => ({
    all:    notifications.length,
    unread: unreadCount,
    read:   notifications.filter(n => n.isRead).length,
  }), [notifications, unreadCount]);

  // Date-grouped list
  const dateLabels = { today: 'Today', yesterday: 'Yesterday', earlier: 'Earlier' };
  const grouped    = useMemo(() => groupByDate(filtered, dateLabels), [filtered]);

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all',    label: t('tabs.all')    },
    { key: 'unread', label: t('tabs.unread') },
    { key: 'read',   label: t('tabs.read')   },
  ];

  return (
    <div className="min-h-screen pt-36 pb-28 bg-background selection:bg-primary/10 selection:text-primary">

      {/* ── Hero Header ───────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border/40 mb-10 py-12">
        {/* decorative glows */}
        <div className="pointer-events-none absolute -top-24 ltr:-right-24 rtl:-left-24 w-96 h-96 rounded-full bg-primary/8 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0  ltr:-left-16  rtl:-right-16 w-72 h-72 rounded-full bg-purple-500/6 blur-[80px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            {/* Left: icon + title */}
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center shadow-xl shadow-primary/10">
                  <Icons.Bell className="w-7 h-7 text-primary" />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -end-1.5 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-black shadow-lg shadow-primary/30">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  {t('title')}
                </h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {t('subtitle', { count: unreadCount })}
                </p>
              </div>
            </div>

            {/* Right: action buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading || isRefreshing}
                className="h-10 px-4 rounded-xl gap-2 font-semibold border-border/60 hover:bg-secondary/40 transition-all"
              >
                <Icons.RefreshCw className={cn('w-4 h-4 text-primary', (isLoading || isRefreshing) && 'animate-spin')} />
                <span className="hidden sm:inline">{tButtons('retry')}</span>
              </Button>

              {unreadCount > 0 && (
                <Button
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="h-10 px-5 rounded-xl gap-2 font-bold shadow-md shadow-primary/20 hover:shadow-primary/35 hover:-translate-y-px transition-all"
                >
                  <Icons.Check className="w-4 h-4" />
                  {t('markAllAsRead')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content ──────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Filter + Search bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-2 bg-card/70 backdrop-blur-xl border border-border/50 rounded-2xl shadow-sm shadow-black/5">

          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none px-1 grow">
            {tabs.map(tab => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-150 select-none',
                    active
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60',
                  )}
                >
                  {tab.label}
                  <span className={cn(
                    'px-1.5 py-px rounded-md text-[11px] font-mono tabular-nums',
                    active ? 'bg-white/20 text-primary-foreground' : 'bg-muted text-muted-foreground',
                  )}>
                    {tabCounts[tab.key]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64 shrink-0 px-1 sm:px-0">
            <Icons.Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full h-10 ltr:pl-9 rtl:pr-9 ltr:pr-10 rtl:pl-10 rounded-xl bg-secondary/40 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute ltr:right-2.5 rtl:left-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Icons.X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content area */}
        {isLoading ? (
          /* Skeleton */
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-6">
              <div className="absolute -inset-6 rounded-full bg-primary/8 blur-2xl" />
              <div className="relative w-20 h-20 rounded-2xl bg-secondary/70 border border-border flex items-center justify-center shadow-inner">
                <Icons.Bell className="w-9 h-9 text-muted-foreground/30" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">{t('empty')}</h3>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6">
              {searchQuery ? t('empty') : t('emptyDesc')}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => setSearchQuery('')}
                className="h-10 px-5 rounded-xl font-semibold"
              >
                {tButtons('clearAll')}
              </Button>
            )}
          </div>
        ) : (
          /* Grouped notification list */
          <div className="space-y-8">
            {grouped.map(([label, items]) => (
              <section key={label}>
                {/* Date group header */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                    {label}
                  </span>
                  <div className="flex-1 h-px bg-border/40" />
                  <span className="text-[11px] font-mono text-muted-foreground/50">{items.length}</span>
                </div>

                {/* Cards */}
                <div className="space-y-2">
                  {items.map(notification => (
                    <NotificationCard
                      key={notification._id}
                      notification={notification}
                      onMarkRead={markAsRead}
                      onDelete={deleteNotification}
                      tButtons={tButtons}
                      t={t}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
