import { useMemo, useState } from 'react';

import CertificateActions from '../../components/CertificateActions';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import SearchInput from '../../components/ui/SearchInput';
import StatusBadge from '../../components/ui/StatusBadge';
import Table from '../../components/ui/Table';
import { useApi } from '../../hooks/useApi';
import { usePagination } from '../../hooks/usePagination';
import { clearanceService } from '../../services/clearanceService';
import { formatDate } from '../../utils/format';
import { CLEARANCE_STATUS } from '../../utils/status';

const PAGE_SIZE = 10;

// Stable function so useApi does not reload on every render.
const fetchCompleted = (options) => clearanceService.listAll(CLEARANCE_STATUS.COMPLETED, options);

const COLUMNS = [
  {
    key: 'student',
    header: 'Student',
    render: (row) => (
      <div>
        <p className="font-medium text-slate-900">{row.student?.full_name}</p>
        <p className="text-xs text-slate-500">{row.student?.student_id}</p>
      </div>
    ),
  },
  {
    key: 'clearance',
    header: 'Clearance',
    render: (row) => (
      <div>
        <p>#{row.id}</p>
        <p className="text-xs text-slate-500">{row.clearance_type?.name}</p>
      </div>
    ),
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
    key: 'approvedBy',
    header: 'Approved by',
    render: (row) => row.final_approved_by?.full_name ?? '—',
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
    <div className="flex items-center justify-end gap-2 whitespace-nowrap">
      <Button 
        to={`/registrar/clearances/${row.id}`} 
        size="sm" 
        variant="secondary"
        aria-label={`Details of clearance #${row.id}`}
        title={`Details of clearance #${row.id}`}
      > 
        <span className=" sm:inline">Details</span>
        <span className="sr-only"> of clearance #{row.id}</span>
      </Button>

      {/* Pass responsive state/props to your custom component */}
      <CertificateActions clearance={row} size="sm" iconOnlyOnMobile />
    </div>
  ),
}
];

function searchText(row) {
  return [
    row.student?.full_name,
    row.student?.student_id,
    `#${row.id}`,
    row.clearance_type?.name,
    row.final_approved_by?.full_name,
  ]
    .join(' ')
    .toLowerCase();
}

export default function Completed() {
  const { data, loading, error, reload } = useApi(fetchCompleted);
  const [query, setQuery] = useState('');

  // Most recently completed first.
  const rows = useMemo(
    () => [...(data ?? [])].sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at)),
    [data],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? rows.filter((row) => searchText(row).includes(needle)) : rows;
  }, [rows, query]);

  const { page, setPage, pageItems, total } = usePagination(filtered, PAGE_SIZE);

  function changeQuery(value) {
    setQuery(value);
    setPage(1);
  }

  const header = <PageHeader title="Completed" description="Clearances that have received final approval." />;

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

  if (!firstLoad && rows.length === 0) {
    return (
      <>
        {header}
        <Card>
          <EmptyState
            title="No completed clearances"
            message="Clearances appear here once you give final approval."
            action={
              <Button to="/registrar/clearances?status=PENDING_REGISTRAR" variant="secondary">
                See clearances waiting for approval
              </Button>
            }
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
        onChange={changeQuery}
        label="Search completed clearances"
        placeholder="Student, ID, clearance number or approver"
      />

      <Card padded={false}>
        <Table
          caption="Completed clearances"
          columns={COLUMNS}
          rows={pageItems}
          loading={firstLoad}
          skeletonRows={4}
          emptyState={
            <EmptyState
              title="No matches"
              message="No completed clearance matches your search."
              action={
                <Button variant="secondary" onClick={() => changeQuery('')}>
                  Clear search
                </Button>
              }
            />
          }
        />
        <Pagination
          className="border-t border-slate-200 px-4 py-3"
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onPageChange={setPage}
        />
      </Card>
    </>
  );
}