'use client';

import { useLocale, useTranslations } from 'next-intl';
import Modal from '@/shared/ui/Modal';
import { Badge } from '@/shared/ui/Badge';
import Spinner from '@/shared/ui/Spinner';
import { formatDateTime } from '@/lib/utils';
import { useAuditLogDetails } from '@/features/audit/hooks/useAuditLogs';
import { actionVariant, auditLabel, diffKeys } from '@/features/audit/utils';

interface AuditLogDetailsModalProps {
  id: string | null;
  onClose: () => void;
}

function Value({ value }: { value: unknown }) {
  if (value === undefined || value === null || value === '') {
    return <span className="text-muted-foreground">—</span>;
  }
  if (typeof value === 'object') {
    return (
      <pre className="text-[11px] leading-relaxed whitespace-pre-wrap break-all max-h-48 overflow-auto" dir="ltr">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }
  return (
    <span className="break-all" dir="auto">
      {String(value)}
    </span>
  );
}

/**
 * Before / after data of one audit entry. Sensitive fields (passwords,
 * tokens, secrets) arrive already redacted by the server.
 */
export default function AuditLogDetailsModal({ id, onClose }: AuditLogDetailsModalProps) {
  const t = useTranslations('audit');
  const locale = useLocale();
  const { data: entry, isLoading, isError } = useAuditLogDetails(id);

  const rows = entry ? diffKeys(entry.previousData, entry.newData) : [];

  return (
    <Modal isOpen={!!id} onClose={onClose} title={t('details.title')} size="xl">
      {isLoading && (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      )}

      {isError && <p className="py-6 text-center text-destructive">{t('details.error')}</p>}

      {entry && (
        <div className="space-y-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">{t('fields.action')}</dt>
              <dd className="mt-1">
                <Badge variant={actionVariant(entry.action)}>{auditLabel(t, 'actions', entry.action)}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">{t('fields.module')}</dt>
              <dd className="mt-1 font-medium">{auditLabel(t, 'modules', entry.module)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">{t('fields.user')}</dt>
              <dd className="mt-1 font-medium break-all" dir="ltr">
                {entry.userEmail || t('system')}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">{t('fields.date')}</dt>
              <dd className="mt-1">{formatDateTime(entry.createdAt, locale)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">{t('fields.ip')}</dt>
              <dd className="mt-1 font-mono text-xs" dir="ltr">
                {entry.ipAddress || '—'}
              </dd>
            </div>
          </dl>

          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{t('details.noData')}</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground">
                  <tr>
                    <th className="p-2 text-start font-semibold">{t('details.field')}</th>
                    <th className="p-2 text-start font-semibold">{t('details.before')}</th>
                    <th className="p-2 text-start font-semibold">{t('details.after')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ key, changed }) => (
                    <tr key={key} className={`border-t border-border align-top ${changed ? 'bg-warning/5' : ''}`}>
                      <td className="p-2 font-mono text-xs whitespace-nowrap" dir="ltr">
                        {key}
                      </td>
                      <td className="p-2 text-destructive/90">
                        <Value value={entry.previousData?.[key]} />
                      </td>
                      <td className="p-2 text-success">
                        <Value value={entry.newData?.[key]} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
