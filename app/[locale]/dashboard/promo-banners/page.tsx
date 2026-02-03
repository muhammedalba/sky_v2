'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePromoBanners, useDeletePromoBanner } from '@/hooks/api/usePromoBanner';
import { Button } from '@/components/ui/Button';
import EntityDataTable from '@/components/dashboard/EntityDataTable';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Icons } from '@/components/ui/Icons';
import { Skeleton } from '@/components/ui/Skeleton';
import { PromoBanner } from '@/types';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useTrans } from '@/hooks/useTrans';

export default function PromoBannersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const router = useRouter();
  const confirmDialog = useConfirmDialog();
  const getTrans = useTrans();

  const { data, isLoading, refetch } = usePromoBanners();
  const deleteMutation = useDeletePromoBanner();

  const handleDelete = async (id: string, text: string) => {
    confirmDialog.openDialog({
      title: 'Delete Banner',
      message: `Are you sure you want to delete "${text}"? This action cannot be undone.`,
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
            Promo Banners
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Manage top-bar announcements
          </p>
        </div>
        <Link href={`/${locale}/dashboard/promo-banners/create`}>
          <Button className="h-11 px-6 font-bold flex items-center gap-2.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95">
            <Icons.Plus className="w-5 h-5" /> 
            Add Banner
          </Button>
        </Link>
      </div>

      <EntityDataTable<PromoBanner>
        data={data?.data}
        isLoading={isLoading}
        page={1}
        onPageChange={() => {}}
        columns={[
          {
            header: "Text (Preview)",
            className: "pl-6",
            render: (item: PromoBanner) => (
              <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                {getTrans(item.text)}
              </span>
            )
          },
          {
            header: "Status",
            render: (item: PromoBanner) => (
              <Badge variant={item.isActive ? 'secondary' : 'destructive'} className="rounded-full px-3 py-0.5 font-bold text-[10px] uppercase tracking-wider">
                {item.isActive ? 'Active' : 'Inactive'}
              </Badge>
            )
          },
          {
            header: "Actions",
            className: "pr-6 text-right",
            render: (item: PromoBanner) => (
              <div className="flex justify-end gap-2.5 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-background/80 hover:bg-primary hover:text-white border border-border/60 rounded-xl px-5 h-9 font-bold shadow-sm transition-all active:scale-95"
                  onClick={() => router.push(`/${locale}/dashboard/promo-banners/${item._id}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="rounded-xl px-5 h-9 font-bold shadow-sm shadow-destructive/10 hover:shadow-destructive/20 transition-all active:scale-95"
                  onClick={() => handleDelete(item._id, getTrans(item.text))}
                  isLoading={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </div>
            )
          }
        ]}
        emptyState={{
          title: "No banners found",
          description: "Announce seasonal offers or important news at the top of your shop.",
          createLink: `/${locale}/dashboard/promo-banners/create`,
          createLabel: "Add Banner"
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
