import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import OfficeCount from '../../components/OfficeCount';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import SearchInput from '../../components/ui/SearchInput';
import StatusBadge from '../../components/ui/StatusBadge';
import Table from '../../components/ui/Table';
import Tabs from '../../components/ui/Tabs';
import { useApi } from '../../hooks/useApi';
import { usePagination } from '../../hooks/usePagination';
import { clearanceService } from '../../services/clearanceService';
import { formatDate } from '../../utils/format';
import { CLEARANCE_STATUS } from '../../utils/status';

const PAGE_SIZE = 10;

const ACTIVE = [
  CLEARANCE_STATUS.INITIATED,
  CLEARANCE_STATUS.IN_PROGRESS,
  CLEARANCE_STATUS.PENDING_REGISTRAR,
];

// `id` is also the value used in the address: /registrar/clearances?status=PENDING_REGISTRAR
const FILTERS = [
  { id: 'active', label: 'Active', test: (row) => ACTIVE.includes(row.status) },
  {
    id: CLEARANCE_STATUS.PENDING_REGISTRAR,
    label: 'Waiting for approval',
    test: (row) => row.status === CLEARANCE_STATUS.PENDING_REGISTRAR,
  },
  {
    id: 'issues',
    label: 'Has issues',
    test: (row) => ACTIVE.includes(row.status) && (row.progress?.flagged ?? 0) > 0,
  },
  { id: 'all', label: 'All', test: () => true },
];

// Stable function so useApi does not reload on every render.
const fetchAll = (options) => clearanceService.listAll(undefined, options);

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
    key: 'offices',
    header: 'Offices cleared',
    render: (row) => <OfficeCount progress={row.progress} />,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: 'started',
    header: 'Started',
    render: (row) => formatDate(row.initiated_at),
  },
  {
    key: 'action',
    header: <span className="sr-only">Actions</span>,
    align: 'right',
    render: (row) =>
      row.status === CLEARANCE_STATUS.PENDING_REGISTRAR ? (
        <Button to={`/registrar/clearances/${row.id}`} size="sm">
          Review
          <span className="sr-only"> clearance #{row.id}</span>
        </Button>
      ) : (
        <Button to={`/registrar/clearances/${row.id}`} size="sm" variant="secondary">
          View
          <span className="sr-only"> clearance #{row.id}</span>
        </Button>
      ),
  },
];

function searchText(row) {
  return [row.student?.full_name, row.student?.student_id, `#${row.id}`, row.clearance_type?.name]
    .join(' ')
    .toLowerCase();
}

function emptyCopy(filterId) {
  switch (filterId) {
    case CLEARANCE_STATUS.PENDING_REGISTRAR:
      return { title: 'Nothing waiting', message: 'No clearance is waiting for your approval.' };
    case 'issues':
      return { title: 'No issues', message: 'No active clearance has an open issue.' };
    case 'active':
      return { title: 'No active clearances', message: 'Initiate a clearance to get started.' };
    default:
      return { title: 'No clearances', message: 'Nothing to show.' };
  }
}

export default function Clearances() {
  const { data, loading, error, reload } = useApi(fetchAll);
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');

  const requested = searchParams.get('status');
  const filter = FILTERS.some((option) => option.id === requested) ? requested : 'active';

  const rows = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(() => {
    const test = FILTERS.find((option) => option.id === filter).test;
    const needle = query.trim().toLowerCase();

    return rows.filter((row) => test(row) && (!needle || searchText(row).includes(needle)));
  }, [rows, filter, query]);

  const { page, setPage, pageItems, total } = usePagination(filtered, PAGE_SIZE);

  const tabs = FILTERS.map((option) => ({
    id: option.id,
    label: option.label,
    count: rows.filter(option.test).length,
  }));

  function changeFilter(id) {
    setSearchParams(id === 'active' ? {} : { status: id }, { replace: true });
    setPage(1);
  }

  function changeQuery(value) {
    setQuery(value);
    setPage(1);
  }

  function clearFilters() {
    setQuery('');
    changeFilter('all');
  }

  const header = (
    <PageHeader
      title="Clearances"
      description="All clearances in the system."
      actions={<Button to="/registrar/students">Initiate clearance</Button>}
    />
  );

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
            title="No clearances yet"
            message="Find a student and initiate a clearance to get started."
            action={<Button to="/registrar/students">Initiate clearance</Button>}
          />
        </Card>
      </>
    );
  }

  const empty = emptyCopy(filter);

  return (
    <>
      {header}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput
          className="w-full sm:max-w-xs"
          value={query}
          onChange={changeQuery}
          label="Search clearances"
          placeholder="Student, ID or clearance number"
        />
        <Tabs label="Filter clearances" tabs={tabs} value={filter} onChange={changeFilter} />
      </div>

      <Card padded={false}>
        <Table
          caption="Clearances"
          columns={COLUMNS}
          rows={pageItems}
          loading={firstLoad}
          emptyState={
            query ? (
              <EmptyState
                title="No matches"
                message="No clearance matches your search."
                action={
                  <Button variant="secondary" onClick={() => changeQuery('')}>
                    Clear search
                  </Button>
                }
              />
            ) : (
              <EmptyState
                title={empty.title}
                message={empty.message}
                action={
                  filter !== 'all' ? (
                    <Button variant="secondary" onClick={clearFilters}>
                      Show all clearances
                    </Button>
                  ) : null
                }
              />
            )
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