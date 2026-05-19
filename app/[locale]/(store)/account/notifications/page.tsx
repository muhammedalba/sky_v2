'use client';

import { useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import {
  useGetNotifications,
  useDeleteNotification,
  useMarkAsRead,
} from '@/features/notifications/hooks/useNotifications';
import { Icons } from '@/shared/ui/Icons';
import { Badge } from '@/shared/ui/Badge';
import { formatDate, getActionBadgeVariant } from '@/lib/utils';
import { Notification } from '@/features/notifications/api';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/hooks/useAuth';

type TabType = 'all' | 'unread' | 'read';

// ─── helpers ──────────────────────────────────────────────────────────────────

function getNotificationMeta(notification: Notification) {
  const action = notification.action?.toUpperCase() || '';
  const type   = notification.type;

  if (action.includes('ORDER'))
    return { icon: Icons.ShoppingBag, bg: 'bg-blue-500/15',   text: 'text-blue-400',   ring: 'ring-blue-500/20',   dot: 'bg-blue-400'   };
  if (action.includes('PROMO') || action.includes('COUPON') || action.includes('DISCOUNT') || action.includes('OFFER'))
    return { icon: Icons.Coupons,    bg: 'bg-emerald-500/15', text: 'text-emerald-400', ring: 'ring-emerald-500/20', dot: 'bg-emerald-400' };
  if (action.includes('WARN') || action.includes('ALERT') || action.includes('FAIL'))
    return { icon: Icons.Warning,    bg: 'bg-amber-500/15',   text: 'text-amber-400',   ring: 'ring-amber-500/20',   dot: 'bg-amber-400'   };
  if (type === 'ROLE')
    return { icon: Icons.Shield,     bg: 'bg-violet-500/15',  text: 'text-violet-400',  ring: 'ring-violet-500/20',  dot: 'bg-violet-400'  };
  if (type === 'BROADCAST' || action.includes('SYSTEM') || action.includes('ANNOUNCE'))
    return { icon: Icons.AiSpark,    bg: 'bg-indigo-500/15',  text: 'text-indigo-400',  ring: 'ring-indigo-500/20',  dot: 'bg-indigo-400'  };
  return   { icon: Icons.Bell,       bg: 'bg-primary/15',     text: 'text-primary',     ring: 'ring-primary/20',     dot: 'bg-primary'     };
}

function groupByDate(items: Notification[], labels: { today: string; yesterday: string; earlier: string }) {
  const now       = new Date();
  const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const groups: Record<string, Notification[]> = { [labels.today]: [], [labels.yesterday]: [], [labels.earlier]: [] };
  items.forEach(n => {
    const d   = new Date(n.createdAt);
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (day >= today)          groups[labels.today].push(n);
    else if (day >= yesterday) groups[labels.yesterday].push(n);
    else                       groups[labels.earlier].push(n);
  });
  return Object.entries(groups).filter(([, g]) => g.length > 0);
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex items-start gap-3.5 px-5 py-4 animate-pulse border-b border-white/5 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-white/5 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-2 pt-0.5">
        <div className="h-3 w-32 bg-white/5 rounded" />
        <div className="h-3 w-full bg-white/5 rounded" />
        <div className="h-3 w-2/5 bg-white/5 rounded" />
      </div>
    </div>
  );
}

// ─── Notification Card ────────────────────────────────────────────────────────

