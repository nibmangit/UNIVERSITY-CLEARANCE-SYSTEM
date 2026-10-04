import Skeleton from './Skeleton';
import { cx } from './styles';

const VALUE_TONES = {
  default: 'text-slate-900',
  sky: 'text-sky-800',
  emerald: 'text-emerald-700',
  red: 'text-red-700',
  amber: 'text-amber-700',
};


export default function StatCard({ label, value, hint, tone = 'default', loading = false, className }) {
  return (
    <div
      className={cx('rounded-lg border border-slate-200 bg-white p-5', className)}
      aria-busy={loading || undefined}
    >
      <p className="text-sm font-medium text-slate-600">{label}</p>

      {loading ? (
        <Skeleton className="mt-3 h-8 w-20" />
      ) : (
        <p
          className={cx(
            'mt-2 text-3xl font-semibold tabular-nums',
            VALUE_TONES[tone] ?? VALUE_TONES.default,
          )}
        >
          {value ?? '—'}
        </p>
      )}

      {hint && !loading && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
    </div>
  );
}