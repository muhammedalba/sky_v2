'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCoupons, useDeleteCoupon } from '@/hooks/api/useCoupons';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Pagination from '@/components/ui/Pagination';
import { Icons } from '@/components/ui/Icons';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate, debounce } from '@/lib/utils';
import { Coupon } from '@/types';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function CouponsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const confirmDialog = useConfirmDialog();

  const { data, isLoading, refetch } = useCoupons({ page, limit: 10, search });
  const deleteMutation = useDeleteCoupon();

  const handleSearch = debounce((value: string) => {
    setSearch(value);
    setPage(1);
  }, 500);

  const handleDelete = async (id: string, name: string) => {
    confirmDialog.openDialog({
      title: 'Delete Coupon',
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id);
        refetch();
      },
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Coupons</h1>
          <p className="text-muted-foreground">Manage discounts and promo codes</p>
        </div>
        <Link href={`/${locale}/dashboard/coupons/create`}>
          <Button className="font-semibold flex items-center gap-2">
            <Icons.Menu className="w-4 h-4 rotate-45" /> 
            Create Coupon
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4">
         <div className="relative flex-1 max-w-sm">
           <Icons.Menu className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           <Input
             placeholder="Search coupons..."
             className="pl-9 h-10 w-full"
             onChange={(e) => handleSearch(e.target.value)}
           />
        </div>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow>
                <TableHead className="font-bold">Code / Name</TableHead>
                <TableHead className="font-bold">Discount</TableHead>
                <TableHead className="font-bold">Usage</TableHead>
                <TableHead className="font-bold">Expiry</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : data?.data?.length ? (
                data.data.map((coupon: Coupon) => (
                  <TableRow key={coupon._id} className="group hover:bg-secondary/20 transition-colors">
                    <TableCell>
                      <div className="font-bold text-foreground font-mono">{coupon.name}</div>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-primary">
                         {coupon.discount}{coupon.type === 'percentage' ? '%' : ' OFF'}
                      </span>
                    </TableCell>
                    <TableCell>
                       <div className="text-sm text-muted-foreground">{coupon.used || 0} / {coupon.limit || '∞'}</div>
                    </TableCell>
                    <TableCell>
                       <div className="text-sm">{formatDate(coupon.expires)}</div>
                    </TableCell>
                    <TableCell>
                       <Badge variant={coupon.active ? 'secondary' : 'destructive'}>
                          {coupon.active ? 'Active' : 'Inactive'}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button
                            size="sm"
                            variant="secondary"
                            className="bg-background hover:bg-primary hover:text-white rounded-lg px-4"
                            onClick={() => router.push(`/${locale}/dashboard/coupons/${coupon._id}/edit`)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="rounded-lg px-4"
                            onClick={() => handleDelete(coupon._id, coupon.name)}
                            isLoading={deleteMutation.isPending}
                          >
                            Delete
                          </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground font-medium">
                     No coupons found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.closeDialog}
        onConfirm={confirmDialog.handleConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={confirmDialog.isLoading}
      />
    </div>
  );
}
