import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import Dropdown from './ui/Dropdown';
import { SkeletonText } from './ui/Skeleton';
import { cx, focusRing } from './ui/styles';
import { useApi } from '../hooks/useApi';
import { notificationService, onNotificationChange } from '../services/notificationService';
import { timeAgo } from '../utils/format';

const POLL_MS = 60_000;

function BellPanel({ close, viewAllTo, clearancePath }) {
  const { data, loading, error, reload } = useApi(notificationService.list);
  const items = (data ?? []).slice(0, 5);

  function renderItem(item) {
    const content = (
      <>
        <span className="flex items-start justify-between gap-3">
          <span className={cx('text-sm', item.is_read ? 'font-medium text-slate-700' : 'font-semibold text-slate-900')}>
            {!item.is_read && <span className="sr-only">Unread: </span>}
            {item.title}
          </span>
          <span className="shrink-0 text-xs text-slate-500">{timeAgo(item.created_at)}</span>
        </span>
        <span className="mt-0.5 line-clamp-2 block text-sm text-slate-600">{item.message}</span>
      </>
    );

    const classes = cx(
      'block px-4 py-3 text-left',
      !item.is_read && 'bg-sky-50/70',
      item.clearance && cx('hover:bg-slate-50', focusRing),
    );

    return (
      <li key={item.id}>
        {item.clearance && clearancePath ? (
          <Link to={clearancePath(item.clearance)} onClick={close} className={classes}>
            {content}
          </Link>
        ) : (
          <div className={classes}>{content}</div>
        )}
      </li>
    );
  }

  let body;
  if (error) {
    body = (
      <div role="alert" className="px-4 py-6 text-center text-sm text-slate-600">
        <p>Couldn't load notifications.</p>
        <button type="button" onClick={reload} className={cx('mt-2 rounded font-medium text-sky-800 underline', focusRing)}>
          Try again
        </button>
      </div>
    );
  } else if (loading && !data) {
    body = (
      <div className="px-4 py-4">
        <SkeletonText lines={3} />
      </div>
    );
  } else if (items.length === 0) {
    body = <p className="px-4 py-6 text-center text-sm text-slate-600">You're all caught up.</p>;
  } else {
    body = <ul className="divide-y divide-slate-100">{items.map(renderItem)}</ul>;
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <p className="text-sm font-semibold text-slate-900">Notifications</p>
        <Link to={viewAllTo} onClick={close} className={cx('rounded text-sm font-medium text-sky-800 hover:underline', focusRing)}>
          View all
        </Link>
      </div>
      <div className="max-h-96 overflow-y-auto">{body}</div>
    </>
  );
}

export default function NotificationBell({ viewAllTo, clearancePath }) {
  const [count, setCount] = useState(0);
  const { pathname } = useLocation();

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    function refresh() {
      notificationService
        .unreadCount({ signal: controller.signal })
        .then((result) => {
          if (active) setCount(result.count);
        })
        .catch(() => {
          // A failed count check should never bother the user. The next refresh will retry.
        });
    }

    function handleVisibility() {
      if (document.visibilityState === 'visible') refresh();
    }

    refresh();
    const timer = setInterval(refresh, POLL_MS);
    const stopListening = onNotificationChange(refresh);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      active = false;
      controller.abort();
      clearInterval(timer);
      stopListening();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
    // pathname: check again whenever the user moves to another page.
  }, [pathname]);

  return (
    <Dropdown
      label={count > 0 ? `Notifications, ${count} unread` : 'Notifications'}
      buttonClassName="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      panelClassName="w-80 max-w-[calc(100vw-2rem)] sm:w-96"
      trigger={
        <>
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" strokeLinejoin="round" />
            <path d="M10 19a2 2 0 0 0 4 0" strokeLinecap="round" />
          </svg>
          {count > 0 && (
            <span
              aria-hidden="true"
              className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white"
            >
              {count > 99 ? '99+' : count}
            </span>
          )}
        </>
      }
    >
      {({ close }) => <BellPanel close={close} viewAllTo={viewAllTo} clearancePath={clearancePath} />}
    </Dropdown>
  );
}