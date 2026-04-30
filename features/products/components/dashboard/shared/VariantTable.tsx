import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/shared/ui/Input';
import { Icons } from '@/shared/ui/Icons';

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
  globalComponents?: { name: string; value: number; unit: string }[];
}

export default function VariantTable({
  variants, onChange, deletedIds = [], onMarkForDelete, onUnmarkDelete, mode = 'create',
  globalComponents = [],
}: VariantTableProps) {
  const t = useTranslations('products.form');
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

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
              const isExpanded = expandedIdx === idx;

              return (
                <React.Fragment key={variant._id || idx}>
                  <tr
                    className={`border-b border-border/20 transition-colors ${isDeleted
                        ? 'bg-destructive/5 opacity-50 line-through'
                        : 'hover:bg-muted/20'
                      } ${isExpanded ? 'bg-muted/10' : ''}`}
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
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-[10px] font-bold ${variant.components && variant.components.length > 0
                            ? 'border-violet-200 bg-violet-50 text-violet-600'
                            : 'border-border/60 hover:bg-muted text-muted-foreground'
                          }`}
                      >
                        <Icons.Edit className="w-3.5 h-3.5" />
                        <span>{variant.components?.length || 0} Components</span>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
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
                      </div>
                    </td>
                  </tr>

                  {isExpanded && !isDeleted && (
                    <tr>
                      <td colSpan={7} className="px-6 py-6 bg-muted/20 border-b border-border/20">
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-4 bg-primary rounded-full" />
                              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                                {t('variantComponents')}
                                {!variant.components && globalComponents.length > 0 && (
                                  <span className="ml-2 text-[10px] text-muted-foreground font-normal lowercase bg-muted px-1.5 py-0.5 rounded">
                                    ({t('inheritedDefaults')})
                                  </span>
                                )}
                              </h4>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const current = variant.components || globalComponents;
                                updateVariant(idx, 'components', [...current, { name: '', value: 0, unit: 'kg' }]);
                              }}
                              className="text-xs font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 border border-primary/20"
                            >
                              <Icons.Plus className="w-3.5 h-3.5" />
                              {t('addComponent')}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(variant.components || globalComponents).map((comp, cIdx) => (
                              <div
                                key={cIdx}
                                className="bg-card border border-border/40 p-5 rounded-2xl flex flex-col gap-4 relative group shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    const current = variant.components || globalComponents;
                                    updateVariant(idx, 'components', current.filter((_, ci) => ci !== cIdx));
                                  }}
                                  className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:scale-110 z-20"
                                >
                                  <Icons.X className="w-3.5 h-3.5" />
                                </button>

                                <div className="space-y-4 pt-1">
                                  <Input
                                    label={t('componentName')}
                                    icon={Icons.Edit}
                                    iconColor="text-violet-500"
                                    value={comp.name || ''}
                                    onChange={(e) => {
                                      const current = [...(variant.components || globalComponents)];
                                      current[cIdx] = { ...current[cIdx], name: e.target.value };
                                      updateVariant(idx, 'components', current);
                                    }}
                                    className="h-10 rounded-xl bg-background"
                                  />
                                  <div className="grid grid-cols-2 gap-3">
                                    <Input
                                      label={t('componentValue')}
                                      type="number"
                                      icon={Icons.Plus}
                                      iconColor="text-emerald-500"
                                      value={comp.value?.toString() || ''}
                                      onChange={(e) => {
                                        const current = [...(variant.components || globalComponents)];
                                        current[cIdx] = { ...current[cIdx], value: e.target.value === '' ? 0 : Number(e.target.value) };
                                        updateVariant(idx, 'components', current);
                                      }}
                                      className="h-10 rounded-xl bg-background"
                                    />
                                    <Input
                                      label={t('componentUnit')}
                                      icon={Icons.Check}
                                      iconColor="text-sky-500"
                                      value={comp.unit || ''}
                                      onChange={(e) => {
                                        const current = [...(variant.components || globalComponents)];
                                        current[cIdx] = { ...current[cIdx], unit: e.target.value };
                                        updateVariant(idx, 'components', current);
                                      }}
                                      className="h-10 rounded-xl bg-background"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}

                            {(!variant.components || variant.components.length === 0) && globalComponents.length === 0 && (
                              <div className="col-span-full py-10 text-center border-2 border-dashed border-border/40 rounded-3xl bg-muted/10">
                                <div className="flex flex-col items-center gap-3">
                                  <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground">
                                    <Icons.Box className="w-6 h-6" />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-sm font-bold text-muted-foreground">{t('noCustomComponents')}</p>
                                    <p className="text-[10px] text-muted-foreground/60">{t('noCustomComponentsDesc')}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => updateVariant(idx, 'components', [{ name: '', value: 0, unit: 'kg' }])}
                                    className="text-[10px] font-bold text-primary hover:underline mt-2"
                                  >
                                    + {t('addFirstComponent')}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
