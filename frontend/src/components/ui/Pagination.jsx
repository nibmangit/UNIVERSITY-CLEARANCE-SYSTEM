import Button from './Button';
import { cx } from './styles';


export default function Pagination({ page, pageSize, total, onPageChange, className }) {
  if (total <= pageSize) return null;

  const pageCount = Math.ceil(total / pageSize);
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav
      aria-label="Pagination"
      className={cx('flex flex-wrap items-center justify-between gap-3', className)}
    >
      <p className="text-sm text-slate-600">
        Showing{' '}
        <span className="font-medium text-slate-900">
          {from}–{to}
        </span>{' '}
        of <span className="font-medium text-slate-900">{total}</span>
      </p>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <span className="text-sm text-slate-600" aria-live="polite">
          Page {page} of {pageCount}
        </span>
        <Button size="sm" variant="secondary" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </nav>
  );
}