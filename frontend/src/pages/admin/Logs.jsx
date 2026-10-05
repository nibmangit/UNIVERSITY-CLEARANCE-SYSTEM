import { useCallback, useState } from 'react';

import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Input from '../../components/ui/Input';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import SearchInput from '../../components/ui/SearchInput';
import Select from '../../components/ui/Select';
import Table from '../../components/ui/Table';
import { useApi } from '../../hooks/useApi';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { adminService } from '../../services/adminService';
import { entityLabel, humanizeAction } from '../../utils/auditLog';
import { AUDIT_LOG_COLUMNS } from './auditLogColumns';

const PAGE_SIZE = 20;

const EMPTY_FILTERS = { search: '', action: '', entityType: '', role: '', dateFrom: '', dateTo: '' };

const ROLE_OPTIONS = [
  { value: '', label: 'All roles' },
  { value: 'OFFICER', label: 'Officer' },
  { value: 'REGISTRAR', label: 'Registrar' },
  { value: 'ADMIN', label: 'Admin' },
];

export default function Logs() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(filters.search, 300);

  // Only used for the filter options (the actions and record types that really exist).
  const { data: meta, reload: reloadMeta } = useApi(adminService.auditLogMeta);

  const { action, entityType, role, dateFrom, dateTo } = filters;
  const fetcher = useCallback(
    (options) =>
      adminService.listAuditLogs(
        {
          page,
          page_size: PAGE_SIZE,
          search: debouncedSearch.trim(),
          action,
          entity_type: entityType,
          role,
          date_from: dateFrom,
          date_to: dateTo,
        },
        options,
      ),
    [page, debouncedSearch, action, entityType, role, dateFrom, dateTo],
  );
  const { data, loading, error, reload } = useApi(fetcher);

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
    setPage(1);
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }

  function refresh() {
    reload();
    reloadMeta();
  }

  const hasFilters = Object.values(filters).some(Boolean);
  const dateError = dateFrom && dateTo && dateFrom > dateTo ? 'The end date is before the start date.' : '';

  const actionOptions = [
    { value: '', label: 'All actions' },
    ...(meta?.actions ?? []).map((code) => ({ value: code, label: humanizeAction(code) })),
  ];
  const recordOptions = [
    { value: '', label: 'All records' },
    ...(meta?.entity_types ?? []).map((type) => ({ value: type, label: entityLabel(type) })),
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Dashboard', to: '/admin' }, { label: 'Activity log' }]}
        title="Activity log"
        description="Every recorded action, newest first."
        actions={
          <Button variant="secondary" onClick={refresh} loading={loading && Boolean(data)}>
            Refresh
          </Button>
        }
      />

      <Card>
        <div className="space-y-4">
          <SearchInput
            className="max-w-xl"
            value={filters.search}
            onChange={(value) => updateFilter('search', value)}
            label="Search the activity log"
            placeholder="Search by user, ID, details or record number"
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Select
              label="Action"
              options={actionOptions}
              value={action}
              onChange={(event) => updateFilter('action', event.target.value)}
            />
            <Select
              label="Record type"
              options={recordOptions}
              value={entityType}
              onChange={(event) => updateFilter('entityType', event.target.value)}
            />
            <Select
              label="Role"
              options={ROLE_OPTIONS}
              value={role}
              onChange={(event) => updateFilter('role', event.target.value)}
            />
            <Input
              label="From"
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(event) => updateFilter('dateFrom', event.target.value)}
            />
            <Input
              label="To"
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              error={dateError}
              onChange={(event) => updateFilter('dateTo', event.target.value)}
            />
          </div>

          {hasFilters && (
            <div>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </Card>

      {error ? (
        <Card className="mt-6">
          <ErrorState error={error} onRetry={() => (error.status === 404 ? setPage(1) : reload())} />
        </Card>
      ) : (
        <>
          {data && (
            <p className="mt-6 mb-2 text-sm text-slate-600" aria-live="polite">
              {data.count} {data.count === 1 ? 'entry' : 'entries'}
              {hasFilters ? ' match your filters' : ''}
            </p>
          )}

          <Card padded={false} className={loading && data ? 'opacity-60 transition-opacity' : undefined}>
            <Table
              caption="Activity log"
              columns={AUDIT_LOG_COLUMNS}
              rows={data?.results ?? []}
              loading={loading && !data}
              skeletonRows={6}
              emptyState={
                hasFilters ? (
                  <EmptyState
                    title="No matching entries"
                    message="Try different filters or a wider date range."
                    action={
                      <Button variant="secondary" onClick={clearFilters}>
                        Clear filters
                      </Button>
                    }
                  />
                ) : (
                  <EmptyState
                    title="No activity yet"
                    message="Actions by officers and registrars will be recorded here."
                  />
                )
              }
            />
            <Pagination
              className="border-t border-slate-200 px-4 py-3"
              page={page}
              pageSize={PAGE_SIZE}
              total={data?.count ?? 0}
              onPageChange={setPage}
            />
          </Card>
        </>
      )}
    </>
  );
}