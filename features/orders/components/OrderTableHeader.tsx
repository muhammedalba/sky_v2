'use client';

import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { DownloadIcon, RefreshCwIcon } from '@/shared/ui/Icons';

interface OrderTableHeaderProps {
  totalCount: number;
  onRefresh: () => void;
  onExportAll: () => void;
  isRefreshing: boolean;
}

export default function OrderTableHeader({
  totalCount,
  onRefresh,
  onExportAll,
  isRefreshing,
}: OrderTableHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border/10 pb-4 mb-4">
      {/* Title + Count */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          Orders
        </h1>
        <Badge className="bg-secondary text-secondary-foreground font-black px-2 py-0.5 rounded-lg border-none text-xs">
          {totalCount.toLocaleString()} total
        </Badge>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          isLoading={isRefreshing}
          className="h-10 rounded-xl px-4 gap-1.5 border-border/40 font-bold text-xs"
        >
          {!isRefreshing && <RefreshCwIcon className="w-3.5 h-3.5 text-muted-foreground" />}
          Refresh
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onExportAll}
          className="h-10 rounded-xl px-4 gap-1.5 border-border/40 font-bold text-xs"
        >
          <DownloadIcon className="w-3.5 h-3.5 text-muted-foreground" />
          Export CSV
        </Button>
      </div>
    </div>
  );
}
