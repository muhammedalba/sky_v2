'use client';

import { useCallback, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Can, useCan } from '@/components/auth/Can';
import { Permissions } from '@/features/roles/types';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Select } from '@/shared/ui/Select';
import { Tooltip } from '@/shared/ui/Tooltip';
import { DateRangeFilter, DateRangeParams } from '@/shared/ui/DateRangeFilter';
import { EyeIcon, FilterIcon, LayersIcon } from '@/shared/ui/Icons';
import EntityDataTable from '@/shared/ui/dashboard/EntityDataTable';
import EntityPageHeader from '@/shared/ui/dashboard/EntityPageHeader';
import EntitySearchBar from '@/shared/ui/dashboard/EntitySearchBar';
import { useQueryState } from '@/shared/hooks/useQueryState';
import { formatDateTime } from '@/lib/utils';
import { useAuditFilterOptions, useAuditLogs } from '@/features/audit/hooks/useAuditLogs';
import { AuditLog, AuditLogQuery } from '@/features/audit/types';
import { actionVariant, auditLabel } from '@/features/audit/utils';
import AuditLogDetailsModal from './AuditLogDetailsModal';

const PAGE_SIZE = 20;

/** "YYYY-MM-DD" (local day) → ISO bound of that day. */
const dayBound = (day: string, end: boolean) =>
  day ? new Date(`${day}T${end ? '23:59:59.999' : '00:00:00'}`).toISOString() : undefined;

/**
 * Admin > Audit log: who did what and when, filterable by module, action,
 * user and date. Read-only; the before/after data of an entry needs the
 * separate VIEW_AUDIT_LOG_DETAILS permission (the API enforces both).
 */
export default function AuditLogsPage() {
  const t = useTranslations('audit');
  return (
    <Can
      permission={Permissions.VIEW_AUDIT_LOGS}
      fallback={<p className="p-8 text-center text-muted-foreground">{t('noAccess')}</p>}
    >
      <AuditLogsContent />
    </Can>
  );
}

function AuditLogsContent() {
  const t = useTranslations('audit');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const can = useCan();
  const canViewDetails = can(Permissions.VIEW_AUDIT_LOG_DETAILS);

  // Filters live in the URL so a filtered view can be shared / reloaded
  const { getQueryParam, setQueryParam, setQueryParams } = useQueryState();
  const page = Number(getQueryParam('page', '1')) || 1;
  const moduleFilter = getQueryParam('module', '');
  const action = getQueryParam('action', '');
  const email = getQueryParam('email', '');
  const from = getQueryParam('from', '');
  const to = getQueryParam('to', '');

  const query = useMemo<AuditLogQuery>(
    () => ({
      page,
      limit: PAGE_SIZE,
      module: moduleFilter || undefined,
      action: action || undefined,
      userEmail: email || undefined,
      from: dayBound(from, false),
      to: dayBound(to, true),
    }),
    [page, moduleFilter, action, email, from, to],
  );

  const { data, isLoading, isFetching } = useAuditLogs(query);
  const { data: options } = useAuditFilterOptions();
  const [detailsId, setDetailsId] = useState<string | null>(null);

  const moduleOptions = useMemo(
    () => (options?.modules ?? []).map((m) => ({ value: m, label: auditLabel(t, 'modules', m) })),
    [options, t],
  );
  const actionOptions = useMemo(
    () => (options?.actions ?? []).map((a) => ({ value: a, label: auditLabel(t, 'actions', a) })),
    [options, t],
  );

  const handlePageChange = useCallback((val: number) => setQueryParam('page', val), [setQueryParam]);
  const handleSearch = useCallback(
    (value: string) => setQueryParams({ email: value, page: 1 }),
    [setQueryParams],
  );
  const handleDateApply = useCallback(
    ({ startDate, endDate }: DateRangeParams) =>
      setQueryParams({ from: startDate ?? '', to: endDate ?? '', page: 1 }),
    [setQueryParams],
  );
  const handleDateReset = useCallback(() => setQueryParams({ from: '', to: '', page: 1 }), [setQueryParams]);
  const hasFilters = !!(moduleFilter || action || email || from || to);
  const resetFilters = useCallback(
    () => setQueryParams({ module: '', action: '', email: '', from: '', to: '', page: 1 }),
    [setQueryParams],
  );

  const columns = useMemo(
    () => [
      {
        header: t('fields.date'),
        className: 'ps-6',
        render: (log: AuditLog) => (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDateTime(log.createdAt, locale)}
          </span>
        ),
      },
      {
        header: t('fields.user'),
        render: (log: AuditLog) => (
          <span className="text-sm font-medium break-all" dir="ltr">
            {log.userEmail || <span className="text-muted-foreground">{t('system')}</span>}
          </span>
        ),
      },
      {
        header: t('fields.module'),
        render: (log: AuditLog) => (
          <span className="text-sm whitespace-nowrap">{auditLabel(t, 'modules', log.module)}</span>
        ),
      },
      {
        header: t('fields.action'),
        render: (log: AuditLog) => (
          <Badge variant={actionVariant(log.action)} className="whitespace-nowrap">
            {auditLabel(t, 'actions', log.action)}
          </Badge>
        ),
      },
      {
        header: t('fields.ip'),
        render: (log: AuditLog) => (
          <span className="font-mono text-xs text-muted-foreground" dir="ltr">
            {log.ipAddress || '—'}
          </span>
        ),
      },
      ...(canViewDetails
        ? [
            {
              header: t('fields.details'),
              className: 'pe-6 text-center',
              render: (log: AuditLog) => (
                <div className="flex justify-center">
                  <Tooltip content={t('details.open')}>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={t('details.open')}
                      className="h-10 w-10 rounded-lg hover:bg-primary/10 text-primary"
                      onClick={() => setDetailsId(log._id)}
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                </div>
              ),
            },
          ]
        : []),
    ],
    [t, locale, canViewDetails],
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <EntityPageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        totalResults={tCommon('results.total', {
          count: data?.meta?.pagination?.totalResults || 0,
        })}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 items-center">
        <Select
          aria-label={t('filters.module')}
          label={t('filters.allModules')}
          icon={LayersIcon}
          options={moduleOptions}
          value={moduleFilter}
          onChange={(e) => setQueryParams({ module: e.target.value, page: 1 })}
        />
        <Select
          aria-label={t('filters.action')}
          label={t('filters.allActions')}
          icon={FilterIcon}
          options={actionOptions}
          value={action}
          onChange={(e) => setQueryParams({ action: e.target.value, page: 1 })}
        />
        <div className="flex items-center gap-2">
          <DateRangeFilter onApply={handleDateApply} onReset={handleDateReset} isLoading={isFetching} />
        </div>
        {hasFilters && (
          <Button variant="ghost" onClick={resetFilters} className="justify-self-start">
            {t('filters.reset')}
          </Button>
        )}
      </div>

      <EntitySearchBar
        placeholder={t('filters.emailPlaceholder')}
        onSearch={handleSearch}
        defaultValue={email}
        debounceMs={700}
      />

      <p className="text-xs text-muted-foreground">{t('retentionNote')}</p>

      <EntityDataTable<AuditLog>
        data={data?.data || []}
        isLoading={isLoading}
        pagination={data?.meta?.pagination}
        onPageChange={handlePageChange}
        columns={columns}
        emptyState={{
          title: t('emptyState.title'),
          description: t('emptyState.description'),
        }}
      />

      <AuditLogDetailsModal id={detailsId} onClose={() => setDetailsId(null)} />
    </div>
  );
}
