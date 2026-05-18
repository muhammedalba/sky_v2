'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useGetNotifications, useDeleteNotification, useMarkAsRead } from '@/features/notifications/hooks/useNotifications';
import { Icons } from '@/shared/ui/Icons';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { formatDate } from '@/lib/utils';
import { Notification } from '@/features/notifications/api';
import { cn } from '@/lib/utils';

type TabType = 'all' | 'unread' | 'read' | 'broadcast' | 'direct';

export default function UserNotificationsPage() {
  const t = useTranslations('notifications');
  const tButtons = useTranslations('common.buttons');

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: response, isLoading, refetch } = useGetNotifications(1, 50);
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  const notifications: Notification[] = response?.data || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllAsRead = () => {
    const unreadList = notifications.filter(n => !n.isRead);
    unreadList.forEach(n => markAsRead(n._id));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Filter notifications based on active tab and search query
  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = searchQuery === '' || 
      n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.action && n.action.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'read') return n.isRead;
    if (activeTab === 'broadcast') return n.type === 'BROADCAST';
    if (activeTab === 'direct') return n.type === 'DIRECT';
    return true;
  });

  // Calculate counts for tabs
  const tabCounts = {
    all: notifications.length,
    unread: unreadCount,
    read: notifications.filter(n => n.isRead).length,
    broadcast: notifications.filter(n => n.type === 'BROADCAST').length,
    direct: notifications.filter(n => n.type === 'DIRECT').length,
  };

  // Helper for dynamic notification styling & icons
  const getNotificationMeta = (notification: Notification) => {
    const action = notification.action?.toUpperCase() || '';
    const type = notification.type;

    if (action.includes('ORDER')) {
      return {
        icon: Icons.ShoppingBag,
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-500/30',
        badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      };
    }
    if (action.includes('PROMO') || action.includes('COUPON') || action.includes('DISCOUNT') || action.includes('OFFER')) {
      return {
        icon: Icons.Coupons,
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-500/30',
        badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      };
    }
    if (action.includes('WARN') || action.includes('ALERT') || action.includes('FAIL')) {
      return {
        icon: Icons.Warning,
        bg: 'bg-amber-500/10 dark:bg-amber-500/20',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-500/30',
        badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      };
    }
    if (type === 'BROADCAST' || action.includes('SYSTEM') || action.includes('ANNOUNCE')) {
      return {
        icon: Icons.AiSpark,
        bg: 'bg-purple-500/10 dark:bg-purple-500/20',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-500/30',
        badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      };
    }
    return {
      icon: Icons.Bell,
      bg: 'bg-primary/10 dark:bg-primary/20',
      text: 'text-primary',
      border: 'border-primary/30',
      badgeBg: 'bg-primary/10 text-primary',
    };
  };

  const tabsList: { key: TabType; label: string }[] = [
    { key: 'all', label: t('tabs.all') },
    { key: 'unread', label: t('tabs.unread') },
    { key: 'read', label: t('tabs.read') },
    { key: 'broadcast', label: t('tabs.broadcast') },
    { key: 'direct', label: t('tabs.direct') },
  ];

  return (
    <div className="min-h-screen pt-36 bg-background pb-24 selection:bg-primary/10 selection:text-primary">
      {/* Hero Header Section */}
      <section className="py-12 bg-gradient-to-b from-secondary/10 via-secondary/5 to-transparent border-b border-border/50 relative overflow-hidden mb-8">
        {/* Decorative glowing background elements */}
        <div className="absolute top-0 ltr:right-0 rtl:left-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 ltr:left-0 rtl:right-0 w-[300px] h-[300px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-xl shadow-primary/5 backdrop-blur-md">
                <Icons.Bell className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight">{t('title')}</h1>
                  {unreadCount > 0 && (
                    <Badge variant="default" className="px-3 py-1 text-xs font-bold rounded-full animate-bounce shadow-md shadow-primary/20">
                      {unreadCount} {t('unread')}
                    </Badge>
                  )}
                </div>
                <p className="text-base text-muted-foreground font-medium max-w-md">
                  {t('subtitle', { count: unreadCount })}
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading || isRefreshing}
                className="h-11 px-4 rounded-2xl border-border/60 hover:bg-secondary/40 font-semibold gap-2 backdrop-blur-sm transition-all shadow-sm"
              >
                <Icons.RefreshCw className={cn("w-4 h-4 text-primary", (isLoading || isRefreshing) && "animate-spin")} />
                <span className="hidden sm:inline">{tButtons('retry')}</span>
              </Button>

              {unreadCount > 0 && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="h-11 px-5 rounded-2xl font-bold gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
                >
                  <Icons.Check className="w-4 h-4" />
                  <span>{t('markAllAsRead')}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Search & Tabs Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-2 bg-card/60 backdrop-blur-xl border border-border/60 rounded-3xl shadow-lg shadow-black/5">
          {/* Tabs Navigation */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-none w-full lg:w-auto px-1">
            {tabsList.map((tab) => {
              const count = tabCounts[tab.key];
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-200 select-none",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  <span>{tab.label}</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-xl text-xs font-mono",
                    isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-72 shrink-0 px-1 lg:px-0">
            <Icons.Search className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full h-11 ltr:pl-10 rtl:pr-10 ltr:pr-4 rtl:pl-4 rounded-2xl bg-secondary/30 border border-border/60 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              >
                <Icons.X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Notifications Grid / List */}
        <div>
          {isLoading ? (
            /* Loading Skeleton */
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-5 p-6 rounded-3xl border border-border/40 bg-card/40 backdrop-blur-sm animate-pulse">
                  <div className="w-12 h-12 rounded-2xl bg-muted shrink-0" />
                  <div className="flex-1 space-y-3 py-1">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-24 bg-muted rounded-lg" />
                      <div className="h-5 w-20 bg-muted rounded-lg" />
                    </div>
                    <div className="h-4 w-full bg-muted rounded-lg" />
                    <div className="h-4 w-2/3 bg-muted rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-card/30 backdrop-blur-md border border-border/40 rounded-3xl shadow-sm">
              <div className="relative mb-6">
                <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full" />
                <div className="w-24 h-24 rounded-[2rem] bg-secondary/60 border border-border flex items-center justify-center relative z-10 shadow-inner">
                  <Icons.Bell className="h-12 w-12 text-muted-foreground/40" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-foreground mb-2 tracking-tight">{t('empty')}</h3>
              <p className="text-base text-muted-foreground max-w-md mb-8 leading-relaxed">
                {searchQuery ? t('empty') : t('emptyDesc')}
              </p>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchQuery('')}
                  className="rounded-2xl h-11 px-6 font-bold border-border/80 hover:bg-secondary/50 shadow-sm"
                >
                  {tButtons('clearAll')}
                </Button>
              )}
            </div>
          ) : (
            /* Notifications Cards */
            <div className="space-y-4">
              {filteredNotifications.map((notification) => {
                const meta = getNotificationMeta(notification);
                const IconComponent = meta.icon;

                return (
                  <div
                    key={notification._id}
                    className={cn(
                      "group flex flex-col sm:flex-row sm:items-start gap-5 p-6 rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/40 relative overflow-hidden",
                      !notification.isRead && "bg-primary/[0.03] border-primary/25 shadow-sm shadow-primary/5"
                    )}
                  >
                    {/* Glowing Unread Indicator Bar */}
                    {!notification.isRead && (
                      <div className="absolute top-0 ltr:right-0 rtl:left-0 w-1.5 h-full bg-gradient-to-b from-primary to-primary/60 shadow-[0_0_12px_rgba(var(--primary),0.8)]" />
                    )}

                    {/* Icon Container */}
                    <div className="flex items-center justify-between sm:justify-start gap-4 border-b border-border/40 sm:border-0 pb-4 sm:pb-0">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm transition-transform duration-300 group-hover:scale-105", meta.bg, meta.border)}>
                        <IconComponent className={cn("w-7 h-7", meta.text)} />
                      </div>

                      {/* Mobile action header badges */}
                      <div className="flex items-center gap-2 sm:hidden">
                        <Badge variant={notification.type === 'BROADCAST' ? 'default' : 'outline'} className="text-xs py-1 px-2.5 rounded-xl font-bold shadow-sm">
                          {notification.type === 'BROADCAST' ? t('admin.typeBroadcast') : t('admin.typeDirect')}
                        </Badge>
                        {notification.action && (
                          <span className={cn("font-mono text-xs px-2.5 py-1 rounded-xl font-bold border", meta.badgeBg, meta.border)}>
                            {notification.action}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-2.5 pt-1 sm:pt-0">
                      <div className="hidden sm:flex items-center gap-2 flex-wrap">
                        <Badge variant={notification.type === 'BROADCAST' ? 'default' : 'outline'} className="text-xs py-1 px-3 rounded-xl font-bold shadow-sm">
                          {notification.type === 'BROADCAST' ? t('admin.typeBroadcast') : t('admin.typeDirect')}
                        </Badge>
                        {notification.action && (
                          <span className={cn("font-mono text-xs px-3 py-1 rounded-xl font-bold border shadow-sm", meta.badgeBg, meta.border)}>
                            {notification.action}
                          </span>
                        )}
                      </div>

                      <p className={cn(
                        "text-base leading-relaxed tracking-wide transition-colors",
                        !notification.isRead ? "font-bold text-foreground" : "font-medium text-muted-foreground"
                      )}>
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium pt-1">
                        <Icons.Clock className="w-3.5 h-3.5 opacity-70" />
                        <span>{formatDate(notification.createdAt)}</span>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center justify-end sm:justify-start gap-2 pt-4 sm:pt-1 border-t border-border/40 sm:border-0 shrink-0 opacity-95 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                      {!notification.isRead && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-10 px-4 rounded-xl text-primary font-bold hover:bg-primary hover:text-primary-foreground gap-2 transition-all shadow-sm"
                          title={tButtons('markRead')}
                          onClick={() => markAsRead(notification._id)}
                        >
                          <Icons.Check className="h-4 w-4" />
                          <span className="text-xs">{t('markAsRead')}</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0 rounded-xl text-destructive hover:bg-destructive/15 hover:text-destructive transition-colors"
                        title={tButtons('delete')}
                        onClick={() => deleteNotification(notification._id)}
                      >
                        <Icons.Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