function NotificationCard({ notification, onMarkRead, onDelete, tButtons, t }: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete:   (id: string) => void;
  tButtons:   ReturnType<typeof useTranslations>;
  t:          ReturnType<typeof useTranslations>;
}) {
  const meta          = getNotificationMeta(notification);
  const IconComponent = meta.icon;
  const isUnread      = !notification.isRead;

  const typeBadgeVariant = notification.type === 'BROADCAST' ? 'default' : notification.type === 'ROLE' ? 'secondary' : 'outline';
  const typeLabel        = notification.type === 'BROADCAST' ? t('admin.typeBroadcast') : notification.type === 'ROLE' ? t('admin.typeRole') : t('admin.typeDirect');

  return (
    <div className={cn(
      'group relative flex items-start gap-3.5 px-5 py-4 transition-all duration-200 cursor-default border-b border-white/5 last:border-0',
      isUnread ? 'bg-indigo-500/[0.045] hover:bg-indigo-500/[0.07]' : 'hover:bg-white/[0.025]',
    )}>
      {isUnread && (
        <span className="absolute inset-y-0 ltr:left-0 rtl:right-0 w-[3px] rounded-full bg-indigo-500"
          style={{ boxShadow: '0 0 8px rgba(99,102,241,0.6)' }} />
      )}
      <div className={cn('mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ring-1 transition-transform duration-200 group-hover:scale-105', meta.bg, meta.ring)}>
        <IconComponent className={cn('w-4 h-4', meta.text)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <Badge variant={typeBadgeVariant} className="text-[10px] py-0 px-1.5 h-4 rounded font-semibold uppercase tracking-wide">{typeLabel}</Badge>
          {notification.action && (
            <Badge variant={getActionBadgeVariant(notification.action)} className="font-mono text-[10px] px-1.5 py-0 h-4 rounded">{notification.action}</Badge>
          )}
          {isUnread && <span className={cn('inline-flex w-1.5 h-1.5 rounded-full shrink-0', meta.dot)} />}
        </div>
        <p className={cn('text-[13px] leading-relaxed', isUnread ? 'text-white/90 font-medium' : 'text-white/50')}>
          {notification.message}
        </p>
        <p className="flex items-center gap-1.5 mt-1.5 text-[11px] text-white/30 font-medium">
          <Icons.Clock className="w-3 h-3" />{formatDate(notification.createdAt)}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        {isUnread && (
          <button onClick={() => onMarkRead(notification._id)} title={tButtons('markRead')}
            className="h-7 w-7 flex items-center justify-center rounded-lg text-white/30 hover:text-indigo-400 hover:bg-indigo-500/15 transition-all">
            <Icons.Check className="w-3.5 h-3.5" />
          </button>
        )}
        <button onClick={() => onDelete(notification._id)} title={tButtons('delete')}
          className="h-7 w-7 flex items-center justify-center rounded-lg text-white/30 hover:text-rose-400 hover:bg-rose-500/15 transition-all">
          <Icons.Trash className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────

function SideNavItem({ href, icon: Icon, label, active, badge }: {
  href: string; icon: React.ComponentType<{ className?: string }>;
  label: string; active?: boolean; badge?: number;
}) {
  return (
    <Link href={href} className={cn(
      'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150',
      active
        ? 'bg-background text-foreground'
        : 'text-white/40 hover:text-white/80 hover:bg-white/5',
    )}>
      <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-indigo-400' : 'text-white/30 group-hover:text-white/60')} />
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className={cn('min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-md text-[10px] font-bold tabular-nums',
          active ? 'bg-indigo-500/30 text-indigo-300' : 'bg-white/8 text-white/40')}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UserNotificationsPage() {
  const t        = useTranslations('notifications');
  const tButtons = useTranslations('common.buttons');
  const tProfile = useTranslations('profile');
  const locale   = useLocale();
  const { user, logout } = useAuth();

  const [activeTab,    setActiveTab]    = useState<TabType>('all');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: response, isLoading, refetch } = useGetNotifications(1, 50);
  const { mutate: markAsRead }         = useMarkAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  const notifications = useMemo<Notification[]>(() => response?.data ?? [], [response?.data]);
  const unreadCount   = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const handleMarkAllAsRead = () => notifications.filter(n => !n.isRead).forEach(n => markAsRead(n._id));
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const filtered = useMemo(() => notifications.filter(n => {
    const matchSearch = searchQuery === '' ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.action && n.action.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchSearch) return false;
    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'read')   return  n.isRead;
    return true;
  }), [notifications, searchQuery, activeTab]);

  const tabCounts = useMemo(() => ({
    all:    notifications.length,
    unread: unreadCount,
    read:   notifications.filter(n => n.isRead).length,
  }), [notifications, unreadCount]);

  const dateLabels = useMemo(() => ({ today: 'Today', yesterday: 'Yesterday', earlier: 'Earlier' }), []);
  const grouped    = useMemo(() => groupByDate(filtered, dateLabels), [filtered, dateLabels]);

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all',    label: t('tabs.all')    },
    { key: 'unread', label: t('tabs.unread') },
    { key: 'read',   label: t('tabs.read')   },
  ];

  // Sidebar nav items (top)
  const navTop = [
    { href: `/${locale}/account`,               icon: Icons.User,    label: tProfile('tabs.profile') },
    { href: `/${locale}/account`,               icon: Icons.Orders,  label: tProfile('sections.recent_orders'), badge: 0 },
    { href: `/${locale}/account/notifications`, icon: Icons.Bell,    label: t('title'), badge: unreadCount, active: true },
  ];

  // Sidebar nav items (bottom)
  const navBottom = [
    { href: `/${locale}/contact`, icon: Icons.Mail, label: locale === 'ar' ? 'الدعم والمساعدة' : 'Support' },
  ];

  // surface styles
  const glass = {
    backdropFilter:'blur(16px)',
    border:        '1px solid rgba(255,255,255,0.06)',
  } as React.CSSProperties;

  return (
    <div className="min-h-screen pt-32  pb-20" >
      <div className="max-w-5xl mx-auto px-4 ">
        <div className="flex gap-5 items-start">

          {/* ── SIDEBAR ──────────────────────────────────────────── */}
          <aside className="hidden lg:flex flex-col w-56 shrink-0 sticky top-24 " style={{ ...glass, borderRadius: '1.25rem', padding: '1rem' }}>

            {/* User avatar block */}
            <div className="flex items-center gap-3 px-1 pb-4 mb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0"
                style={{ border: '1px solid rgba(99,102,241,0.3)', color: '#c0c1ff', fontSize: 16, fontWeight: 700 }}>
                {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold truncate" style={{ color: 'rgba(218,226,253,0.9)' }}>
                  {user?.name ?? (locale === 'ar' ? 'ضيف' : 'Guest')}
                </p>
                <p className="text-[11px] truncate" style={{ color: 'rgba(199,196,215,0.4)' }}>
                  {user?.email ?? ''}
                </p>
              </div>
            </div>

            {/* Top nav */}
            <nav className="flex flex-col gap-0.5 flex-1">
              {navTop.map(item => (
                <SideNavItem key={item.href + item.label} href={item.href} icon={item.icon}
                  label={item.label} active={item.active} badge={item.badge} />
              ))}
            </nav>

            {/* Bottom nav */}
            <div className="mt-3 pt-3 flex flex-col gap-0.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {navBottom.map(item => (
                <SideNavItem key={item.href} href={item.href} icon={item.icon} label={item.label} />
              ))}
              <button onClick={() => logout()}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 w-full text-start">
                <Icons.Logout className="w-4 h-4 shrink-0 text-rose-500/50 group-hover:text-rose-400" />
                {tProfile('actions.logout')}
              </button>
            </div>
          </aside>

          {/* ── MAIN CONTENT ─────────────────────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {/* TOPBAR: title + search + refresh + mark-all */}
            <div className="flex flex-col gap-3" style={{ ...glass, borderRadius: '1.25rem', padding: '1rem 1.25rem' }}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                {/* Title */}
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg,rgba(99,102,241,.25),rgba(99,102,241,.06))', border: '1px solid rgba(99,102,241,.3)', boxShadow: '0 0 20px rgba(99,102,241,.18)' }}>
                      <Icons.Bell className="w-4 h-4 text-indigo-400" />
                    </div>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -inset-e-1 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-indigo-500 text-white text-[9px] font-black"
                        style={{ boxShadow: '0 0 8px rgba(99,102,241,.65)' }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <div>
                    <h1 className="text-[15px] font-bold tracking-tight" style={{ color: 'rgba(218,226,253,.95)' }}>{t('title')}</h1>
                    <p className="text-[12px]" style={{ color: 'rgba(199,196,215,.5)' }}>{t('subtitle', { count: unreadCount })}</p>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button onClick={handleRefresh} disabled={isLoading || isRefreshing}
                    className={cn('h-8 w-8 flex items-center justify-center rounded-xl transition-all',
                      'border border-white/10 text-white/40 hover:text-indigo-400 hover:border-indigo-500/40 hover:bg-indigo-500/10',
                      (isLoading || isRefreshing) && 'opacity-40 cursor-not-allowed')}>
                    <Icons.RefreshCw className={cn('w-3.5 h-3.5', (isLoading || isRefreshing) && 'animate-spin')} />
                  </button>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllAsRead}
                      className="flex items-center gap-1.5 h-8 px-3.5 rounded-xl text-[12px] font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 4px 14px rgba(99,102,241,.35)' }}>
                      <Icons.Check className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{t('markAllAsRead')}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* FILTER TABS + SEARCH ROW */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {/* Filter tabs */}
                <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {tabs.map(tab => {
                    const active = activeTab === tab.key;
                    return (
                      <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-all duration-150 select-none',
                          active ? 'text-indigo-300' : 'text-white/40 hover:text-white/70',
                        )}
                        style={active ? { background: 'rgba(99,102,241,0.22)', boxShadow: '0 1px 4px rgba(99,102,241,0.2)' } : undefined}>
                        {tab.label}
                        <span className={cn('min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded text-[10px] font-mono tabular-nums font-bold',
                          active ? 'bg-indigo-500/30 text-indigo-300' : 'bg-white/6 text-white/30')}>
                          {tabCounts[tab.key]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Search */}
                <div className="relative flex-1">
                  <span className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(199,196,215,.35)' }}>
                    <Icons.Search className="w-3.5 h-3.5" />
                  </span>
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    className="w-full h-9 ltr:pl-9 rtl:pr-9 ltr:pr-8 rtl:pl-8 rounded-xl text-[13px] outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(218,226,253,.85)' }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.08)'; }}
                    onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,.08)'; e.target.style.boxShadow = 'none'; }}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')}
                      className="absolute ltr:right-2 rtl:left-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"
                      style={{ color: 'rgba(199,196,215,.5)' }}>
                      <Icons.X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* FEED PANEL */}
            <div className="rounded-2xl overflow-hidden" style={glass}>
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-3"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(192,193,255,.45)' }}>
                  {tabs.find(tab => tab.key === activeTab)?.label}
                </span>
                <span className="text-[10px] font-mono" style={{ color: 'rgba(199,196,215,.3)' }}>{filtered.length}</span>
              </div>

              {/* Content */}
              {isLoading ? (
                <div>{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                  <div className="relative mb-6">
                    <div className="absolute -inset-8 rounded-full bg-indigo-500/8 blur-2xl" />
                    <div className="relative w-16 h-16 rounded-2xl bg-white/4 ring-1 ring-white/10 flex items-center justify-center">
                      <Icons.Bell className="w-7 h-7 text-white/20" />
                    </div>
                  </div>
                  <h3 className="text-[15px] font-semibold mb-1" style={{ color: 'rgba(218,226,253,.6)' }}>{t('empty')}</h3>
                  <p className="text-[13px] leading-relaxed max-w-xs mb-5" style={{ color: 'rgba(199,196,215,.35)' }}>
                    {searchQuery ? t('empty') : t('emptyDesc')}
                  </p>
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')}
                      className="h-8 px-4 rounded-lg text-[12px] font-semibold transition-all"
                      style={{ border: '1px solid rgba(255,255,255,.1)', color: 'rgba(199,196,215,.5)' }}>
                      {tButtons('clearAll')}
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  {grouped.map(([label, items], gi) => (
                    <section key={label}>
                      <div className="flex items-center gap-3 px-5 py-2"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: gi === 0 ? 'rgba(99,102,241,0.03)' : 'rgba(255,255,255,0.01)' }}>
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(192,193,255,.45)' }}>{label}</span>
                        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
                        <span className="text-[10px] font-mono" style={{ color: 'rgba(199,196,215,.25)' }}>{items.length}</span>
                      </div>
                      {items.map(n => (
                        <NotificationCard key={n._id} notification={n}
                          onMarkRead={markAsRead} onDelete={deleteNotification}
                          tButtons={tButtons} t={t} />
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
