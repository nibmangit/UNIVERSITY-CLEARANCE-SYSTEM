import { useMemo, useState } from 'react';

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

const PAGE_SIZE = 10;

const FILTERS = [
  { id: 'all', label: 'All processed' },
  { id: 'CLEARED', label: 'Cleared' },
  { id: 'FLAGGED', label: 'Flagged / Issues' },
];

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
        <p>#{row.clearance_id}</p>
        <p className="text-xs text-slate-500">{row.clearance_type?.name}</p>
      </div>
    ),
  },
  {
    key: 'office',
    header: 'Office',
    render: (row) => row.office?.name ?? '—',
  },
  {
    key: 'status',
    header: 'Decision',
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: 'processed_at',
    header: 'Processed date',
    render: (row) => formatDate(row.reviewed_at),
  },
  {
    key: 'action',
    header: <span className="sr-only">Actions</span>,
    align: 'right',
    render: (row) => (
      <Button to={`/officer/clearances/${row.clearance_id}`} size="sm" variant="secondary">
        View details
        <span className="sr-only"> clearance #{row.clearance_id}</span>
      </Button>
    ),
  },
];

function searchText(task) {
  return [
    task.student?.full_name,
    task.student?.student_id,
    task.student?.faculty,
    task.student?.department,
    task.student?.section,
    `#${task.clearance_id}`,
    task.clearance_type?.name,
    task.office?.name,
    task.notes,
  ]
    .join(' ')
    .toLowerCase();
}

export default function OfficerHistory() {
  const { data, loading, error, reload } = useApi(clearanceService.listOfficeTasks);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  // History includes all cases that have been reviewed/processed (CLEARED or FLAGGED)
  const processedTasks = useMemo(() => {
    return (data ?? []).filter((task) => task.status !== 'PENDING');
  }, [data]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return processedTasks.filter((task) => {
      const matchesFilter = filter === 'all' || task.status === filter;
      const matchesSearch = !needle || searchText(task).includes(needle);
      return matchesFilter && matchesSearch;
    });
  }, [processedTasks, query, filter]);

  const { page, setPage, pageItems, total } = usePagination(filtered, PAGE_SIZE);

  const tabs = FILTERS.map((option) => ({
    ...option,
    count:
      option.id === 'all'
        ? processedTasks.length
        : processedTasks.filter((task) => task.status === option.id).length,
  }));

  function changeQuery(value) {
    setQuery(value);
    setPage(1);
  }

  function changeFilter(value) {
    setFilter(value);
    setPage(1);
  }

  function clearFilters() {
    setQuery('');
    setFilter('all');
    setPage(1);
  }

  const header = (
    <PageHeader
      title="Office clearance history"
      description="History of student clearance reviews processed by your office."
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

  if (!firstLoad && processedTasks.length === 0) {
    return (
      <>
        {header}
        <Card>
          <EmptyState
            title="No history records yet"
            message="Cases you have cleared or flagged will be archived here for your records."
          />
        </Card>
      </>
    );
  }

  return (
    <>
      {header}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput
          className="w-full sm:max-w-xs"
          value={query}
          onChange={changeQuery}
          label="Search history"
          placeholder="Search student ID, name or clearance #"
        />
        <Tabs label="Filter by status" tabs={tabs} value={filter} onChange={changeFilter} />
      </div>

      <Card padded={false}>
        <Table
          caption="Past office clearances"
          columns={COLUMNS}
          rows={pageItems}
          loading={firstLoad}
          emptyState={
            <EmptyState
              title="No matches"
              message="No clearance in your history matches your search or filter."
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
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

