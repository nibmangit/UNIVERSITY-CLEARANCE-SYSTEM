import ClearanceProgress from '../../components/ClearanceProgress';
import RecentNotifications from '../../components/RecentNotifications';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import PageHeader from '../../components/ui/PageHeader';
import { SkeletonText } from '../../components/ui/Skeleton';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { clearanceService } from '../../services/clearanceService';
import { timeAgo } from '../../utils/format';
import { getOfficeProgress } from '../../utils/status';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useApi(clearanceService.studentDashboard);

  const active = data?.active_clearance ?? null;
  const firstName = user?.first_name || active?.student?.full_name?.split(' ')[0];

  const header = (
    <PageHeader
      title="Dashboard"
      description={firstName ? `Welcome, ${firstName}.` : 'Welcome.'}
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

  // First load: placeholders in the same shape as the real page.
  if (loading && !data) {
    return (
      <>
        {header}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Clearance" loading />
          <StatCard label="Progress" loading />
          <StatCard label="Issues" loading />
          <StatCard label="Status" loading />
        </div>
        <Card className="mt-6" title="Clearance progress">
          <SkeletonText lines={6} />
        </Card>
      </>
    );
  }

  if (!active) {
    const completed = data?.summary?.completed ?? 0;

    return (
      <>
        {header}
        <Card>
          <EmptyState
            title="No active clearance"
            message={
              completed > 0
                ? 'You have no clearance in progress. Your completed clearances are in History.'
                : 'Your clearance information will appear here when the registrar starts it.'
            }
            action={
              completed > 0 ? (
                <Button to="/student/history" variant="secondary">
                  View history
                </Button>
              ) : null
            }
          />
        </Card>
        <RecentNotifications className="mt-6" viewAllTo="/student/notifications" />
      </>
    );
  }

  const progress = getOfficeProgress(active.clearance_offices);
  const issues = data.recent_issues ?? [];
  const hasIssues = issues.length > 0;

  return (
    <>
      {header}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Clearance" value={`#${active.id}`} hint={active.clearance_type?.name} />
        <StatCard
          label="Progress"
          value={`${progress.cleared} / ${progress.total}`}
          hint="Offices cleared"
          tone={progress.allCleared ? 'emerald' : 'default'}
        />
        <StatCard
          label="Issues"
          value={progress.flagged}
          hint={progress.flagged > 0 ? 'Need your attention' : 'No open issues'}
          tone={progress.flagged > 0 ? 'red' : 'default'}
        />
        <StatCard label="Status" value={<StatusBadge status={active.status} />} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card
          className={hasIssues ? 'lg:col-span-2' : 'lg:col-span-3'}
          title="Clearance progress"
          actions={
            <Button to="/student/clearance" size="sm" variant="secondary">
              View clearance
            </Button>
          }
        >
          <ClearanceProgress offices={active.clearance_offices} />
        </Card>

        {hasIssues && (
          <Card
            title="Open issues"
            description="Contact the office that reported it. They will update your clearance once it is resolved."
          >
            <ul className="divide-y divide-slate-100">
              {issues.map((issue) => (
                <li key={issue.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-slate-900">{issue.office?.name ?? 'Office'}</p>
                    <StatusBadge status={issue.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{issue.reason}</p>
                  <p className="mt-0.5 text-xs text-slate-500">Reported {timeAgo(issue.created_at)}</p>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </>
  );
}