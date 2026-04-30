'use client';

import { Input } from '@/shared/ui/Input';
import { Icons } from '@/shared/ui/Icons';
import { useTranslations } from 'next-intl';

export interface VariantRow {
  sku: string;
  price: number;
  priceAfterDiscount?: number;
  stock: number;
  attributes: Record<string, unknown>;
  components?: { name: string; value: number; unit: string }[];
  label?: string;
  isActive: boolean;
  _id?: string; // for existing variants in edit mode
}

interface VariantTableProps {
  variants: VariantRow[];
  onChange: (variants: VariantRow[]) => void;
  showComponents?: boolean;
  deletedIds?: string[];
  onMarkForDelete?: (id: string) => void;
  onUnmarkDelete?: (id: string) => void;
  mode?: 'create' | 'edit';
}

export default function VariantTable({
  variants, onChange, deletedIds = [], onMarkForDelete, onUnmarkDelete, mode = 'create',
}: VariantTableProps) {
  const t = useTranslations('products.form');

  const updateVariant = (index: number, field: keyof VariantRow, value: unknown) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeVariant = (index: number) => {
    const variant = variants[index];
    if (mode === 'edit' && variant._id && onMarkForDelete) {
      onMarkForDelete(variant._id);
    } else {
      onChange(variants.filter((_, i) => i !== index));
    }
  };

  // دالة ذكية تقرأ الكائنات (الأرقام والوحدات) والنصوص (الألوان)
  const getAttrLabel = (attrs: Record<string, unknown>) => {
    if (!attrs || Object.keys(attrs).length === 0) return '-';

    return Object.values(attrs)
      .map(val => {
        // إذا كانت القيمة عبارة عن كائن يحتوي على رقم ووحدة
        if (typeof val === 'object' && val !== null && 'value' in val && 'unit' in val) {
          const measure = val as { value: number; unit: string };
          return `${measure.value} ${measure.unit}`;
        }
        // إذا كانت نصاً (مثل اللون)
        return String(val);
      })
      .filter(Boolean)
      .join(' / ') || '-';
  };

  if (variants.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border/40 bg-card shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-2">
          <Icons.Check className="w-5 h-5 text-muted-foreground" />
          <div>
            <h3 className="font-bold text-sm">{t('variantsConfig')}</h3>
            <p className="text-xs text-muted-foreground">{t('variantsDesc')}</p>
          </div>
        </div>
        <span className="text-xs font-bold text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
          {variants.length} variants
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/30">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30 border-b border-border/30">
              <th className="text-left font-bold text-xs uppercase tracking-wider text-muted-foreground px-4 py-3">
                Variant
              </th>
              <th className="text-left font-bold text-xs uppercase tracking-wider text-muted-foreground px-4 py-3">
                {t('sku')}
              </th>
              <th className="text-left font-bold text-xs uppercase tracking-wider text-muted-foreground px-4 py-3">
                {t('price')}
              </th>
              <th className="text-left font-bold text-xs uppercase tracking-wider text-muted-foreground px-4 py-3">
                {t('priceAfterDiscount')}
              </th>
              <th className="text-left font-bold text-xs uppercase tracking-wider text-muted-foreground px-4 py-3">
                {t('stock')}
              </th>
              <th className="w-12 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {variants.map((variant, idx) => {
              const isDeleted = variant._id ? deletedIds.includes(variant._id) : false;
              return (
                <tr
                  key={variant._id || idx}
                  className={`border-b border-border/20 transition-colors ${isDeleted
                      ? 'bg-destructive/5 opacity-50 line-through'
                      : 'hover:bg-muted/20'
                    }`}
                >
                  <td className="px-4 py-3">
                    <span className="font-semibold text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                      {variant.label || getAttrLabel(variant.attributes)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      icon={Icons.Tag}
                      iconColor="text-blue-400"
                      value={variant.sku}
                      onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                      className="h-9 rounded-lg text-xs w-32"
                      disabled={isDeleted}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      icon={Icons.Tag}
                      iconColor="text-emerald-500"
                      type="number"
                      value={variant.price?.toString() || '0'}
                      onChange={(e) => updateVariant(idx, 'price', parseFloat(e.target.value) || 0)}
                      className="h-9 rounded-lg text-xs w-24"
                      min={0}
                      step={0.01}
                      required
                      disabled={isDeleted}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      icon={Icons.Tag}
                      iconColor="text-rose-400"
                      type="number"
                      value={variant.priceAfterDiscount?.toString() || ''}
                      onChange={(e) => updateVariant(idx, 'priceAfterDiscount', parseFloat(e.target.value) || undefined)}
                      className="h-9 rounded-lg text-xs w-24"
                      min={0}
                      step={0.01}
                      placeholder="—"
                      disabled={isDeleted}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      icon={Icons.Box}
                      iconColor="text-orange-500"
                      type="number"
                      value={variant.stock?.toString() || '0'}
                      onChange={(e) => updateVariant(idx, 'stock', parseInt(e.target.value) || 0)}
                      className="h-9 rounded-lg text-xs w-24"
                      min={0}
                      disabled={isDeleted}
                    />
                  </td>
                  <td className="px-4 py-3">
                    {isDeleted ? (
                      <button
                        type="button"
                        onClick={() => variant._id && onUnmarkDelete?.(variant._id)}
                        className="p-1.5 rounded-lg hover:bg-success/10 text-success transition-colors"
                        title="Undo delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removeVariant(idx)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Icons.X className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
