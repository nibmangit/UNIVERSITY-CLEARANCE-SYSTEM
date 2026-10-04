import { useState } from 'react';

import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import PageHeader from '../../components/ui/PageHeader';
import { SkeletonText } from '../../components/ui/Skeleton';
import Tabs from '../../components/ui/Tabs';
import { cx } from '../../components/ui/styles';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { announceNotificationChange, notificationService } from '../../services/notificationService';
import { getErrorMessage } from '../../utils/errors';
import { timeAgo } from '../../utils/format';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'CLEARANCE', label: 'Clearance' },
  { id: 'ISSUE', label: 'Issues' },
];

function matches(filterId, item) {
  if (filterId === 'all') return true;
  if (filterId === 'unread') return !item.is_read;
  return item.type === filterId;
}

function emptyCopy(filterId) {
  switch (filterId) {
    case 'unread':
      return { title: "You're all caught up", message: 'No unread notifications.' };
    case 'CLEARANCE':
      return { title: 'Nothing here', message: 'No clearance notifications.' };
    case 'ISSUE':
      return { title: 'Nothing here', message: 'No issue notifications.' };
    default:
      return {
        title: 'No notifications yet',
                message: "You'll be notified here when there is something new.",
      };
  }
}

function TypeIcon({ type }) {
  const isIssue = type === 'ISSUE';

  return (
    <span
      className={cx(
        'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
        isIssue ? 'bg-red-50 text-red-700' : 'bg-sky-50 text-sky-800',
      )}
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        {isIssue ? (
          <>
            <path d="M12 4l9 16H3L12 4z" strokeLinejoin="round" />
            <path d="M12 10v4M12 17h.01" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M7 3h7l5 5v13H7V3z" strokeLinejoin="round" />
            <path d="M14 3v5h5M10 13h6M10 17h6" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
      </svg>
    </span>
  );
}

function NotificationRow({ item, busy, onMarkRead, clearanceBase }) {
  const unread = !item.is_read;

  return (
    <li className={cx('flex gap-3 px-5 py-4', unread && 'bg-sky-50/70')}>
      <TypeIcon type={item.type} />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className={cx('text-sm', unread ? 'font-semibold text-slate-900' : 'font-medium text-slate-700')}>
            {unread && <span className="sr-only">Unread: </span>}
            {item.title}
          </p>
          <span className="shrink-0 text-xs text-slate-500">{timeAgo(item.created_at)}</span>
        </div>

        <p className="mt-0.5 text-sm text-slate-600">{item.message}</p>

        {(item.clearance || unread) && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {item.clearance && (
              <Button
                to={`${clearanceBase}/${item.clearance}`}
                size="sm"
                variant="secondary"
                onClick={() => unread && onMarkRead(item.id)}
              >
                View clearance
              </Button>
            )}
            {unread && (
              <Button size="sm" variant="ghost" loading={busy} onClick={() => onMarkRead(item.id)}>
                Mark as read
              </Button>
            )}
          </div>
        )}
      </div>

      {unread && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-sky-600" aria-hidden="true" />}
    </li>
  );
}

export default function Notifications() {
  const { data, loading, error, reload } = useApi(notificationService.list);
    const { role } = useAuth();
  const clearanceBase = role === 'REGISTRAR' ? '/registrar/clearances' : '/student/clearance';

  // Server data, plus the read marks we have applied since it was loaded.
  const [local, setLocal] = useState(null);
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [actionError, setActionError] = useState('');

  const items = local ?? data ?? [];
  const unreadCount = items.filter((item) => !item.is_read).length;
  const visible = items.filter((item) => matches(filter, item));

  const tabs = FILTERS.map((option) => ({
    ...option,
    count: items.filter((item) => matches(option.id, item)).length,
  }));

  function retry() {
    setLocal(null);
    reload();
  }

  async function markRead(id) {
    setActionError('');
    setBusyId(id);
    try {
      await notificationService.markRead(id);
      setLocal((previous) =>
        (previous ?? data ?? []).map((item) => (item.id === id ? { ...item, is_read: true } : item)),
      );
      announceNotificationChange();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function markAllRead() {
    setActionError('');
    setMarkingAll(true);
    try {
      await notificationService.markAllRead();
      setLocal((previous) => (previous ?? data ?? []).map((item) => ({ ...item, is_read: true })));
      announceNotificationChange();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setMarkingAll(false);
    }
  }

  const header = (
    <PageHeader
      title="Notifications"
      description={unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up."}
      actions={
        <Button variant="secondary" disabled={unreadCount === 0} loading={markingAll} onClick={markAllRead}>
          Mark all read
        </Button>
      }
    />
  );

  if (error) {
    return (
      <>
        <PageHeader title="Notifications" />
        <Card>
          <ErrorState error={error} onRetry={retry} />
        </Card>
      </>
    );
  }

  if (loading && !data) {
    return (
      <>
        <PageHeader title="Notifications" />
        <Card>
          <SkeletonText lines={6} />
        </Card>
      </>
    );
  }

  const empty = emptyCopy(filter);

  return (
    <>
      {header}

      <Tabs className="mb-4" label="Filter notifications" tabs={tabs} value={filter} onChange={setFilter} />

      {actionError && (
        <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
          {actionError}
        </p>
      )}

      <Card padded={false}>
        {visible.length === 0 ? (
          <EmptyState title={empty.title} message={empty.message} />
        ) : (
          <ul className="divide-y divide-slate-100">
            {visible.map((item) => (
              <NotificationRow key={item.id} item={item} busy={busyId === item.id} onMarkRead={markRead} clearanceBase={clearanceBase} />
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}