'use client';

import { use, useState, useEffect } from 'react';
import { useDebounce } from '@/shared/hooks/use-debounce';


import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSuppliers, useDeleteSupplier } from '@/features/suppliers/hooks/useSuppliers';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import EntityDataTable from '@/shared/ui/dashboard/EntityDataTable';
import { Icons } from '@/shared/ui/Icons';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';

import { Supplier } from '@/types';

import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';

export default function SuppliersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [localSearch, setLocalSearch] = useState('');
  const debouncedSearch = useDebounce(localSearch, 500);

  const router = useRouter();
  const confirmDialog = useConfirmDialog();

  const { data, isLoading, refetch } = useSuppliers({ page, limit: 10, keywords: search });
  const deleteMutation = useDeleteSupplier();

  useEffect(() => {
    setSearch(debouncedSearch);
    setPage(1);
  }, [debouncedSearch]);


  const handleDelete = async (id: string, name: string) => {
    confirmDialog.openDialog({
      title: 'Delete Supplier',
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
            Suppliers
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Manage your suppliers and vendors
          </p>
        </div>
        <Link href={`/${locale}/dashboard/suppliers/create`}>
          <Button className="h-11 px-6 font-bold flex items-center gap-2.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95">
            <Icons.Plus className="w-5 h-5" /> 
            Add Supplier
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4 bg-background/50 backdrop-blur-sm p-1 rounded-2xl border border-border/40 shadow-sm w-full max-w-2xl">
        <div className="relative flex-1 group">
           <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
           <Input
             placeholder="Search suppliers..."
             className="pl-11 h-12 w-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/60"
             value={localSearch}
             onChange={(e) => setLocalSearch(e.target.value)}
           />
        </div>
      </div>

      <EntityDataTable<Supplier>
        data={data?.data}
        isLoading={isLoading}
        pagination={data?.meta?.pagination}
        onPageChange={setPage}
        columns={[
          {
            header: "Logo",
            className: "w-[100px] pl-6",
            render: (supplier: Supplier) => (
              <div className="h-14 w-14 rounded-2xl bg-muted/60 overflow-hidden ring-1 ring-border/40 group-hover:ring-primary/30 transition-all shadow-sm group-hover:shadow-md relative">
                <ImageWithFallback 
                  src={supplier.avatar || ''} 
                  alt={supplier.name} 
                  fill
                  sizes="48px"
                  className="object-cover group-hover:scale-110 transition-transform duration-500" 
                />
              </div>
            )
          },
          {
            header: "Name",
            render: (supplier: Supplier) => (
              <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                {supplier.name}
              </span>
            )
          },
          {
            header: "Contact",
            render: (supplier: Supplier) => (
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-foreground/80">{supplier.email}</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter opacity-70 italic">{supplier.phone}</span>
              </div>
            )
          },
          {
            header: "Address",
            render: (supplier: Supplier) => (
              <div className="text-sm font-medium text-muted-foreground truncate max-w-[200px]" title={supplier.address}>
                {supplier.address}
              </div>
            )
          },
          {
            header: "Actions",
            className: "pr-6 text-right",
            render: (supplier: Supplier) => (
              <div className="flex justify-end gap-2.5 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-background/80 hover:bg-primary hover:text-white border border-border/60 rounded-xl px-5 h-9 font-bold shadow-sm transition-all active:scale-95"
                  onClick={() => router.push(`/${locale}/dashboard/suppliers/${supplier._id}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="rounded-xl px-5 h-9 font-bold shadow-sm shadow-destructive/10 hover:shadow-destructive/20 transition-all active:scale-95"
                  onClick={() => handleDelete(supplier._id, supplier.name)}
                  isLoading={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </div>
            )
          }
        ]}
        emptyState={{
          title: "No suppliers found",
          description: "Keep track of your vendors by adding them to your dashboard.",
          createLink: () => router.push(`/${locale}/dashboard/suppliers/create`),
          createLabel: "Add Supplier"
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
