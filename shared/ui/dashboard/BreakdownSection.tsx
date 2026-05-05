'use client';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { CHART_COLORS } from './types';
import type { DashboardData } from './types';

const tooltipStyle = {
  backgroundColor: 'hsl(var(--background))',
  borderRadius: '10px',
  border: '1px solid hsl(var(--border))',
  boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
  fontSize: 12,
};

const STATUS_COLOR: Record<string, string> = {
  active: '#22c55e',
  inactive: '#f59e0b',
  pending: '#f59e0b',
  delivered: '#22c55e',
  cancelled: '#ef4444',
  processing: '#6366f1',
  shipped: '#14b8a6',
  returned: '#ec4899',
  null: '#94a3b8',
};

function DonutCard({ title, data }: { title: string; data: { name: string; value: number }[] }) {
  return (
    <Card className="border-none shadow-md bg-background">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">
                {data.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLOR[entry.name.toLowerCase()] ?? CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-xs text-foreground capitalize">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2 justify-center">
          {data.map((r, i) => (
            <Badge key={r.name} variant="secondary" className="text-[10px] capitalize gap-1">
              <span className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: STATUS_COLOR[r.name.toLowerCase()] ?? CHART_COLORS[i % CHART_COLORS.length] }} />
              {r.name}: {r.value}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function BreakdownSection({ d }: { d?: DashboardData }) {
  const roleData = Object.entries(d?.users?.roleBreakdown ?? {}).map(([name, value]) => ({ name, value }));

  const statusData = Object.entries(d?.users?.statusBreakdown ?? {})
    .map(([name, value]) => ({ name: name === 'null' ? 'unverified' : name, value }));

  const orderStatusData = Object.entries(d?.orders?.statusBreakdown ?? {})
    .map(([name, value]) => ({ name, value }));

  const salesData = d?.marketingStats?.salesBreakdown
    ? [
        {
          name: 'Organic',
          orders: d.marketingStats.salesBreakdown.organic.orders,
          revenue: d.marketingStats.salesBreakdown.organic.revenue,
          discount: d.marketingStats.salesBreakdown.organic.discount,
        },
        {
          name: 'Marketing',
          orders: d.marketingStats.salesBreakdown.marketing.orders,
          revenue: d.marketingStats.salesBreakdown.marketing.revenue,
          discount: d.marketingStats.salesBreakdown.marketing.discount,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Row 1: 3 pies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <DonutCard title="User Roles" data={roleData} />
        <DonutCard title="User Status" data={statusData} />
        <DonutCard title="Order Status" data={orderStatusData.length > 0 ? orderStatusData : [{ name: 'No orders', value: 1 }]} />
      </div>

      {/* Row 2: Sales channels bar */}
      <Card className="border-none shadow-md bg-background">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">Sales Channels Comparison</CardTitle>
          <CardDescription>
            Organic vs Marketing — Revenue, Orders & Discounts
            {d?.marketingStats?.period && (
              <span className="ms-2 text-[11px] text-muted-foreground">
                ({new Date(d.marketingStats.period.start).toLocaleDateString()} – {new Date(d.marketingStats.period.end).toLocaleDateString()})
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} fontSize={11} tick={{ fill: '#94a3b8' }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v, name) => [
                  name === 'revenue' ? formatCurrency(Number(v)) : v, name
                ]} />
                <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-xs text-foreground capitalize">{v}</span>} />
                <Bar dataKey="orders" name="Orders" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="revenue" name="Revenue" fill="#22c55e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="discount" name="Discount" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
