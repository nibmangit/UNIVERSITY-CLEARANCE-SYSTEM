import Badge from '../../components/ui/Badge';
import { ACTION_TONES, ROLE_LABELS, entityLabel, humanizeAction } from '../../utils/auditLog';
import { formatDateTime, timeAgo } from '../../utils/format';

// The columns of the activity table, shared by the dashboard and the log page.
export const AUDIT_LOG_COLUMNS = [
  {
    key: 'time',
    header: 'Time',
    render: (row) => (
      <div className="whitespace-nowrap">
        <p>{formatDateTime(row.created_at)}</p>
        <p className="text-xs text-slate-500">{timeAgo(row.created_at)}</p>
      </div>
    ),
  },
  {
    key: 'user',
    header: 'User',
    render: (row) => (
      <div>
        <p className="font-medium text-slate-900">{row.user?.full_name}</p>
        <p className="text-xs text-slate-500">
          {row.user?.university_id} · {ROLE_LABELS[row.user?.role] ?? row.user?.role}
        </p>
      </div>
    ),
  },
  {
    key: 'action',
    header: 'Action',
    render: (row) => <Badge tone={ACTION_TONES[row.action] ?? 'slate'}>{humanizeAction(row.action)}</Badge>,
  },
  {
    key: 'description',
    header: 'Details',
    render: (row) => <p className="max-w-md min-w-56 whitespace-normal text-slate-700">{row.description}</p>,
  },
  {
    key: 'record',
    header: 'Record',
    render: (row) => (
      <div className="whitespace-nowrap">
        <p>{entityLabel(row.entity_type)}</p>
        <p className="font-mono text-xs text-slate-500">#{row.entity_id}</p>
      </div>
    ),
  },
];