import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import Card from '../../components/ui/Card';
import DetailList from '../../components/ui/DetailList';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import PageHeader from '../../components/ui/PageHeader';
import { SkeletonText } from '../../components/ui/Skeleton';
import StatusBadge from '../../components/ui/StatusBadge';
import Table from '../../components/ui/Table';
import Timeline from '../../components/ui/Timeline';
import { useApi } from '../../hooks/useApi';
import { clearanceService } from '../../services/clearanceService';
import { buildClearanceTimeline } from '../../utils/clearanceTimeline';
import { formatDate, formatDateTime } from '../../utils/format';
import { CLEARANCE_STATUS, ISSUE_STATUS, OFFICE_STATUS } from '../../utils/status';

const ACTIVE_STATUSES = [
  CLEARANCE_STATUS.INITIATED,
  CLEARANCE_STATUS.IN_PROGRESS,
  CLEARANCE_STATUS.PENDING_REGISTRAR,
];

// /student/clearance shows the active clearance, or the most recent one if none is active.
function pickCurrent(list) {
  return list.find((item) => ACTIVE_STATUSES.includes(item.status)) ?? list[0] ?? null;
}

const firstOpenIssue = (row) => row.issues?.find((issue) => issue.status === ISSUE_STATUS.OPEN);

const COLUMNS = [
  {
    key: 'office',
    header: 'Office',
    render: (row) => <span className="font-medium text-slate-900">{row.office?.name}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => {
      const openIssue = row.status === OFFICE_STATUS.FLAGGED ? firstOpenIssue(row) : null;

      return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <StatusBadge status={row.status} />
          {openIssue && (
            <a href={`#issue-${openIssue.id}`} className="text-sm font-medium text-sky-800 underline">
              View issue
            </a>
          )}
        </div>
      );
    },
  },
  {
    key: 'officer',
    header: 'Officer',
    render: (row) => row.assigned_officer?.full_name ?? '—',
  },
  {
    key: 'updated',
    header: 'Updated',
    render: (row) => formatDate(row.reviewed_at),
  },
];

// Open issues first, then newest first.
function collectIssues(offices) {
  return offices
    .flatMap((item) => (item.issues ?? []).map((issue) => ({ ...issue, office: item.office })))
    .sort((a, b) => {
      const openFirst = (a.status === ISSUE_STATUS.OPEN ? 0 : 1) - (b.status === ISSUE_STATUS.OPEN ? 0 : 1);
      return openFirst || new Date(b.created_at) - new Date(a.created_at);
    });
}

function IssueBlock({ issue }) {
  const isOpen = issue.status === ISSUE_STATUS.OPEN;

  return (
    <div id={`issue-${issue.id}`} className="scroll-mt-6 rounded-lg border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">{issue.office?.name}</p>
        <StatusBadge status={issue.status} />
      </div>

      <DetailList
        className="mt-4"
        columns={2}
        items={[
          { label: 'Reason', value: issue.reason },
          { label: 'Reported', value: formatDateTime(issue.created_at) },
        ]}
      />

      <div className="mt-4">
        <p className="text-sm text-slate-500">Description</p>
        <p className="mt-0.5 text-sm whitespace-pre-line text-slate-900">{issue.description || '—'}</p>
      </div>

      <div className="mt-4 rounded-md bg-slate-50 px-3 py-2.5 text-sm">
        <p className="font-medium text-slate-700">Resolution</p>
        {isOpen ? (
          <p className="mt-0.5 text-slate-600">
            Waiting for the issue to be resolved. Contact {issue.office?.name ?? 'the office'} to find out what is needed.
          </p>
        ) : (
          <>
            <p className="mt-0.5 whitespace-pre-line text-slate-800">{issue.resolution_note || '—'}</p>
            {issue.resolved_at && (
              <p className="mt-1 text-xs text-slate-500">
                Resolved{issue.resolved_by?.full_name ? ` by ${issue.resolved_by.full_name}` : ''} on{' '}
                {formatDateTime(issue.resolved_at)}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ClearanceView({ id }) {
  const fetcher = useCallback(
    (options) =>
      id ? clearanceService.get(id, options) : clearanceService.listMine(options).then(pickCurrent),
    [id],
  );
  const { data: clearance, loading, error, reload } = useApi(fetcher);

  const timeline = useMemo(
    () =>
      clearance
        ? buildClearanceTimeline(clearance).map((event) => ({
            ...event,
            time: event.at ? formatDateTime(event.at) : undefined,
          }))
        : [],
    [clearance],
  );

  if (error) {
    const notFound = error.status === 404;

    return (
      <>
        <PageHeader title="Clearance" backTo={id ? '/student/history' : undefined} backLabel="Back to history" />
        <Card>
          {notFound ? (
            <ErrorState
              title="Clearance not found"
              message="This clearance does not exist or does not belong to you."
            />
          ) : (
            <ErrorState error={error} onRetry={reload} />
          )}
        </Card>
      </>
    );
  }

  if (loading && !clearance) {
    return (
      <>
        <PageHeader title="Clearance" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card title="Student information">
              <SkeletonText lines={4} />
            </Card>
            <Card title="Office clearance">
              <SkeletonText lines={6} />
            </Card>
          </div>
          <Card title="Timeline">
            <SkeletonText lines={5} />
          </Card>
        </div>
      </>
    );
  }

  if (!clearance) {
    return (
      <>
        <PageHeader title="Clearance" />
        <Card>
          <EmptyState
            title="No clearances yet"
            message="Your clearance information will appear here when it is initiated."
          />
        </Card>
      </>
    );
  }

  const student = clearance.student ?? {};
  const offices = clearance.clearance_offices ?? [];
  const issues = collectIssues(offices);

  return (
    <>
      <PageHeader
        title={`Clearance #${clearance.id}`}
        description={`${clearance.clearance_type?.name ?? 'Clearance'} · Started ${formatDate(clearance.initiated_at)}`}
        backTo={id ? '/student/history' : undefined}
        backLabel="Back to history"
        actions={<StatusBadge status={clearance.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Student information">
            <DetailList
              columns={2}
              items={[
                { label: 'Name', value: student.full_name },
                { label: 'Student ID', value: student.student_id },
                { label: 'Faculty', value: student.faculty },
                { label: 'Department', value: student.department },
                { label: 'Section', value: student.section },
                { label: 'Year', value: student.year },
              ]}
            />
          </Card>

          <Card title="Office clearance" padded={false}>
            <Table caption="Office clearance status" columns={COLUMNS} rows={offices} />
          </Card>

          {issues.length > 0 && (
            <Card title="Issues" description="Problems reported by offices on this clearance.">
              <div className="space-y-4">
                {issues.map((issue) => (
                  <IssueBlock key={issue.id} issue={issue} />
                ))}
              </div>
            </Card>
          )}
        </div>

        <Card title="Timeline">
          <Timeline items={timeline} />
        </Card>
      </div>
    </>
  );
}

// `key` restarts the view when the address changes between /student/clearance and /student/clearance/:id.
export default function Clearance() {
  const { id } = useParams();
  return <ClearanceView key={id ?? 'current'} id={id} />;
}