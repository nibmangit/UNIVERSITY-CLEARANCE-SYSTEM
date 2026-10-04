import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';

import ClearanceProgress from '../../components/ClearanceProgress';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ConfirmModal from '../../components/ui/ConfirmModal';
import DetailList from '../../components/ui/DetailList';
import ErrorState from '../../components/ui/ErrorState';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import Select from '../../components/ui/Select';
import { SkeletonText } from '../../components/ui/Skeleton';
import StatusBadge from '../../components/ui/StatusBadge';
import Textarea from '../../components/ui/Textarea';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../hooks/useToast';
import { authService } from '../../services/authService';
import { clearanceService } from '../../services/clearanceService';
import { getErrorMessage } from '../../utils/errors';
import { formatDate, formatDateTime } from '../../utils/format';
import { CLEARANCE_STATUS, ISSUE_STATUS, OFFICE_STATUS } from '../../utils/status';

// Offices can only be processed while the clearance is still running.
const ACTIVE_CLEARANCE = [CLEARANCE_STATUS.INITIATED, CLEARANCE_STATUS.IN_PROGRESS];

const OTHER = 'Other';
const REASON_OPTIONS = [
  'Unreturned item',
  'Unpaid fee or balance',
  'Missing document',
  'Incomplete requirement',
].map((reason) => ({ value: reason, label: reason }));
REASON_OPTIONS.push({ value: OTHER, label: 'Other (specify)' });

// ---------- Dialogs ----------
// Each dialog is mounted only while it is open, so its fields start empty every time.

function ClearModal({ office, studentName, onClose, onDone, onStale }) {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function confirm() {
    setSubmitting(true);
    setError('');
    try {
      await clearanceService.clearOffice(office.id, { notes: notes.trim() });
      onDone('Student cleared.');
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
      if (err.status === 400 || err.status === 403) onStale();
    }
  }

  return (
    <ConfirmModal
      open
      title="Clear this student?"
      message={`This will mark your ${office.office?.name} clearance for ${studentName} as cleared.`}
      confirmLabel="Clear student"
      loading={submitting}
      onConfirm={confirm}
      onCancel={onClose}
    >
      <div className="mt-4">
        <Textarea
          label="Note (optional)"
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>
      {error && <Alert tone="error" className="mt-4">{error}</Alert>}
    </ConfirmModal>
  );
}

function FlagIssueModal({ office, studentName, onClose, onDone, onStale }) {
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();

    const next = {};
    if (!reason) next.reason = 'Please select a reason.';
    if (reason === OTHER && !otherReason.trim()) next.otherReason = 'Please enter the reason.';
    if (!description.trim()) next.description = 'Description cannot be empty.';

    setErrors(next);
    setSubmitError('');
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await clearanceService.flagOffice(office.id, {
        reason: reason === OTHER ? otherReason.trim() : reason,
        description: description.trim(),
      });
      onDone('Issue reported. The student has been notified.');
    } catch (err) {
      setSubmitError(getErrorMessage(err));
      setSubmitting(false);
      if (err.status === 400 || err.status === 403) onStale();
    }
  }

  return (
    <Modal
      open
      title="Report issue"
      description={`${office.office?.name} · ${studentName}`}
      onClose={onClose}
      busy={submitting}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="flag-issue-form" loading={submitting}>
            Report issue
          </Button>
        </>
      }
    >
      <form id="flag-issue-form" onSubmit={submit} noValidate className="space-y-4">
        <Select
          label="Reason"
          required
          placeholder="Select reason"
          options={REASON_OPTIONS}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          error={errors.reason}
        />

        {reason === OTHER && (
          <Input
            label="Specify the reason"
            required
            maxLength={200}
            value={otherReason}
            onChange={(event) => setOtherReason(event.target.value)}
            error={errors.otherReason}
          />
        )}

        <Textarea
          label="Description"
          required
          placeholder="Describe the problem…"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          error={errors.description}
        />

        {submitError && <Alert tone="error">{submitError}</Alert>}
      </form>
    </Modal>
  );
}

// ---------- Page pieces ----------

