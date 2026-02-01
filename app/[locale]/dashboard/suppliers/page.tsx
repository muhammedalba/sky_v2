'use client';

import { use, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSuppliers, useDeleteSupplier } from '@/hooks/api/useSuppliers';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import { Icons } from '@/components/ui/Icons';
import { Skeleton } from '@/components/ui/Skeleton';
import ImageWithFallback from '@/components/ui/image/ImageWithFallback';

import { debounce } from '@/lib/utils';
import { Supplier } from '@/types';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function SuppliersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const confirmDialog = useConfirmDialog();

  const { data, isLoading, refetch } = useSuppliers({ page, limit: 10, search });
  const deleteMutation = useDeleteSupplier();

  const handleSearch = debounce((value: string) => {
    setSearch(value);
    setPage(1);
  }, 500);

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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Suppliers</h1>
          <p className="text-muted-foreground">Manage your suppliers and vendors</p>
        </div>
        <Link href={`/${locale}/dashboard/suppliers/create`}>
          <Button className="font-semibold flex items-center gap-2">
            <Icons.Menu className="w-4 h-4 rotate-45" /> 
            Add Supplier
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
           <Icons.Menu className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           <Input
             placeholder="Search suppliers..."
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
                <TableHead className="w-[80px] font-bold">Logo</TableHead>
                <TableHead className="font-bold">Name</TableHead>
                <TableHead className="font-bold">Contact</TableHead>
                <TableHead className="font-bold">Address</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-12 w-12 rounded-xl" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : data?.data?.length ? (
                data.data.map((supplier: Supplier) => (
                  <TableRow key={supplier._id} className="group hover:bg-secondary/20 transition-colors">
                    <TableCell>
                      <div className="h-12 w-12 rounded-xl bg-secondary/50 overflow-hidden ring-1 ring-border/50 relative">
                        <ImageWithFallback 
                          src={supplier.avatar || ''} 
                          alt={supplier.name} 
                          fill
                          className="object-cover" 
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-foreground">{supplier.name}</div>
                    </TableCell>
                    <TableCell>
                       <div className="text-sm">{supplier.email}</div>
                       <div className="text-xs text-muted-foreground">{supplier.phone}</div>
                    </TableCell>
                    <TableCell>
                       <div className="text-sm truncate max-w-[150px]" title={supplier.address}>{supplier.address}</div>
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button
                            size="sm"
                            variant="secondary"
                            className="bg-background hover:bg-primary hover:text-white rounded-lg px-4"
                            onClick={() => router.push(`/${locale}/dashboard/suppliers/${supplier._id}/edit`)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="rounded-lg px-4"
                            onClick={() => handleDelete(supplier._id, supplier.name)}
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
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground font-medium">
                     No suppliers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {data?.metadata && data.metadata.numberOfPages > 1 && (
          <div className="p-4 border-t border-border bg-secondary/10 flex items-center justify-between">
            <p className="text-sm text-muted-foreground font-medium">Page {page}</p>
            <Pagination
              currentPage={page}
              totalPages={data.metadata.numberOfPages}
              onPageChange={setPage}
            />
          </div>
        )}
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
