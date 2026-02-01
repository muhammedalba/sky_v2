'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCarousel, useDeleteCarousel } from '@/hooks/api/useCarousel';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Icons } from '@/components/ui/Icons';
import { Skeleton } from '@/components/ui/Skeleton';
import ImageWithFallback from '@/components/ui/image/ImageWithFallback';
import { Carousel as CarouselType } from '@/types';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useTrans } from '@/hooks/useTrans';

export default function CarouselPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const router = useRouter();
  const confirmDialog = useConfirmDialog();
  const getTrans = useTrans();

  const { data, isLoading, refetch } = useCarousel();
  const deleteMutation = useDeleteCarousel();

  const handleDelete = async (id: string, description: string) => {
    confirmDialog.openDialog({
      title: 'Delete Slide',
      message: `Are you sure you want to delete slide "${description}"? This action cannot be undone.`,
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Carousel</h1>
          <p className="text-muted-foreground">Manage your home page slider</p>
        </div>
        <Link href={`/${locale}/dashboard/carousel/create`}>
          <Button className="font-semibold flex items-center gap-2">
            <Icons.Menu className="w-4 h-4 rotate-45" /> 
            Add Slide
          </Button>
        </Link>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow>
                <TableHead className="w-[150px] font-bold">Preview (Lg)</TableHead>
                <TableHead className="font-bold">Description</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-20 w-32 rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : data?.data?.length ? (
                data.data.map((item: CarouselType) => (
                  <TableRow key={item._id} className="group hover:bg-secondary/20 transition-colors">
                    <TableCell>
                      <div className="h-20 w-32 rounded-lg bg-secondary/50 overflow-hidden ring-1 ring-border/50 relative">
                        <ImageWithFallback 
                          src={item.carouselLg || ''} 
                          alt="Carousel" 
                          fill
                          className="object-cover" 
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground max-w-xs truncate">
                        {getTrans(item.description)}
                      </div>
                    </TableCell>
                    <TableCell>
                       <Badge variant={item.isActive ? 'default' : 'secondary'}>
                          {item.isActive ? 'Active' : 'Inactive'}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button
                            size="sm"
                            variant="secondary"
                            className="bg-background hover:bg-primary hover:text-white rounded-lg px-4"
                            onClick={() => router.push(`/${locale}/dashboard/carousel/${item._id}/edit`)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="rounded-lg px-4"
                            onClick={() => handleDelete(item._id, getTrans(item.description))}
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
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground font-medium">
                     No slides found.
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
