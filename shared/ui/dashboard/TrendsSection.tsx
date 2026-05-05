'use client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import type { DashboardData } from './types';

const tooltipStyle = {
  backgroundColor: 'hsl(var(--background))',
  borderRadius: '10px',
  border: '1px solid hsl(var(--border))',
  boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
  fontSize: 12,
};

const fmt = (d: string) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

function AreaCard({
  title, desc, data, dataKey, color, gradId,
}: {
  title: string; desc: string;
  data: { date: string; count: number }[];
  dataKey: string; color: string; gradId: string;
}) {
  return (
    <Card className="border-none shadow-md bg-background">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold">{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">No data for this period</div>
        ) : (
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={11} tick={{ fill: '#94a3b8' }} tickFormatter={fmt} />
                <YAxis axisLine={false} tickLine={false} fontSize={11} tick={{ fill: '#94a3b8' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} fill={`url(#${gradId})`} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TrendsSection({ d }: { d?: DashboardData }) {
  const periodLabel = d?.orders?.dateRange
    ? `${new Date(d.orders.dateRange.start).toLocaleDateString()} – ${new Date(d.orders.dateRange.end).toLocaleDateString()}`
    : 'Current period';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AreaCard
        title="Daily Orders"
        desc={periodLabel}
        data={d?.orders?.dailyOrders ?? []}
        dataKey="count"
        color="#6366f1"
        gradId="ordersGrad"
      />
      <AreaCard
        title="User Registrations"
        desc={d?.users?.dateRange
          ? `${new Date(d.users.dateRange.start).toLocaleDateString()} – ${new Date(d.users.dateRange.end).toLocaleDateString()}`
          : 'Current period'}
        data={d?.users?.dailyRegistrations ?? []}
        dataKey="count"
        color="#22c55e"
        gradId="regGrad"
      />
    </div>
  );
}
