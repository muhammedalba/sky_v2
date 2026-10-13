type Translator = {
  (key: string): string;
  has: (key: string) => boolean;
};

/** "UPDATE_BACKUP_SETTINGS" / "app-versions" → "Update backup settings" / "App versions". */
export function humanize(value: string): string {
  const text = value.replace(/[_-]+/g, ' ').trim().toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Translated label of an audit action or module, falling back to a readable
 * version of the raw value (new actions show up before they get a translation).
 */
export function auditLabel(t: Translator, group: 'actions' | 'modules', value: string): string {
  const key = `${group}.${value}`;
  return t.has(key) ? t(key) : humanize(value);
}

export type AuditBadgeVariant = 'success' | 'info' | 'danger' | 'warning' | 'secondary';

export function actionVariant(action: string): AuditBadgeVariant {
  if (action === 'CREATE' || action === 'ORDER_PLACED' || action === 'PAYMENT_RECEIVED') return 'success';
  if (action === 'DELETE') return 'danger';
  if (action.includes('REFUND')) return 'warning';
  if (action.startsWith('UPDATE')) return 'info';
  return 'secondary';
}

/** Keys of the before/after data, in a stable order (changed keys first). */
export function diffKeys(
  previous: Record<string, unknown> = {},
  next: Record<string, unknown> = {},
): { key: string; changed: boolean }[] {
  const keys = [...new Set([...Object.keys(previous), ...Object.keys(next)])];
  return keys
    .map((key) => ({
      key,
      changed: JSON.stringify(previous[key]) !== JSON.stringify(next[key]),
    }))
    .sort((a, b) => Number(b.changed) - Number(a.changed));
}
