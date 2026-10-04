import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import PageHeader from '../../components/ui/PageHeader';
import { SkeletonText } from '../../components/ui/Skeleton';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import Table from '../../components/ui/Table';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { clearanceService } from '../../services/clearanceService';
import { timeAgo } from '../../utils/format';

const TASK_COLUMNS = [
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
    header: 'Status',
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: 'action',
    header: <span className="sr-only">Actions</span>,
    align: 'right',
    render: (row) => (
      <Button to={`/officer/clearances/${row.clearance_id}`} size="sm" variant="secondary">
        View
        <span className="sr-only"> clearance #{row.clearance_id}</span>
      </Button>
    ),
  },
];

export default function OfficerDashboard() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useApi(clearanceService.officerDashboard);

  const header = (
    <PageHeader
      title="Dashboard"
      description={user?.first_name ? `Welcome, ${user.first_name}.` : 'Welcome.'}
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

  if (loading && !data) {
    return (
      <>
        {header}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Pending" loading />
          <StatCard label="Cleared" loading />
          <StatCard label="Issues" loading />
          <StatCard label="Total assigned" loading />
        </div>
        <Card className="mt-6" title="Recent clearances">
          <SkeletonText lines={5} />
        </Card>
      </>
    );
  }

  const summary = data.summary ?? {};

  if (!summary.total_assigned) {
    return (
      <>
        {header}
        <Card>
          <EmptyState
            title="No assigned clearances"
            message="Clearances will appear here when students are assigned to you."
          />
        </Card>
      </>
    );
  }

  const tasks = data.recent_tasks ?? [];
  const issues = data.recent_issues ?? [];

  return (
    <>
      {header}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Pending"
          value={summary.pending}
          hint={summary.pending > 0 ? 'Waiting for you' : 'Nothing waiting'}
        />
        <StatCard label="Cleared" value={summary.cleared} tone="emerald" />
        <StatCard
          label="Issues"
          value={summary.open_issues}
          hint={summary.open_issues > 0 ? 'Open' : 'No open issues'}
          tone={summary.open_issues > 0 ? 'red' : 'default'}
        />
        <StatCard label="Total assigned" value={summary.total_assigned} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title="Recent clearances"
          padded={false}
          actions={
            <Button to="/officer/clearances" size="sm" variant="secondary">
              View all
            </Button>
          }
        >
          <Table caption="Recent clearances assigned to you" columns={TASK_COLUMNS} rows={tasks} />
        </Card>

        <Card
          title="Open issues"
          description="Resolve these once the student has dealt with them."
          actions={
            <Button to="/officer/issues" size="sm" variant="secondary">
              View all
            </Button>
          }
        >
          {issues.length === 0 ? (
            <p className="text-sm text-slate-600">No open issues.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {issues.map((issue) => (
                <li key={issue.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-slate-900">{issue.student?.full_name}</p>
                    <StatusBadge status={issue.status} />
                  </div>
                  <p className="mt-0.5 text-sm text-slate-700">{issue.reason}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {issue.office?.name} · {timeAgo(issue.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}