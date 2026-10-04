import Button from './ui/Button';
import Card from './ui/Card';
import { SkeletonText } from './ui/Skeleton';
import { cx } from './ui/styles';
import { useApi } from '../hooks/useApi';
import { notificationService } from '../services/notificationService';
import { timeAgo } from '../utils/format';

/** The latest few notifications with a link to the full page. */
export default function RecentNotifications({ viewAllTo, limit = 3, className }) {
  const { data, loading, error, reload } = useApi(notificationService.list);
  const items = (data ?? []).slice(0, limit);

  let content;

  if (error) {
    content = (
      <div role="alert" className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <span>Couldn't load notifications.</span>
        <Button size="sm" variant="secondary" onClick={reload}>
          Try again
        </Button>
      </div>
    );
  } else if (loading && !data) {
    content = <SkeletonText lines={3} />;
  } else if (items.length === 0) {
    content = <p className="text-sm text-slate-600">You're all caught up.</p>;
  } else {
    content = (
      <ul className="divide-y divide-slate-100">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            {!item.is_read ? (
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky-600">
                <span className="sr-only">Unread</span>
              </span>
            ) : (
              <span className="mt-1.5 h-2 w-2 shrink-0" aria-hidden="true" />
            )}
            <div className="min-w-0 flex-1">
              <p className={cx('text-sm', item.is_read ? 'font-medium text-slate-700' : 'font-semibold text-slate-900')}>
                {item.title}
              </p>
              <p className="mt-0.5 text-sm text-slate-600">{item.message}</p>
              <p className="mt-0.5 text-xs text-slate-500">{timeAgo(item.created_at)}</p>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Card
      className={className}
      title="Recent notifications"
      actions={
        viewAllTo && (
          <Button to={viewAllTo} size="sm" variant="secondary">
            View all
          </Button>
        )
      }
    >
      {content}
    </Card>
  );
}