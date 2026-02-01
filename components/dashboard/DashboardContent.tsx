'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useDashboardStats } from '@/hooks/api/useDashboard';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Icons } from '@/components/ui/Icons';
import { Badge } from '@/components/ui/Badge';
import ImageWithFallback from '@/components/ui/image/ImageWithFallback';

export default function DashboardContent() {
  const t = useTranslations('dashboard');
  const { data, isLoading, error } = useDashboardStats();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-full">
          <Icons.Menu className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">Failed to load dashboard stats</h2>
        <p className="text-muted-foreground">Please check your connection and try again.</p>
      </div>
    );
  }

  const statCards = [
    {
      title: t('stats.totalProducts'),
      value: data?.products?.totalProducts || 0,
      icon: Icons.Products,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/10",
      trend: "+12.5%",
    },
    {
      title: t('stats.totalOrders'),
      value: data?.orders?.totalOrders || 0,
      icon: Icons.Orders,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-900/10",
      trend: "+8.2%",
    },
    {
      title: t('stats.totalRevenue'),
      value: formatCurrency(data?.orders?.totalRevenue || 0),
      icon: Icons.Dashboard, // Using Dashboard as a fallback for revenue/money
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/10",
      trend: "+15.3%",
    },
    {
      title: t('stats.totalUsers'),
      value: data?.users?.totalUsers || 0,
      icon: Icons.Users,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/10",
      trend: "+4.1%",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t('title')}
          </h1>
          <p className="text-muted-foreground">
            {t('welcome')}
          </p>
        </div>
        <div className="flex items-center gap-2">
           <button className="h-9 px-4 bg-background border border-border/60 rounded-lg font-medium text-sm hover:bg-muted/50 transition-colors flex items-center gap-2 shadow-sm">
             <Icons.Menu className="w-4 h-4" />
             Download Report
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="border-none shadow-sm bg-secondary/20">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((stat, i) => (
            <Card key={i} className="group border-none shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden bg-background">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg.split(' ')[0]}/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <CardContent className="p-6 relative z-10">
                 <div className="flex justify-between items-start">
                    <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300 shadow-inner ring-1 ring-inset ring-black/5 dark:ring-white/10`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 border-0 font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                       <span className="text-[10px]">▲</span> {stat.trend}
                    </Badge>
                 </div>
                 <div className="mt-6">
                    <h3 className="text-3xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">{stat.value}</h3>
                     <p className="text-sm font-bold text-muted-foreground mt-1">{stat.title}</p>
                 </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders - Takes 2 columns on desktop */}
        <Card className="lg:col-span-2 border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl font-bold">{t('recentOrders')}</CardTitle>
              <CardDescription>View your latest transactions</CardDescription>
            </div>
            <button className="text-sm font-semibold text-primary hover:underline">View all</button>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               {isLoading ? (
                 Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
               ) : (
                 data?.recentOrders?.length ? (
                   data.recentOrders.map((order: any) => (
                    <div key={order._id} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-sm font-bold border border-border group-hover:bg-primary group-hover:text-white transition-colors">
                          {order.user?.name?.charAt(0) || 'G'}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{order.orderNumber}</p>
                          <p className="text-xs text-muted-foreground">{order.user?.name || 'Guest User'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-sm">{formatCurrency(order.totalOrderPrice || order.total || 0)}</p>
                        <div className="mt-1">
                          <Badge variant={order.isPaid ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 uppercase tracking-tighter">
                            {order.isPaid ? 'Paid' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                   ))
                 ) : (
                   <div className="text-center py-10">
                     <p className="text-muted-foreground">No recent orders found</p>
                   </div>
                 )
               )}
             </div>
          </CardContent>
        </Card>

        {/* Top Products - Takes 1 column on desktop */}
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-xl font-bold">{t('topProducts')}</CardTitle>
            <CardDescription>Most popular items this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {isLoading ? (
                 Array(5).fill(0).map((_, i) => (
                   <div key={i} className="flex gap-4">
                     <Skeleton className="h-12 w-12 rounded-xl" />
                     <div className="flex-1 space-y-2 mt-1">
                       <Skeleton className="h-4 w-full" />
                       <Skeleton className="h-3 w-20" />
                     </div>
                   </div>
                 ))
              ) : (
                data?.topProducts?.length ? (
                  data.topProducts.map((product: any) => (
                    <div key={product._id} className="flex items-center gap-4 group">
                      <div className="relative h-12 w-12 rounded-xl bg-secondary overflow-hidden flex-shrink-0 ring-1 ring-border/50">
                         <ImageWithFallback 
                           src={product.imageCover || ''} 
                           alt={product.title || product.name || 'Product'} 
                           fill
                           sizes="48px"
                           className="object-cover transform group-hover:scale-110 transition-transform duration-300" 
                         />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{product.title || product.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{product.category?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-sm">{formatCurrency(product.price)}</p>
                        <p className="text-[10px] text-green-600 font-bold uppercase">{product.sold || 0} Sold</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No products available</p>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
