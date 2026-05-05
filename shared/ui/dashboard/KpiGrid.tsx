'use client';
import { Card, CardContent } from '@/shared/ui/Card';
import { Icons } from '@/shared/ui/Icons';
import { formatCurrency } from '@/lib/utils';
import type { DashboardData } from './types';

const accentMap = [
  { from: 'from-indigo-500/10', icon: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { from: 'from-violet-500/10', icon: 'text-violet-500', bg: 'bg-violet-500/10' },
  { from: 'from-emerald-500/10', icon: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { from: 'from-amber-500/10', icon: 'text-amber-500', bg: 'bg-amber-500/10' },
  { from: 'from-sky-500/10', icon: 'text-sky-500', bg: 'bg-sky-500/10' },
  { from: 'from-rose-500/10', icon: 'text-rose-500', bg: 'bg-rose-500/10' },
  { from: 'from-teal-500/10', icon: 'text-teal-500', bg: 'bg-teal-500/10' },
  { from: 'from-pink-500/10', icon: 'text-pink-500', bg: 'bg-pink-500/10' },
];

function KpiCard({
  Icon, label, value, sub, accentIdx,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  accentIdx: number;
}) {
  const a = accentMap[accentIdx % accentMap.length];
  return (
    <Card className={`relative overflow-hidden border-none shadow-md bg-background group hover:shadow-xl transition-all duration-300`}>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-br ${a.from} to-transparent`} />
      <CardContent className="p-5 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2.5 rounded-xl ${a.bg}`}>
            <Icon className={`w-5 h-5 ${a.icon}`} />
          </div>
          {sub && <span className="text-[10px] font-semibold text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded-full">{sub}</span>}
        </div>
        <p className="text-2xl font-black tracking-tight text-foreground">{value}</p>
        <p className="text-xs font-medium text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

export function KpiGrid({ d }: { d?: DashboardData }) {
  const oo = d?.orders?.overview;
  const uo = d?.users?.overview;
  const mo = d?.marketingStats?.overview;
  const st = d?.stats;

  const cards = [
    { Icon: Icons.Orders,    label: 'Total Orders (Period)',   value: oo?.currentPeriodOrders ?? 0,            sub: `All: ${oo?.totalOrdersSystemWide ?? 0}` },
    { Icon: Icons.BarChart,  label: 'Total Revenue',           value: formatCurrency(oo?.totalRevenue ?? 0),   sub: `AOV: ${formatCurrency(oo?.averageOrderValue ?? 0)}` },
    { Icon: Icons.Check,     label: 'Valid Orders',            value: oo?.validOrdersCount ?? 0,               sub: undefined },
    { Icon: Icons.Users,     label: 'Total Users',             value: uo?.totalUsers ?? 0,                     sub: `+${uo?.periodNewCustomers ?? 0} new` },
    { Icon: Icons.Coupons,   label: 'Active Coupons',         value: mo?.activeCoupons ?? 0,                  sub: `Total: ${mo?.totalCoupons ?? 0}` },
    { Icon: Icons.BarChart3, label: 'Marketing Cost',          value: formatCurrency(mo?.totalMarketingCost ?? 0), sub: undefined },
    { Icon: Icons.Categories,label: 'Categories',              value: st?.categories ?? 0,                     sub: `Sub: ${st?.subCategories ?? 0}` },
    { Icon: Icons.Brands,    label: 'Brands',                  value: st?.brands ?? 0,                         sub: `Suppliers: ${d?.suppliers?.totalSuppliers ?? 0}` },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => <KpiCard key={i} {...c} accentIdx={i} />)}
    </div>
  );
}
