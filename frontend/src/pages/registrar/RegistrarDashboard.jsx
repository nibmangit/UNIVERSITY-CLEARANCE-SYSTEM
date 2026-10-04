import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import PageHeader from '../../components/ui/PageHeader';
import { SkeletonText } from '../../components/ui/Skeleton';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import Table from '../../components/ui/Table';
import OfficeCount from '../../components/OfficeCount';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { clearanceService } from '../../services/clearanceService';
import { timeAgo } from '../../utils/format';
import { CLEARANCE_STATUS } from '../../utils/status';


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

export default function RegistrarDashboard() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useApi(clearanceService.registrarDashboard);

  const header = (
    <PageHeader
      title="Dashboard"
      description={user?.first_name ? `Welcome, ${user.first_name}.` : 'Welcome.'}
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

  if (loading && !data) {
    return (
      <>
        {header}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Active" loading />
          <StatCard label="Waiting for approval" loading />
          <StatCard label="Open issues" loading />
          <StatCard label="Completed" loading />
        </div>
        <Card className="mt-6" title="Recent clearances">
          <SkeletonText lines={5} />
        </Card>
      </>
    );
  }

  const summary = data.summary ?? {};

  if (!summary.total_clearances) {
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

  const active = (summary.initiated ?? 0) + (summary.in_progress ?? 0) + (summary.pending_registrar ?? 0);
  const waiting = summary.pending_registrar ?? 0;
  const issues = data.recent_issues ?? [];

  return (
    <>
      {header}

      {waiting > 0 && (
        <Alert tone="warning" className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>
              {waiting === 1
                ? '1 clearance is waiting for your approval.'
                : `${waiting} clearances are waiting for your approval.`}
            </span>
            <Button to="/registrar/clearances?status=PENDING_REGISTRAR" size="sm">
              Review
            </Button>
          </div>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active" value={active} hint="In progress or waiting" />
        <StatCard
          label="Waiting for approval"
          value={waiting}
          tone={waiting > 0 ? 'amber' : 'default'}
          hint={waiting > 0 ? 'Ready for you' : 'Nothing waiting'}
        />
        <StatCard
          label="Open issues"
          value={summary.open_issues}
          tone={summary.open_issues > 0 ? 'red' : 'default'}
          hint={summary.open_issues > 0 ? 'Not yet resolved' : 'No open issues'}
        />
        <StatCard label="Completed" value={summary.completed} tone="emerald" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title="Recent clearances"
          padded={false}
          actions={
            <Button to="/registrar/clearances" size="sm" variant="secondary">
              View all
            </Button>
          }
        >
          <Table caption="Recent clearances" columns={COLUMNS} rows={data.recent_clearances ?? []} />
        </Card>

        <Card
          title="Open issues"
          description="Reported by offices on active clearances."
          actions={
            <Button to="/registrar/issues" size="sm" variant="secondary">
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