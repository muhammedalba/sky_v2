'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';

export interface ProductComponent {
  name: string;
  value: number;
  unit: string;
}

interface ComponentBuilderProps {
  components: ProductComponent[];
  onChange: (components: ProductComponent[]) => void;
}

export default function ComponentBuilder({ components, onChange }: ComponentBuilderProps) {
  const t = useTranslations('products.form');

  const addComponent = () => {
    onChange([...components, { name: '', value: 0, unit: 'kg' }]);
  };

  const removeComponent = (idx: number) => {
    onChange(components.filter((_, i) => i !== idx));
  };

  const updateComponent = (idx: number, key: keyof ProductComponent, val: string | number) => {
    const newComps = [...components];
    newComps[idx] = { ...newComps[idx], [key]: val };
    onChange(newComps);
  };

  return (
    <div className="rounded-xl border border-border/40 bg-card shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-2 border-b border-border/40 pb-4">
        <Icons.Check className="w-5 h-5 text-muted-foreground" />
        <div>
          <h3 className="font-bold text-sm">
            {t('components')} - <span className="text-muted-foreground font-normal">{t('optional')}</span>
          </h3>
          <p className="text-xs text-muted-foreground">{t('componentsDesc')}</p>
        </div>
      </div>
      <div className="space-y-3">
        {components.map((comp, idx) => (
          <div key={idx} className="flex gap-2 items-center mt-5">
            <Input
              icon={Icons.Edit}
              iconColor="text-violet-500"
              label={t('componentName')}
              value={comp.name}
              onChange={(e) => updateComponent(idx, 'name', e.target.value)}
              className="rounded-xl h-11"
            />
            <Input
              icon={Icons.Plus}
              iconColor="text-emerald-500"
              type="number"
              label={t('componentValue')}
              value={comp.value?.toString() || ''}
              onChange={(e) => updateComponent(idx, 'value', Number(e.target.value))}
              className="rounded-xl h-11"
            />
            <Input
              icon={Icons.Check}
              iconColor="text-sky-500"
              label={t('componentUnit')}
              value={comp.unit}
              onChange={(e) => updateComponent(idx, 'unit', e.target.value)}
              className="rounded-xl h-11"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="shrink-0 h-11 w-11 rounded-xl"
              onClick={() => removeComponent(idx)}
            >
              <Icons.X className="w-5 h-5" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="rounded-xl border-dashed w-full"
          onClick={addComponent}
        >
          <Icons.Plus className="w-4 h-4 mr-2" />
          {t('addComponent')}
        </Button>
      </div>
    </div>
  );
}
