'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';

export type AttributeType = 'string' | 'number';

export interface AttributeDefinition {
  name: string;
  type: AttributeType;
  required: boolean;
  allowedValues?: string[]; // للقيم والألوان
  allowedUnits?: string[];  // للوحدات
}

interface AttributeBuilderProps {
  attributes: AttributeDefinition[];
  onChange: (attrs: AttributeDefinition[]) => void;
}

function AttributeRow({
  attr, index, updateAttribute, removeAttribute, addValue, removeValue
}: {
  attr: AttributeDefinition;
  index: number;
  updateAttribute: (index: number, key: keyof AttributeDefinition, val: any) => void;
  removeAttribute: (index: number) => void;
  addValue: (index: number, val: string, targetArray: 'allowedValues' | 'allowedUnits') => void;
  removeValue: (attrIndex: number, valIndex: number, targetArray: 'allowedValues' | 'allowedUnits') => void;
}) {
  const t = useTranslations('products.form.attributeBuilder');
  const [strValue, setStrValue] = useState('');
  const [numValue, setNumValue] = useState('');
  const [unitValue, setUnitValue] = useState('');

  const handleAddString = () => {
    if (strValue.trim()) {
      addValue(index, strValue.trim(), 'allowedValues');
      setStrValue('');
    }
  };

  const handleAddNumber = () => {
    if (numValue.trim()) {
      addValue(index, numValue.trim(), 'allowedValues');
      setNumValue('');
    }
  };

  const handleAddUnit = () => {
    if (unitValue.trim()) {
      addValue(index, unitValue.trim().toLowerCase(), 'allowedUnits');
      setUnitValue('');
    }
  };

  return (
    <div className="p-4 border border-border/50 rounded-xl space-y-4 bg-background/50">
      {/* ─── Header ─── */}
      <div className="flex gap-3 items-center">
        <Input
          icon={Icons.Edit}
          iconColor="text-cyan-500"
          label={t('attributeNamePlaceholder')}
          value={attr.name}
          onChange={(e) => updateAttribute(index, 'name', e.target.value)}
          className="flex-1 rounded-xl h-11"
        />
        <div className="relative">
          <select
            value={attr.type}
            onChange={(e) => updateAttribute(index, 'type', e.target.value as AttributeType)}
            className="h-11 px-3 rounded-xl border border-input bg-secondary/30 text-sm appearance-none min-w-[140px] focus:outline-none focus:border-primary/50"
          >
            <option value="string">{t('typeString')}</option>
            <option value="number">{t('typeNumber')}</option>
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground">
            <Icons.ChevronDown className="w-4 h-4" />
          </div>
        </div>
        <Button 
          type="button" variant="destructive" size="icon" 
          className="h-11 w-11 rounded-xl shrink-0" 
          onClick={() => removeAttribute(index)}
        >
          <Icons.X className="w-4 h-4" />
        </Button>
      </div>

      {/* ─── Inputs ─── */}
      <div className="flex flex-col gap-3">
        {attr.type === 'string' ? (
          <div className="flex gap-2 items-end">
            <Input
              icon={Icons.Plus}
              iconColor="text-green-500"
              label={t('valuePlaceholder')}
              value={strValue}
              onChange={(e) => setStrValue(e.target.value)}
              className="rounded-xl h-11 flex-1"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddString())}
            />
            <Button type="button" onClick={handleAddString} className="rounded-xl h-11">{t('addValue')}</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-l-2 border-primary/20 pl-4 py-1">
            <div className="flex gap-2 items-end">
              <Input
                type="number"
                label={t('numberPlaceholder')}
                value={numValue}
                onChange={(e) => setNumValue(e.target.value)}
                className="rounded-xl h-11 flex-1"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNumber())}
              />
              <Button type="button" onClick={handleAddNumber} variant="secondary" className="rounded-xl h-11">{t('addNumber')}</Button>
            </div>
            <div className="flex gap-2 items-end">
              <Input
                label={t('unitPlaceholder')}
                value={unitValue}
                onChange={(e) => setUnitValue(e.target.value)}
                className="rounded-xl h-11 flex-1"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUnit())}
              />
              <Button type="button" onClick={handleAddUnit} variant="secondary" className="rounded-xl h-11">{t('addUnit')}</Button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Display Tags ─── */}
      <div className="flex flex-col gap-3 pt-2">
        {/* القيم (تُعرض للنصوص والأرقام) */}
        {attr.allowedValues && attr.allowedValues.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-muted-foreground w-16">{t('valuesLabel')}</span>
            {attr.allowedValues.map((val, vIdx) => (
              <span key={`val-${vIdx}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                {val}
                <button type="button" onClick={(e) => { e.preventDefault(); removeValue(index, vIdx, 'allowedValues'); }} className="hover:text-destructive"><Icons.X className="w-3.5 h-3.5" /></button>
              </span>
            ))}
          </div>
        )}

        {/* الوحدات (تُعرض فقط للنوع Number) */}
        {attr.type === 'number' && attr.allowedUnits && attr.allowedUnits.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-muted-foreground w-16">{t('unitsLabel')}</span>
            {attr.allowedUnits.map((val, vIdx) => (
              <span key={`unit-${vIdx}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary-foreground text-sm font-medium border border-secondary/20">
                {val}
                <button type="button" onClick={(e) => { e.preventDefault(); removeValue(index, vIdx, 'allowedUnits'); }} className="hover:text-destructive"><Icons.X className="w-3.5 h-3.5" /></button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AttributeBuilder({ attributes, onChange }: AttributeBuilderProps) {
  const t = useTranslations('products.form.attributeBuilder');

  const addAttribute = () => {
    onChange([...attributes, { name: '', type: 'string', required: true, allowedValues: [], allowedUnits: [] }]);
  };

  const updateAttribute = (index: number, key: keyof AttributeDefinition, val: any) => {
    const newAttrs = [...attributes];
    if (key === 'type' && newAttrs[index].type !== val) {
      newAttrs[index].allowedValues = [];
      newAttrs[index].allowedUnits = [];
    }
    newAttrs[index] = { ...newAttrs[index], [key]: val };
    onChange(newAttrs);
  };

  const removeAttribute = (index: number) => {
    onChange(attributes.filter((_, i) => i !== index));
  };

  const addValue = (index: number, val: string, targetArray: 'allowedValues' | 'allowedUnits') => {
    const newAttrs = [...attributes];
    const list = newAttrs[index][targetArray] || [];
    newAttrs[index] = { ...newAttrs[index], [targetArray]: [...list, val] };
    onChange(newAttrs);
  };

  const removeValue = (attrIndex: number, valIndex: number, targetArray: 'allowedValues' | 'allowedUnits') => {
    const newAttrs = [...attributes];
    const list = newAttrs[attrIndex][targetArray] || [];
    newAttrs[attrIndex] = { ...newAttrs[attrIndex], [targetArray]: list.filter((_, i) => i !== valIndex) };
    onChange(newAttrs);
  };

  return (
    <div className="rounded-xl border border-border/40 bg-card shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-2 border-b border-border/40 pb-4">
        <Icons.Check className="w-5 h-5 text-muted-foreground" />
        <div>
          <h3 className="font-bold text-sm">{t('title')}</h3>
        </div>
      </div>
      <div className="space-y-6">
        {attributes.map((attr, index) => (
          <AttributeRow key={index} attr={attr} index={index} updateAttribute={updateAttribute} removeAttribute={removeAttribute} addValue={addValue} removeValue={removeValue} />
        ))}
        <Button type="button" variant="outline" className="w-full rounded-xl border-dashed" onClick={addAttribute}>
          <Icons.Plus className="w-4 h-4 mr-2" /> {t('addNewAttribute')}
        </Button>
      </div>
    </div>
  );
}