function IssueSummary({ issue }) {
  const open = issue.status === ISSUE_STATUS.OPEN;

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">{issue.reason}</p>
        <StatusBadge status={issue.status} />
      </div>
      <p className="mt-2 text-sm whitespace-pre-line text-slate-700">{issue.description}</p>
      <p className="mt-2 text-xs text-slate-500">Reported {formatDateTime(issue.created_at)}</p>

      {!open && (
        <div className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-sm">
          <p className="font-medium text-slate-700">Resolution</p>
          <p className="mt-0.5 whitespace-pre-line text-slate-800">{issue.resolution_note || '—'}</p>
          {issue.resolved_at && (
            <p className="mt-1 text-xs text-slate-500">
              Resolved{issue.resolved_by?.full_name ? ` by ${issue.resolved_by.full_name}` : ''} on{' '}
              {formatDateTime(issue.resolved_at)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function MyOfficeCard({ item, canAct, onClear, onFlag }) {
  // Open issues first, then newest first.
  const issues = [...(item.issues ?? [])].sort(
    (a, b) =>
      (a.status === ISSUE_STATUS.OPEN ? 0 : 1) - (b.status === ISSUE_STATUS.OPEN ? 0 : 1) ||
      new Date(b.created_at) - new Date(a.created_at),
  );

  return (
    <Card title={item.office?.name} actions={<StatusBadge status={item.status} />}>
      <DetailList
        columns={2}
        items={[
          { label: 'Assigned officer', value: item.assigned_officer?.full_name },
          { label: 'Last updated', value: formatDateTime(item.reviewed_at) },
        ]}
      />

      {item.notes && (
        <div className="mt-4">
          <p className="text-sm text-slate-500">Note</p>
          <p className="mt-0.5 text-sm whitespace-pre-line text-slate-900">{item.notes}</p>
        </div>
      )}

      {item.status === OFFICE_STATUS.PENDING && canAct && (
        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={onClear}>Clear student</Button>
          <Button variant="secondary" onClick={onFlag}>
            Flag issue
          </Button>
        </div>
      )}

      {item.status === OFFICE_STATUS.PENDING && !canAct && (
        <Alert className="mt-5">This clearance is no longer active, so there is nothing to do here.</Alert>
      )}

      {item.status === OFFICE_STATUS.CLEARED && (
        <Alert tone="success" className="mt-5">
          You cleared this student{item.reviewed_at ? ` on ${formatDate(item.reviewed_at)}` : ''}.
        </Alert>
      )}

      {item.status === OFFICE_STATUS.FLAGGED && (
        <Alert tone="warning" className="mt-5">
          Waiting for the student to resolve this. When they have, mark the issue as resolved on the
          Issues page, then clear the student again.
          <div className="mt-2">
            <Button to="/officer/issues" size="sm" variant="secondary">
              Go to issues
            </Button>
          </div>
        </Alert>
      )}

      {issues.length > 0 && (
        <div className="mt-5">
          <p className="text-sm font-medium text-slate-900">Issues</p>
          <div className="mt-2 space-y-3">
            {issues.map((issue) => (
              <IssueSummary key={issue.id} issue={issue} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function DetailsView({ id }) {
  const toast = useToast();

  // The clearance and the officer's own profile load together (the profile tells us which office is ours).
  const fetcher = useCallback(
    (options) =>
      Promise.all([clearanceService.get(id, options), authService.profile(options)]).then(
        ([clearance, profile]) => ({ clearance, profile }),
      ),
    [id],
  );
  const { data, loading, error, reload } = useApi(fetcher);
  const [dialog, setDialog] = useState(null); // { type: 'clear' | 'flag', office }

  const header = (
    <PageHeader title="Clearance" backTo="/officer/clearances" backLabel="Back to clearances" />
  );

  if (error) {
    return (
      <>
        {header}
        <Card>
          {error.status === 404 ? (
            <ErrorState
              title="Clearance not found"
              message="This clearance does not exist or is not assigned to you."
            />
          ) : (
            <ErrorState error={error} onRetry={reload} />
          )}
        </Card>
      </>
    );
  }

  if (loading && !data) {
    return (
      <>
        {header}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card title="My office">
              <SkeletonText lines={4} />
            </Card>
            <Card title="Student information">
              <SkeletonText lines={4} />
            </Card>
          </div>
          <Card title="Clearance progress">
            <SkeletonText lines={6} />
          </Card>
        </div>
      </>
    );
  }

  const { clearance, profile } = data;
  const student = clearance.student ?? {};
  const offices = clearance.clearance_offices ?? [];
  const mine = offices.filter((item) => item.assigned_officer?.employee_id === profile.employee_id);
  const canAct = ACTIVE_CLEARANCE.includes(clearance.status);

  function handleDone(message) {
    setDialog(null);
    toast.success(message);
    reload();
  }

  return (
    <>
      <PageHeader
        title={`Clearance #${clearance.id}`}
        description={`${clearance.clearance_type?.name ?? 'Clearance'} · ${student.full_name}`}
        backTo="/officer/clearances"
        backLabel="Back to clearances"
        actions={<StatusBadge status={clearance.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {mine.length === 0 ? (
            <Card title="My office">
              <Alert>You are not assigned to an office on this clearance.</Alert>
            </Card>
          ) : (
            mine.map((item) => (
              <MyOfficeCard
                key={item.id}
                item={item}
                canAct={canAct}
                onClear={() => setDialog({ type: 'clear', office: item })}
                onFlag={() => setDialog({ type: 'flag', office: item })}
              />
            ))
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

        <Card title="Clearance progress" description="All six offices">
          <ClearanceProgress offices={offices} />
        </Card>
      </div>

      {dialog?.type === 'clear' && (
        <ClearModal
          office={dialog.office}
          studentName={student.full_name}
          onClose={() => setDialog(null)}
          onDone={handleDone}
          onStale={reload}
        />
      )}

      {dialog?.type === 'flag' && (
        <FlagIssueModal
          office={dialog.office}
          studentName={student.full_name}
          onClose={() => setDialog(null)}
          onDone={handleDone}
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