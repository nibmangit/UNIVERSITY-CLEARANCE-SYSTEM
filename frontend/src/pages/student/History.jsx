import { useMemo, useState } from 'react';

import CertificateActions from '../../components/CertificateActions';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import PageHeader from '../../components/ui/PageHeader';
import SearchInput from '../../components/ui/SearchInput';
import StatusBadge from '../../components/ui/StatusBadge';
import Table from '../../components/ui/Table';
import { useApi } from '../../hooks/useApi';
import { clearanceService } from '../../services/clearanceService';
import { formatDate } from '../../utils/format';
import { getStatusLabel } from '../../utils/status';

const COLUMNS = [
  {
    key: 'id',
    header: 'Clearance',
    render: (row) => <span className="font-medium text-slate-900">#{row.id}</span>,
  },
  {
    key: 'type',
    header: 'Type',
    render: (row) => row.clearance_type?.name ?? '—',
  },
  {
    key: 'started',
    header: 'Started',
    render: (row) => formatDate(row.initiated_at),
  },
  {
    key: 'completed',
    header: 'Completed',
    render: (row) => formatDate(row.completed_at),
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
  key: 'action',
  header: <span className="sr-only">Actions</span>,
  align: 'right',
  render: (row) => (
    <div className="flex items-center justify-end gap-1.5 sm:gap-2 whitespace-nowrap">
      <Button
        to={`/student/clearance/${row.id}`}
        size="sm"
        variant="secondary"
        title={`Details of clearance #${row.id}`}
        aria-label={`Details of clearance #${row.id}`}
      >
        <span className="sm:inline">Details</span>
        <span className="sr-only"> of clearance #{row.id}</span>
      </Button>

      <CertificateActions clearance={row} size="sm" />
    </div>
  ),
}
];

// Everything a student might type to find a clearance, in one lowercase string.
function searchText(row) {
  return [
    `#${row.id}`,
    row.clearance_type?.name,
    getStatusLabel(row.status),
    formatDate(row.initiated_at, ''),
  ]
    .join(' ')
    .toLowerCase();
}

export default function History() {
  const { data, loading, error, reload } = useApi(clearanceService.listMine);
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const list = data ?? [];
    const needle = query.trim().toLowerCase();
    return needle ? list.filter((row) => searchText(row).includes(needle)) : list;
  }, [data, query]);

  const header = <PageHeader title="History" description="All your clearances, newest first." />;

  if (error) {
    return (
      <>
        {header}
        <Card>
          <ErrorState error={error} onRetry={reload} />
        </Card>
      </>
    );
  }

  const firstLoad = loading && !data;

  if (!firstLoad && (data ?? []).length === 0) {
    return (
      <>
        {header}
        <Card>
          <EmptyState
            title="No clearances yet"
            message="Your clearance information will appear here when it is initiated."
          />
        </Card>
      </>
    );
  }

  return (
    <>
      {header}

      <SearchInput
        className="mb-4 max-w-sm"
        value={query}
        onChange={setQuery}
        label="Search clearances"
        placeholder="Search by number, type or status"
      />

      <Card padded={false}>
        <Table
          caption="Your clearances"
          columns={COLUMNS}
          rows={rows}
          loading={firstLoad}
          skeletonRows={3}
          emptyState={
            <EmptyState
              title="No matches"
              message="No clearance matches your search."
              action={
                <Button variant="secondary" onClick={() => setQuery('')}>
                  Clear search
                </Button>
              }
            />
          }
        />
      </Card>
    </>
  );
}