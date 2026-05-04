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
  unrestorableIds?: string[];
  onMarkForDelete?: (id: string) => void;
  onUnmarkDelete?: (id: string) => void;
  mode?: 'create' | 'edit';
  errors?: any;
}

export default function VariantTable({
  variants,
  onChange,
  deletedIds = [],
  unrestorableIds = [],
  onMarkForDelete,
  onUnmarkDelete,
  errors,
  mode = 'create',
}: VariantTableProps) {
  const t = useTranslations('products.form');
  const tError = (msg?: string) => msg ? (msg.startsWith('validation.') ? t(msg) : msg) : undefined;
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  console.log(errors);

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
      const updated = variants.filter((_, i) => i !== index);
      onChange(updated);
    }
  };

  const getAttrLabel = (attrs: Record<string, any>) => {
    return Object.entries(attrs).map(([k, v]) => {
      if (typeof v === 'object' && v !== null && 'value' in v) {
        const val = v as { value: any; unit?: string };
        return `${val.value}-${val.unit ? ` ${val.unit}` : ''}`;
      }
      return v;
    }).join('/') || 'Default';
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm">
      <div className="overflow-x-auto overflow-y-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/40 bg-muted/30 text-center">
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('attributes')}</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('sku')}</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('price')}</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('priceAfterDiscount')}</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('stock')}</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {variants.map((variant, idx) => {
              const isDeleted = variant._id && deletedIds.includes(variant._id);
              const isUnrestorable = variant._id && unrestorableIds.includes(variant._id);
              const isExpanded = expandedIdx === idx;

              return (
                <React.Fragment key={variant._id || idx}>
                  <tr className={`group transition-colors ${isDeleted ? 'bg-destructive/5' : 'hover:bg-muted/30'} ${isExpanded ? 'bg-muted/20' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`font-semibold text-sm  ${isDeleted ? 'line-through text-muted-foreground' : 'title-gradient'}`}>
                          {variant.label || getAttrLabel(variant.attributes)}
                        </span>
                        <div className="flex gap-1.5 flex-wrap">
                          {Object.entries(variant.attributes).map(([k, v]) => (
                            <span key={k} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-medium border border-border/40">
                              {k}: {typeof v === 'object' && v !== null && 'value' in v 
                                ? `${(v as any).value}${(v as any).unit ? ` ${(v as any).unit}` : ''}` 
                                : String(v)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Input
                        value={variant.sku}
                        onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                        placeholder="SKU-123"
                        disabled={!!isDeleted}
                        className="h-9 min-w-[120px] bg-background text-xs font-mono"
                        error={tError(errors?.[idx]?.sku?.message)}

                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <Input
                          type="number"
                          value={variant.price?.toString() || ''}
                          onChange={(e) => updateVariant(idx, 'price', Number(e.target.value))}
                          placeholder="0.00"
                          disabled={!!isDeleted}
                          className="h-9 w-24 bg-background text-xs font-bold"
                          error={tError(errors?.[idx]?.price?.message)}

                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <Input
                          type="number"
                          value={variant.priceAfterDiscount?.toString() || ''}
                          onChange={(e) => updateVariant(idx, 'priceAfterDiscount', Number(e.target.value))}
                          placeholder="0.00"
                          disabled={!!isDeleted}
                          className="h-9 w-24 bg-background text-xs font-bold"
                          error={tError(errors?.[idx]?.priceAfterDiscount?.message)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Input
                        type="number"
                        value={variant.stock?.toString() || ''}
                        onChange={(e) => updateVariant(idx, 'stock', Number(e.target.value))}
                        placeholder="0"
                        disabled={!!isDeleted}
                        className="h-9 w-20 bg-background text-xs font-bold"
                        error={tError(errors?.[idx]?.stock?.message)}

                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                          className={`p-2 rounded-lg transition-all ${isExpanded ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'bg-muted text-muted-foreground hover:bg-border'}`}
                          title="Manage Components"
                        >
                          <Icons.Box className="w-4 h-4" />
                        </button>

                        {isDeleted ? (
                          !isUnrestorable && (
                            <button
                              type="button"
                              onClick={() => onUnmarkDelete && onUnmarkDelete(variant._id!)}
                              className="p-2 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                              title={t('restoreProduct')}
                            >
                              <Icons.Restore className="w-4 h-4" />
                            </button>
                          )
                        ) : (
                          <button
                            type="button"
                            onClick={() => removeVariant(idx)}
                            className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                            title={t('deleteVariant')}
                          >
                            <Icons.Trash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Components Section */}
                  {isExpanded && !isDeleted && (
                    <tr className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <td colSpan={5} className="px-6 py-6 bg-muted/20 border-b border-border/20">
                        <div className="space-y-6">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-4 bg-primary rounded-full" />
                              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                                {t('variantComponents')}
                              </h4>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                updateVariant(idx, 'components', [...(variant.components || []), { name: '', value: 0, unit: 'kg' }]);
                              }}
                              className="text-xs font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 border border-primary/20"
                            >
                              <Icons.Plus className="w-3.5 h-3.5" />
                              {t('addComponent')}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(variant.components || []).map((comp, cIdx) => (
                              <div
                                key={cIdx}
                                className="bg-card border border-border/40 p-5 rounded-2xl flex flex-col gap-4 relative group shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateVariant(idx, 'components', (variant.components || []).filter((_, ci) => ci !== cIdx));
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
                                      const current = [...(variant.components || [])];
                                      current[cIdx] = { ...current[cIdx], name: e.target.value };
                                      updateVariant(idx, 'components', current);
                                    }}
                                    className="h-10 rounded-xl bg-background"
                                    error={tError(errors?.[idx]?.components?.[cIdx]?.name?.message)}
                                  />
                                  <div className="grid grid-cols-2 gap-3">
                                    <Input
                                      label={t('componentValue')}
                                      type="number"
                                      icon={Icons.Plus}
                                      iconColor="text-emerald-500"
                                      value={comp.value?.toString() || ''}
                                      onChange={(e) => {
                                        const current = [...(variant.components || [])];
                                        current[cIdx] = { ...current[cIdx], value: e.target.value === '' ? 0 : Number(e.target.value) };
                                        updateVariant(idx, 'components', current);
                                      }}
                                      className="h-10 rounded-xl bg-background"
                                      error={tError(errors?.[idx]?.components?.[cIdx]?.value?.message)}
                                    />
                                    <Input
                                      label={t('componentUnit')}
                                      icon={Icons.Check}
                                      iconColor="text-sky-500"
                                      value={comp.unit || ''}
                                      onChange={(e) => {
                                        const current = [...(variant.components || [])];
                                        current[cIdx] = { ...current[cIdx], unit: e.target.value };
                                        updateVariant(idx, 'components', current);
                                      }}
                                      className="h-10 rounded-xl bg-background"
                                      error={tError(errors?.[idx]?.components?.[cIdx]?.unit?.message)}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}

                            {(!variant.components || variant.components.length === 0) && (
                              <div className="col-span-full py-10 text-center border-2 border-dashed border-border/40 rounded-3xl bg-muted/10">
                                <div className="flex flex-col items-center gap-3">
                                  <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground">
                                    <Icons.Box className="w-6 h-6" />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-sm font-bold text-muted-foreground">{t('noCustomComponents')}</p>
                                    <p className="text-[10px] text-muted-foreground/60">{t('addFirstComponent')}</p>
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
