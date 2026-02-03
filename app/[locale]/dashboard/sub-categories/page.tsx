'use client';

import { use, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSubCategories, useDeleteSubCategory } from '@/hooks/api/useSubCategories';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import EntityDataTable from '@/components/dashboard/EntityDataTable';
import { Badge } from '@/components/ui/Badge';
import { Icons } from '@/components/ui/Icons';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTrans } from '@/hooks/useTrans';
import { debounce } from '@/lib/utils';
import { SubCategory, Category } from '@/types';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function SubCategoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const getTrans = useTrans();
  const confirmDialog = useConfirmDialog();

  const { data, isLoading, refetch } = useSubCategories({ page, limit: 10, search });
  const deleteMutation = useDeleteSubCategory();

  const handleSearch = debounce((value: string) => {
    setSearch(value);
    setPage(1);
  }, 500);

  const handleDelete = async (id: string, name: string) => {
    confirmDialog.openDialog({
      title: 'Delete Sub-Category',
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
            Sub Categories
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Manage hierarchy levels
          </p>
        </div>
        <Link href={`/${locale}/dashboard/sub-categories/create`}>
          <Button className="h-11 px-6 font-bold flex items-center gap-2.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95">
            <Icons.Plus className="w-5 h-5" /> 
            Create Sub Category
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4 bg-background/50 backdrop-blur-sm p-1 rounded-2xl border border-border/40 shadow-sm w-full max-w-2xl">
        <div className="relative flex-1 group">
           <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
           <Input
             placeholder="Search sub-categories..."
             className="pl-11 h-12 w-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/60"
             onChange={(e) => handleSearch(e.target.value)}
           />
        </div>
      </div>

      <EntityDataTable<SubCategory>
        data={data?.data}
        isLoading={isLoading}
        metadata={data?.metadata}
        page={page}
        onPageChange={setPage}
        columns={[
          {
            header: "Name",
            className: "pl-6",
            render: (sub: SubCategory) => (
              <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                {getTrans(sub.name)}
              </span>
            )
          },
          {
            header: "Parent Category",
            render: (sub: SubCategory) => (
              <Badge variant="outline" className="rounded-xl bg-muted/40 border-none font-bold text-xs px-3 py-1 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {sub.category && typeof sub.category === 'object' ? getTrans((sub.category as Category).name) : sub.category || '-'}
              </Badge>
            )
          },
          {
            header: "Actions",
            className: "pr-6 text-right",
            render: (sub: SubCategory) => (
              <div className="flex justify-end gap-2.5 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-background/80 hover:bg-primary hover:text-white border border-border/60 rounded-xl px-5 h-9 font-bold shadow-sm transition-all active:scale-95"
                  onClick={() => router.push(`/${locale}/dashboard/sub-categories/${sub._id}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="rounded-xl px-5 h-9 font-bold shadow-sm shadow-destructive/10 hover:shadow-destructive/20 transition-all active:scale-95"
                  onClick={() => handleDelete(sub._id, getTrans(sub.name))}
                  isLoading={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </div>
            )
          }
        ]}
        emptyState={{
          title: "No sub-categories found",
          description: "Organize your catalog by creating sub-categories under main categories.",
          createLink: `/${locale}/dashboard/sub-categories/create`,
          createLabel: "Create Sub Category"
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
