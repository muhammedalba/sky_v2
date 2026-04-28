'use client';

import { use, useState, useEffect } from 'react';
import { useDebounce } from '@/shared/hooks/use-debounce';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCoupons, useDeleteCoupon } from '@/features/marketing/hooks/useCoupons';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import EntityDataTable from '@/shared/ui/dashboard/EntityDataTable';
import { Badge } from '@/shared/ui/Badge';
import { Icons } from '@/shared/ui/Icons';
import { formatDate } from '@/lib/utils';

import { Coupon } from '@/types';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';

export default function CouponsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [localSearch, setLocalSearch] = useState('');
  const debouncedSearch = useDebounce(localSearch, 500);

  const router = useRouter();
  const confirmDialog = useConfirmDialog();

  const { data, isLoading, refetch } = useCoupons({ page, limit: 10, keywords: search });
  const deleteMutation = useDeleteCoupon();

  useEffect(() => {
    setSearch(debouncedSearch);
    setPage(1);
  }, [debouncedSearch]);


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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Coupons
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Manage discounts and promo codes
          </p>
        </div>
        <Link href={`/${locale}/dashboard/coupons/create`}>
          <Button className="h-11 px-6 font-bold flex items-center gap-2.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95">
            <Icons.Plus className="w-5 h-5" /> 
            Create Coupon
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4 bg-background/50 backdrop-blur-sm p-1 rounded-2xl border border-border/40 shadow-sm w-full max-w-2xl">
        <div className="relative flex-1 group">
           <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
           <Input
             placeholder="Search coupons..."
             className="pl-11 h-12 w-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/60"
             value={localSearch}
             onChange={(e) => setLocalSearch(e.target.value)}
           />

        </div>
      </div>

      <EntityDataTable<Coupon>
        data={data?.data}
        isLoading={isLoading}
        pagination={data?.meta?.pagination}
        onPageChange={setPage}
        columns={[
          {
            header: "Code / Name",
            className: "pl-6",
            render: (coupon: Coupon) => (
              <div className="font-bold text-base text-foreground font-mono group-hover:text-primary transition-colors">
                {coupon.name}
              </div>
            )
          },
          {
            header: "Discount",
            render: (coupon: Coupon) => (
              <span className="font-black text-primary text-base">
                {coupon.discount}{coupon.type === 'percentage' ? '%' : ' OFF'}
              </span>
            )
          },
          {
            header: "Usage",
            render: (coupon: Coupon) => (
              <div className="text-sm font-medium text-muted-foreground">
                <span className="text-foreground font-bold">{coupon.used || 0}</span> / <span className="opacity-60">{coupon.limit || '∞'}</span>
              </div>
            )
          },
          {
            header: "Expiry",
            render: (coupon: Coupon) => (
              <div className="text-sm font-bold text-foreground/80 lowercase tracking-tight">
                {formatDate(coupon.expires)}
              </div>
            )
          },
          {
            header: "Status",
            render: (coupon: Coupon) => (
              <Badge variant={coupon.active ? 'secondary' : 'destructive'} className="rounded-full px-3 py-0.5 font-bold text-[10px] uppercase tracking-wider">
                {coupon.active ? 'Active' : 'Inactive'}
              </Badge>
            )
          },
          {
            header: "Actions",
            className: "pr-6 text-right",
            render: (coupon: Coupon) => (
              <div className="flex justify-end gap-2.5 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-background/80 hover:bg-primary hover:text-white border border-border/60 rounded-xl px-5 h-9 font-bold shadow-sm transition-all active:scale-95"
                  onClick={() => router.push(`/${locale}/dashboard/coupons/${coupon._id}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="rounded-xl px-5 h-9 font-bold shadow-sm shadow-destructive/10 hover:shadow-destructive/20 transition-all active:scale-95"
                  onClick={() => handleDelete(coupon._id, coupon.name)}
                  isLoading={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </div>
            )
          }
        ]}
        emptyState={{
          title: "No coupons found",
          description: "Start rewarding your customers by creating discount codes.",
          createLink: `/${locale}/dashboard/coupons/create`,
          createLabel: "Create Coupon"
        }}
      />

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
