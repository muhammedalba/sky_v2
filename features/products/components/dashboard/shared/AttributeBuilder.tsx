'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { AllowedAttributeName, ATTRIBUTE_CONFIG, ATTRIBUTE_NAME_OPTIONS } from '@/shared/constants/product-constants';
import { Select } from '@/shared/ui/Select';
import { useToast } from '@/shared/hooks/useToast';

// --- Types & Constants ---
export type AttributeType = 'string' | 'number';

export interface AttributeDefinition {
  id: string;
  name: string;
  type: AttributeType;
  required: boolean;
  allowedValues?: string[];
  allowedUnits?: string[];
}





// --- Sub-Component: AttributeRow ---
// تغليف المكون بـ React.memo لمنع الرندر غير الضروري
const AttributeRow = React.memo(({
  attr, index, onUpdate, onRemove, onAddValue, onRemoveValue
}: {
  attr: AttributeDefinition;
  index: number;
  onUpdate: (index: number, key: keyof AttributeDefinition, val: any) => void;
  onRemove: (index: number) => void;
  onAddValue: (index: number, val: string, target: 'allowedValues' | 'allowedUnits') => void;
  onRemoveValue: (attrIndex: number, valIndex: number, target: 'allowedValues' | 'allowedUnits') => void;
}) => {
  const t = useTranslations('products.form.attributeBuilder');

  const [inputs, setInputs] = useState({ str: '', num: '', unit: '' });
  // جلب الوحدات المتاحة بناءً على اسم الخاصية المختارة
  const availableUnits = attr.name && ATTRIBUTE_CONFIG[attr.name as AllowedAttributeName]
    ? ATTRIBUTE_CONFIG[attr.name as AllowedAttributeName].units
    : []; const handleAction = (type: keyof typeof inputs, target: 'allowedValues' | 'allowedUnits') => {
      const value = inputs[type].trim();
      if (value) {
        // منع إضافة نفس الوحدة أو القيمة مرتين
        const currentList = attr[target] || [];
        const formattedValue = type === 'unit' ? value.toLowerCase() : value; // توحيد حالة الأحرف للوحدات

        if (!currentList.includes(formattedValue)) {
          onAddValue(index, formattedValue, target);
        }
        setInputs(prev => ({ ...prev, [type]: '' }));
      }
    };

  return (
    <div className="p-4 border border-border/50 rounded-xl space-y-4 bg-background/50">
      <div className="relative flex gap-3 items-center">
        <Select
          label={t('attributeNamePlaceholder', { defaultValue: 'Attribute Name' })}
          value={attr.name}
          onChange={(e) => onUpdate(index, 'name', e.target.value)}
          options={ATTRIBUTE_NAME_OPTIONS.map((key) => ({ value: key, label: t(`names.${key}`) }))}
          className="h-10 mt-3"

        />

        <Button
          type="button" variant="destructive" size="icon"
          className="absolute -top-8 -inset-e-7 z-10 h-8 w-8 rounded-full "
          onClick={() => onRemove(index)}
        >
          <Icons.X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {attr.type === 'string' ? (
          <div className="flex gap-2 items-end flex-wrap">
            <Input
              icon={Icons.Plus}
              label={t('valuePlaceholder')}
              value={inputs.str}
              onChange={(e) => setInputs(prev => ({ ...prev, str: e.target.value.trim().toLowerCase() }))}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAction('str', 'allowedValues'))}
              className="rounded-xl h-11 flex-1"
            />
            <Button type="button" onClick={() => handleAction('str', 'allowedValues')} className="rounded-xl h-11">{t('addValue')}</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-s-2 border-primary/20 ps-4 py-1">
            {/* جزء إضافة الأرقام */}
            <div className="flex gap-2 items-end ">
              <Input
                type="number"
                label={t('numberPlaceholder')}
                value={inputs.num}
                onChange={(e) => setInputs(prev => ({ ...prev, num: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAction('num', 'allowedValues'))}
                className="rounded-xl h-11 flex-1"
                icon={Icons.Check}
              />
              <Button type="button" onClick={() => handleAction('num', 'allowedValues')} variant="secondary" className="rounded-xl h-11">{t('addNumber')}</Button>
            </div>

            {/* جزء إضافة الوحدات (تم التحديث ليصبح Select) */}
            <div className="flex gap-2  items-end ">
              <div className="relative flex-1">
                <Select
                  label={t('unitPlaceholder', { defaultValue: 'Unit' })}
                  value={inputs.unit}
                  onChange={(e) => setInputs(prev => ({ ...prev, unit: e.target.value.toLowerCase() }))}
                  options={availableUnits.map((key) => ({ value: key.value, label: key.label }))}

                  disabled={availableUnits.length === 0}

                />
              </div>
              <Button
                type="button"
                onClick={() => handleAction('unit', 'allowedUnits')}
                variant="secondary"
                className="rounded-xl h-11 mb-px" // mb-[1px] لضبط المحاذاة مع الـ Select بعد إضافة الـ Label
                disabled={!inputs.unit} // تعطيل الزر إذا لم يتم اختيار وحدة
              >
                {t('addUnit')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Tags Display */}
      <div className="flex flex-col gap-3 pt-2">
        <TagGroup label={t('valuesLabel')} items={attr.allowedValues} onRemove={(vIdx) => onRemoveValue(index, vIdx, 'allowedValues')} color="primary" />
        {attr.type === 'number' && (
          <TagGroup label={t('unitsLabel')} items={attr.allowedUnits} onRemove={(vIdx) => onRemoveValue(index, vIdx, 'allowedUnits')} color="secondary" />
        )}
      </div>
    </div>
  );
});

// مكون صغير للـ Tags لتقليل تكرار الكود
interface TagGroupProps {
  label: string;
  items?: string[];
  onRemove: (index: number) => void;
  color: 'primary' | 'secondary';
}

const TagGroup = ({ label, items, onRemove, color }: TagGroupProps) => {
  if (!items?.length) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-bold text-muted-foreground w-16">{label}</span>
      {items.map((val: string, i: number) => (
        <span
          key={i}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${color === 'primary'
            ? 'bg-primary/10 text-primary border-primary/20'
            : 'bg-secondary/10 text-secondary-foreground border-secondary/20'
            }`}
        >
          {val}
          <button
            type="button"
            onClick={() => onRemove(i)} // هنا i هو رقم (number)
            className="hover:text-destructive transition-colors"
          >
            <Icons.X className="w-3.5 h-3.5" />
          </button>
        </span>
      ))}
    </div>
  );
};

export default function AttributeBuilder({ attributes, onChange }: { attributes: AttributeDefinition[], onChange: (attrs: AttributeDefinition[]) => void }) {
  const t = useTranslations('products.form.attributeBuilder');
  const toast = useToast();

  const addAttribute = useCallback(() => {
    onChange([...attributes, {
      id: crypto.randomUUID(), // معرف فريد
      name: '',
      type: 'string',
      required: true,
      allowedValues: [],
      allowedUnits: []
    }]);
  }, [attributes, onChange]);

  const updateAttribute = useCallback((index: number, key: keyof AttributeDefinition, val: any) => {
    if (key === 'name') {
      const isDuplicate = attributes.some((attr, i) => i !== index && attr.name === val);
      if (isDuplicate) {
        toast.error(t('duplicateAttributeError', { 
          defaultValue: 'هذه الخاصية موجودة بالفعل، يرجى إضافة القيم الجديدة للخاصية الحالية بدلاً من إنشاء واحدة جديدة.' 
        }));
        return;
      }
    }

    const newAttrs = [...attributes];
    const target = { ...newAttrs[index] };

    if (key === 'name') {
      // قراءة النوع من الـ Config الجديد
      const attrConfig = ATTRIBUTE_CONFIG[val as AllowedAttributeName];
      const newType = attrConfig ? attrConfig.type : 'string';

      if (target.type !== newType) {
        target.allowedValues = [];
        target.allowedUnits = [];
      }
      target.name = val;
      target.type = newType;
    } else {
      (target as any)[key] = val;
    }

    newAttrs[index] = target;
    onChange(newAttrs);
  }, [attributes, onChange, toast, t]);

  const removeAttribute = useCallback((index: number) => {
    onChange(attributes.filter((_, i) => i !== index));
  }, [attributes, onChange]);

  const modifyList = useCallback((
    attrIndex: number,
    val: string | number, // قد يكون القيمة المضافة (string) أو ترتيب العنصر المراد حذفه (number)
    action: 'add' | 'remove',
    targetArray: 'allowedValues' | 'allowedUnits'
  ) => {
    const newAttrs = [...attributes];
    const list = [...(newAttrs[attrIndex][targetArray] || [])];

    if (action === 'add') {
      list.push(val as string);
    } else {
      list.splice(val as number, 1);
    }

    newAttrs[attrIndex] = { ...newAttrs[attrIndex], [targetArray]: list };
    onChange(newAttrs);
  }, [attributes, onChange]);

  return (
    <div className="rounded-xl border border-border/40 bg-card shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-2 border-b border-border/40 pb-4">
        <Icons.Check className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-bold text-sm">{t('title')}</h3>
      </div>
      <div className="space-y-6">
        {attributes.map((attr, index) => (
          <AttributeRow
            key={attr.id || index} // استخدام ID إذا توفر
            attr={attr}
            index={index}
            onUpdate={updateAttribute}
            onRemove={removeAttribute}
            onAddValue={(idx, val, target) => modifyList(idx, val, 'add', target)}
            onRemoveValue={(idx, vIdx, target) => modifyList(idx, vIdx, 'remove', target)}
          />
        ))}
        <Button type="button" variant="outline" className="w-full rounded-xl border-dashed py-6 hover:bg-secondary/50 transition-all" onClick={addAttribute}>
          <Icons.Plus className="w-4 h-4 me-2" /> {t('addNewAttribute')}
        </Button>
      </div>
    </div>
  );
}