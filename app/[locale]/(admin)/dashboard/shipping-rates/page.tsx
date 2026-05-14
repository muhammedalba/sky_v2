'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/Button';
import { useToast } from '@/shared/hooks/useToast';
import { Icons } from '@/shared/ui/Icons';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/shared/ui/Badge';
import { ShippingRate } from '@/features/shipping/types';
import { useDeleteShippingRate, useShippingRates } from '@/features/shipping/hooks/useShippingRates';
import EntityDataTable from '@/shared/ui/dashboard/EntityDataTable';
import Modal from '@/shared/ui/Modal';
import ShippingRateForm from '@/features/shipping/components/dashboard/ShippingRateForm';

export default function ShippingRatesPage() {
  const t = useTranslations('shipping');
  const tCommon = useTranslations('buttons');
  const { success, error } = useToast();

  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<ShippingRate | null>(null);

  const { data, isLoading } = useShippingRates({ page, limit: 10 });
  const { mutate: deleteRate, isPending: isDeleting } = useDeleteShippingRate();

  const handleEdit = (rate: ShippingRate) => {
    setEditingRate(rate);
    setIsFormOpen(true);
  };

  const handleDelete = (rate: ShippingRate) => {
    if (confirm('هل أنت متأكد من حذف هذه التسعيرة؟')) {
      deleteRate(rate._id, {
        onSuccess: () => success('تم الحذف بنجاح'),
        onError: (err: any) => error(err.message || 'حدث خطأ'),
      });
    }
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setEditingRate(null);
  };

  const columns = [
    {
      header: 'شركة الشحن',
      render: (item: ShippingRate) => {
        const provider = item.provider as any;
        const name = typeof provider?.name === 'string' ? provider.name : (provider?.name?.ar || provider?.name?.en || 'غير معروف');
        return (
          <div className="flex items-center gap-3">
            <div className="font-semibold">{name}</div>
          </div>
        );
      },
    },
    {
      header: 'النطاق الجغرافي',
      render: (item: ShippingRate) => {
        const country = (item.country as any)?.name?.ar || (item.country as any)?.name || 'جميع الدول';
        const region = (item.region as any)?.name?.ar || (item.region as any)?.name;
        const city = (item.city as any)?.name?.ar || (item.city as any)?.name;
        
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-primary text-sm">{country}</span>
            {region && <span className="text-xs text-muted-foreground">← {region}</span>}
            {city && <span className="text-xs text-muted-foreground"> ← {city}</span>}
          </div>
        );
      },
    },
    {
      header: 'التسعيرة',
      render: (item: ShippingRate) => (
        <div className="flex flex-col text-sm border-r pr-4">
          <span className="font-bold text-primary">{formatCurrency(item.basePrice)}</span>
          <span className="text-[10px] text-muted-foreground">لأول {item.baseWeight} كجم</span>
          <span className="text-[10px] text-green-600">+{formatCurrency(item.additionalKgPrice)} / كجم إضافي</span>
        </div>
      ),
    },
    {
      header: 'مدة التوصيل',
      render: (item: ShippingRate) => (
        <div className="flex items-center gap-1 text-sm font-medium">
          <Icons.Clock className="w-3.5 h-3.5 text-muted-foreground" />
          {item.estimatedDays || 'غير محدد'}
        </div>
      ),
    },
    {
      header: 'الميزات والحالة',
      render: (item: ShippingRate) => (
        <div className="flex gap-1.5 flex-wrap">
          {item.supportsCOD && <Badge variant="outline" className="text-[10px] border-primary/20 bg-primary/5">COD</Badge>}
          <Badge variant={item.isActive ? 'default' : 'secondary'} className="text-[10px]">
            {item.isActive ? 'مفعل' : 'معطل'}
          </Badge>
        </div>
      ),
    },
    {
      header: 'إجراءات',
      render: (item: ShippingRate) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
            تعديل
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleDelete(item)} disabled={isDeleting}>
            حذف
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('description')}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingRate(null);
            setIsFormOpen(true);
          }}
          className="rounded-xl shadow-lg shadow-primary/20"
        >
          <Icons.Plus className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
          {t('createRate')}
        </Button>
      </div>

      <EntityDataTable
        data={data?.data || []}
        columns={columns}
        isLoading={isLoading}
        pagination={{
          currentPage: page,
          limit: 10,
          numberOfPages: data?.totalPages || 1,
          nextPage: page < (data?.totalPages || 1) ? page + 1 : undefined,
          prevPage: page > 1 ? page - 1 : undefined,
        }}
        onPageChange={setPage}
        emptyState={{
          title: t('empty.title'),
          description: t('empty.description'),
          createLabel: t('createRate'),
          createLink: () => {
            setEditingRate(null);
            setIsFormOpen(true);
          }
        }}
      />

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingRate ? t('editRate') : t('createRate')}
        description={t('modalDescription')}
      >
        <ShippingRateForm
          editingRate={editingRate}
          onSuccess={handleSuccess}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal> 
    </div>
  );
}
