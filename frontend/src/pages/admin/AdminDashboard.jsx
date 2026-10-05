import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import PageHeader from '../../components/ui/PageHeader';
import ProgressBar from '../../components/ui/ProgressBar';
import { SkeletonText } from '../../components/ui/Skeleton';
import StatCard from '../../components/ui/StatCard';
import Table from '../../components/ui/Table';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { adminService } from '../../services/adminService'; 
import { ACTION_TONES, humanizeAction } from '../../utils/auditLog';
import { AUDIT_LOG_COLUMNS } from './auditLogColumns';

const RECENT_COUNT = 8;

// Stable function so useApi does not reload on every render.
const fetchRecent = (options) =>
  adminService.listAuditLogs({ page: 1, page_size: RECENT_COUNT }, options);

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: meta, loading: metaLoading, error: metaError, reload: reloadMeta } = useApi(adminService.auditLogMeta);
  const { data: recent, loading: recentLoading, error: recentError, reload: reloadRecent } = useApi(fetchRecent);

  const summary = meta?.summary;
  const firstMeta = metaLoading && !meta;
  const byAction = meta?.by_action ?? [];
  const maxCount = Math.max(1, ...byAction.map((row) => row.count));

  function refresh() {
    reloadMeta();
    reloadRecent();
  }

  let activityByAction;

  if (metaError) {
    activityByAction = (
      <div role="alert" className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <span>Couldn't load the numbers.</span>
        <Button size="sm" variant="secondary" onClick={reloadMeta}>
          Try again
        </Button>
      </div>
    );
  } else if (firstMeta) {
    activityByAction = <SkeletonText lines={5} />;
  } else if (byAction.length === 0) {
    activityByAction = <p className="text-sm text-slate-600">No activity in the last 7 days.</p>;
  } else {
    activityByAction = (
      <ul className="space-y-4">
        {byAction.map((row) => (
          <li key={row.action}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-slate-800">{humanizeAction(row.action)}</span>
              <span className="font-medium text-slate-900 tabular-nums">{row.count}</span>
            </div>
            <ProgressBar
              className="mt-1.5"
              value={(row.count / maxCount) * 100}
              tone={ACTION_TONES[row.action]}
              label={`${humanizeAction(row.action)}: ${row.count}`}
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={user?.first_name ? `Welcome, ${user.first_name}.` : 'Welcome.'}
        actions={
          <Button variant="secondary" onClick={refresh} loading={(metaLoading && Boolean(meta)) || (recentLoading && Boolean(recent))}>
            Refresh
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total entries" value={summary?.total} loading={firstMeta} />
        <StatCard label="Today" value={summary?.today} loading={firstMeta} />
        <StatCard label="Last 7 days" value={summary?.last_7_days} loading={firstMeta} />
        <StatCard label="Active users" value={summary?.users} hint="With at least one entry" loading={firstMeta} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title="Recent activity"
          padded={false}
          actions={
            <Button to="/admin/logs" size="sm" variant="secondary">
              View all
            </Button>
          }
        >
          {recentError ? (
            <ErrorState error={recentError} onRetry={reloadRecent} />
          ) : (
            <Table
              caption="Recent activity"
              columns={AUDIT_LOG_COLUMNS}
              rows={recent?.results ?? []}
              loading={recentLoading && !recent}
              skeletonRows={5}
              emptyState={
                <EmptyState
                  title="No activity yet"
                  message="Actions by officers and registrars will be recorded here."
                />
              }
            />
          )}
        </Card>

        <div className="space-y-6">
          <Card title="Activity by action" description="Last 7 days">
            {activityByAction}
          </Card>
        </div>
      </div>
    </>
  );
}