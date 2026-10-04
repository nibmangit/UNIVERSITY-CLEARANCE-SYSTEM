import EmptyState from './EmptyState';
import Skeleton from './Skeleton';
import { cx } from './styles';

const ALIGN = { left: 'text-left', center: 'text-center', right: 'text-right' };


export default function Table({
  columns,
  rows = [],
  rowKey = 'id',
  loading = false,
  skeletonRows = 5,
  emptyState,
  caption,
  className,
}) {
  const getKey = typeof rowKey === 'function' ? rowKey : (row) => row[rowKey];

  return (
    <div className={cx('overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-slate-200 text-sm" aria-busy={loading || undefined}>
        {caption && <caption className="sr-only">{caption}</caption>}

        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cx(
                  'px-4 py-3 font-medium whitespace-nowrap text-slate-600',
                  ALIGN[column.align ?? 'left'],
                  column.headerClassName,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 bg-white">
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3">
                    <Skeleton className="h-4 w-full max-w-40" />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-0">
                {emptyState ?? <EmptyState title="Nothing to show" />}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={getKey(row)}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cx('px-4 py-3 text-slate-800', ALIGN[column.align ?? 'left'], column.className)}
                  >
                    {column.render ? column.render(row) : (row[column.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}