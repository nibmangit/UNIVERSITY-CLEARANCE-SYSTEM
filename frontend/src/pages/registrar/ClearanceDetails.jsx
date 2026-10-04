import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';

import ClearanceProgress from '../../components/ClearanceProgress';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ConfirmModal from '../../components/ui/ConfirmModal';
import DetailList from '../../components/ui/DetailList';
import ErrorState from '../../components/ui/ErrorState';
import PageHeader from '../../components/ui/PageHeader';
import { SkeletonText } from '../../components/ui/Skeleton';
import StatusBadge from '../../components/ui/StatusBadge';
import Table from '../../components/ui/Table';
import { cx } from '../../components/ui/styles';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../hooks/useToast';
import { clearanceService } from '../../services/clearanceService';
import { getErrorMessage } from '../../utils/errors';
import { formatDate, formatDateTime } from '../../utils/format';
import { CLEARANCE_STATUS, ISSUE_STATUS, getOfficeProgress } from '../../utils/status';

const OFFICE_COLUMNS = [
  {
    key: 'office',
    header: 'Office',
    render: (row) => <span className="font-medium text-slate-900">{row.office?.name}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <StatusBadge status={row.status} />,
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

// "Cannot approve yet. 1 office is still pending and 1 office has an open issue."
function blockedMessage(progress) {
  const parts = [];

  if (progress.pending > 0) {
    parts.push(`${progress.pending} ${progress.pending === 1 ? 'office is' : 'offices are'} still pending`);
  }
  if (progress.flagged > 0) {
    parts.push(`${progress.flagged} ${progress.flagged === 1 ? 'office has' : 'offices have'} an open issue`);
  }

  return `Cannot approve yet. ${parts.length > 0 ? parts.join(' and ') : 'The clearance is not ready for approval'}.`;
}

function collectIssues(offices) {
  return offices
    .flatMap((item) => (item.issues ?? []).map((issue) => ({ ...issue, office: item.office })))
    .sort(
      (a, b) =>
        (a.status === ISSUE_STATUS.OPEN ? 0 : 1) - (b.status === ISSUE_STATUS.OPEN ? 0 : 1) ||
        new Date(b.created_at) - new Date(a.created_at),
    );
}

function IssueItem({ issue }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">{issue.office?.name}</p>
        <StatusBadge status={issue.status} />
      </div>
      <p className="mt-2 text-sm font-medium text-slate-900">{issue.reason}</p>
      <p className="mt-0.5 text-sm whitespace-pre-line text-slate-700">{issue.description}</p>
      <p className="mt-2 text-xs text-slate-500">
        Reported {formatDateTime(issue.created_at)}
        {issue.created_by?.full_name ? ` by ${issue.created_by.full_name}` : ''}
      </p>

      {issue.status === ISSUE_STATUS.RESOLVED && (
        <div className="mt-3 rounded-md bg-slate-50 px-3 py-2.5 text-sm">
          <p className="font-medium text-slate-700">Resolution</p>
          <p className="mt-0.5 whitespace-pre-line text-slate-800">{issue.resolution_note || '—'}</p>
          <p className="mt-1 text-xs text-slate-500">
            Resolved{issue.resolved_by?.full_name ? ` by ${issue.resolved_by.full_name}` : ''} on{' '}
            {formatDateTime(issue.resolved_at)}
          </p>
        </div>
      )}
    </div>
  );
}

function ApprovalCard({ clearance, progress, onApprove }) {
  const { status } = clearance;

  if (status === CLEARANCE_STATUS.COMPLETED) {
    return (
      <Card title="Final approval">
        <Alert tone="success">
          Completed on {formatDateTime(clearance.completed_at)}. Approved by{' '}
          {clearance.final_approved_by?.full_name ?? 'the registrar'}.
        </Alert>
      </Card>
    );
  }

  if (status === CLEARANCE_STATUS.CANCELLED) {
    return (
      <Card title="Final approval">
        <Alert>This clearance was cancelled.</Alert>
      </Card>
    );
  }

  // The backend allows approval only when the clearance is waiting for it and every office is cleared.
  const ready = status === CLEARANCE_STATUS.PENDING_REGISTRAR && progress.allCleared;

  return (
    <Card
      title="Final approval"
      description="Complete the clearance once every office has cleared the student."
    >
      <div className="flex flex-wrap items-center gap-4">
        <Button disabled={!ready} onClick={onApprove} aria-describedby="approval-status">
          Final approve
        </Button>
        <p id="approval-status" className={cx('text-sm', ready ? 'font-medium text-emerald-800' : 'text-slate-600')}>
          {ready ? `All ${progress.total} offices have been cleared.` : blockedMessage(progress)}
        </p>
      </div>
    </Card>
  );
}

// Mounted only while open, so errors from an earlier attempt never linger.
function ApproveModal({ clearance, progress, onClose, onDone, onStale }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function confirm() {
    setSubmitting(true);
    setError('');
    try {
      await clearanceService.finalApprove(clearance.id);
      onDone();
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
      // For example: already approved in another tab. Show the real state behind the dialog.
      if (err.status === 400) onStale();
    }
  }

  return (
    <ConfirmModal
      open
      title="Final approval"
      message={`All ${progress.total} offices have been cleared. Are you sure you want to complete this clearance?`}
      confirmLabel="Confirm approval"
      loading={submitting}
      onConfirm={confirm}
      onCancel={onClose}
    >
      <DetailList
        className="mt-4"
        columns={2}
        items={[
          { label: 'Student', value: clearance.student?.full_name },
          { label: 'Clearance', value: `#${clearance.id}` },
        ]}
      />
      {error && (
        <Alert tone="error" className="mt-4">
          {error}
        </Alert>
      )}
    </ConfirmModal>
  );
}

function DetailsView({ id }) {
  const toast = useToast();
  const fetcher = useCallback((options) => clearanceService.get(id, options), [id]);
  const { data: clearance, loading, error, reload } = useApi(fetcher);
  const [approving, setApproving] = useState(false);

  const header = <PageHeader title="Clearance" backTo="/registrar/clearances" backLabel="Back to clearances" />;

  if (error) {
    return (
      <>
        {header}
        <Card>
          {error.status === 404 ? (
            <ErrorState title="Clearance not found" message="This clearance does not exist." />
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
        {header}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card title="Final approval">
              <SkeletonText lines={2} />
            </Card>
            <Card title="Student information">
              <SkeletonText lines={4} />
            </Card>
          </div>
          <Card title="Office progress">
            <SkeletonText lines={6} />
          </Card>
        </div>
      </>
    );
  }

  const student = clearance.student ?? {};
  const offices = clearance.clearance_offices ?? [];
  const progress = getOfficeProgress(offices);
  const issues = collectIssues(offices);

  function handleApproved() {
    setApproving(false);
    toast.success('Clearance approved. The student has been notified.');
    reload();
  }

  return (
    <>
      <PageHeader
        title={`Clearance #${clearance.id}`}
        description={`${clearance.clearance_type?.name ?? 'Clearance'} · ${student.full_name}`}
        backTo="/registrar/clearances"
        backLabel="Back to clearances"
        actions={<StatusBadge status={clearance.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ApprovalCard clearance={clearance} progress={progress} onApprove={() => setApproving(true)} />

          <Card title="Offices" padded={false}>
            <Table caption="Office clearance status" columns={OFFICE_COLUMNS} rows={offices} />
          </Card>

          {issues.length > 0 && (
            <Card title="Issues">
              <div className="space-y-4">
                {issues.map((issue) => (
                  <IssueItem key={issue.id} issue={issue} />
                ))}
              </div>
            </Card>
          )}

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
        </div>

        <div className="space-y-6">
          <Card title="Office progress">
            <ClearanceProgress offices={offices} />
          </Card>

          <Card title="Clearance details">
            <DetailList
              columns={1}
              items={[
                { label: 'Type', value: clearance.clearance_type?.name },
                { label: 'Started', value: formatDateTime(clearance.initiated_at) },
                { label: 'Initiated by', value: clearance.initiated_by?.full_name },
                { label: 'All offices cleared', value: formatDateTime(clearance.submitted_at) },
                { label: 'Completed', value: formatDateTime(clearance.completed_at) },
                { label: 'Approved by', value: clearance.final_approved_by?.full_name },
              ]}
            />
          </Card>
        </div>
      </div>

      {approving && (
        <ApproveModal
          clearance={clearance}
          progress={progress}
          onClose={() => setApproving(false)}
          onDone={handleApproved}
          onStale={reload}
        />
      )}
    </>
  );
}

// `key` restarts the page when the id in the address changes.
export default function ClearanceDetails() {
  const { id } = useParams();
  return <DetailsView key={id} id={id} />;
}