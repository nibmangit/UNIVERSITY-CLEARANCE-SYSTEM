import { useMemo, useState } from 'react';

import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import SearchInput from '../../components/ui/SearchInput';
import { SkeletonText } from '../../components/ui/Skeleton';
import StatusBadge from '../../components/ui/StatusBadge';
import Tabs from '../../components/ui/Tabs';
import Textarea from '../../components/ui/Textarea';
import { useApi } from '../../hooks/useApi';
import { usePagination } from '../../hooks/usePagination';
import { useToast } from '../../hooks/useToast';
import { clearanceService } from '../../services/clearanceService';
import { getErrorMessage } from '../../utils/errors';
import { formatDateTime, timeAgo } from '../../utils/format';
import { ISSUE_STATUS } from '../../utils/status';

const PAGE_SIZE = 2;

const FILTERS = [
  { id: ISSUE_STATUS.OPEN, label: 'Open' },
  { id: ISSUE_STATUS.RESOLVED, label: 'Resolved' },
  { id: 'all', label: 'All' },
];

function emptyCopy(filter, hasAny) {
  if (!hasAny) {
    return {
      title: 'No issues yet',
      message: 'Issues you report on a clearance will appear here until they are resolved.',
    };
  }
  if (filter === ISSUE_STATUS.OPEN) {
    return { title: "You're all caught up", message: 'No open issues.' };
  }
  if (filter === ISSUE_STATUS.RESOLVED) {
    return { title: 'Nothing here', message: 'No resolved issues yet.' };
  }
  return { title: 'Nothing here', message: 'No issues to show.' };
}

function searchText(issue) {
  return [
    issue.student?.full_name,
    issue.student?.student_id,
    issue.reason,
    issue.office?.name,
    `#${issue.clearance_id}`,
  ]
    .join(' ')
    .toLowerCase();
}

// Mounted only while open, so the note starts empty every time.
function ResolveModal({ issue, onClose, onDone, onStale }) {
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSubmitError('');

    if (!note.trim()) {
      setNoteError('Resolution note is required.');
      return;
    }
    setNoteError('');

    setSubmitting(true);
    try {
      await clearanceService.resolveIssue(issue.id, note.trim());
      onDone('Issue resolved. Your office is pending again, so you can clear the student.');
    } catch (err) {
      setSubmitError(getErrorMessage(err));
      setSubmitting(false);
      // Already resolved elsewhere, no longer yours, or gone: show the real state behind the dialog.
      if ([400, 403, 404].includes(err.status)) onStale();
    }
  }

  return (
    <Modal
      open
      title="Resolve issue"
      description={`${issue.office?.name} · ${issue.student?.full_name}`}
      onClose={onClose}
      busy={submitting}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="resolve-issue-form" loading={submitting}>
            Resolve issue
          </Button>
        </>
      }
    >
      <div className="rounded-md bg-slate-50 px-3 py-2.5 text-sm">
        <p className="font-medium text-slate-900">{issue.reason}</p>
        <p className="mt-0.5 whitespace-pre-line text-slate-700">{issue.description}</p>
      </div>

      <form id="resolve-issue-form" onSubmit={submit} noValidate className="mt-4 space-y-4">
        <Textarea
          label="Resolution note"
          required
          placeholder="Describe how the issue was resolved…"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          error={noteError}
        />

        <Alert>
          Resolving this puts your office back to <strong>Pending</strong>. You will then need to clear
          the student again.
        </Alert>

        {submitError && <Alert tone="error">{submitError}</Alert>}
      </form>
    </Modal>
  );
}

function IssueRow({ issue, onResolve }) {
  const open = issue.status === ISSUE_STATUS.OPEN;

  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{issue.student?.full_name}</p>
          <p className="text-xs text-slate-500">
            {issue.student?.student_id} · {issue.office?.name} · Clearance #{issue.clearance_id}
          </p>
        </div>
        <StatusBadge status={issue.status} />
      </div>

      <p className="mt-3 text-sm font-medium text-slate-900">{issue.reason}</p>
      <p className="mt-0.5 text-sm whitespace-pre-line text-slate-700">{issue.description}</p>
      <p className="mt-2 text-xs text-slate-500" title={formatDateTime(issue.created_at)}>
        Reported {timeAgo(issue.created_at)}
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

      <div className="mt-3 flex flex-wrap gap-2">
        {open && (
          <Button size="sm" onClick={() => onResolve(issue)}>
            Resolve
            <span className="sr-only"> issue for {issue.student?.full_name}</span>
          </Button>
        )}
        <Button to={`/officer/clearances/${issue.clearance_id}`} size="sm" variant="secondary">
          View clearance
          <span className="sr-only"> #{issue.clearance_id}</span>
        </Button>
      </div>
    </li>
  );
}

export default function Issues() {
  const toast = useToast();
  const { data, loading, error, reload } = useApi(clearanceService.listOfficerIssues);

  const [filter, setFilter] = useState(ISSUE_STATUS.OPEN);
  const [query, setQuery] = useState('');
  const [resolving, setResolving] = useState(null);

  const issues = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return issues.filter(
      (issue) =>
        (filter === 'all' || issue.status === filter) && (!needle || searchText(issue).includes(needle)),
    );
  }, [issues, filter, query]);

  const { page, setPage, pageItems, total } = usePagination(filtered, PAGE_SIZE);

  const tabs = FILTERS.map((option) => ({
    ...option,
    count: option.id === 'all' ? issues.length : issues.filter((issue) => issue.status === option.id).length,
  }));

  function changeFilter(value) {
    setFilter(value);
    setPage(1);
  }

  function changeQuery(value) {
    setQuery(value);
    setPage(1);
  }

  function clearFilters() {
    setQuery('');
    setFilter('all');
    setPage(1);
  }

  function handleDone(message) {
    setResolving(null);
    toast.success(message);
    reload();
  }

  const header = <PageHeader title="Issues" description="Issues reported on your offices." />;

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
        <Card>
          <SkeletonText lines={6} />
        </Card>
      </>
    );
  }

  const empty = emptyCopy(filter, issues.length > 0);

  return (
    <>
      {header}

      {issues.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <SearchInput
            className="w-full sm:max-w-xs"
            value={query}
            onChange={changeQuery}
            label="Search issues"
            placeholder="Student, reason or office"
          />
          <Tabs label="Filter issues" tabs={tabs} value={filter} onChange={changeFilter} />
        </div>
      )}

      <Card padded={false}>
        {pageItems.length === 0 ? (
          <EmptyState
            title={query ? 'No matches' : empty.title}
            message={query ? 'No issue matches your search.' : empty.message}
            action={
              query || (filter !== 'all' && issues.length > 0) ? (
                <Button variant="secondary" onClick={clearFilters}>
                  Show all issues
                </Button>
              ) : null
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {pageItems.map((issue) => (
              <IssueRow key={issue.id} issue={issue} onResolve={setResolving} />
            ))}
          </ul>
        )}

        <Pagination
          className="border-t border-slate-200 px-4 py-3"
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onPageChange={setPage}
        />
      </Card>

      {resolving && (
        <ResolveModal
          issue={resolving}
          onClose={() => setResolving(null)}
          onDone={handleDone}
          onStale={reload}
        />
      )}
    </>
  );
}