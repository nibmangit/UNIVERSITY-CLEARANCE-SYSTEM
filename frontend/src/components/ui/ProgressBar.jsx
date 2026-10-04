import { cx } from './styles';

const FILL = {
  sky: 'bg-sky-700',
  emerald: 'bg-emerald-600',
  red: 'bg-red-600',
  amber: 'bg-amber-500',
};

/** A horizontal bar. `value` is 0 to 100. */
export default function ProgressBar({ value, tone = 'sky', label = 'Progress', className }) {
  const percent = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cx('h-2.5 w-full overflow-hidden rounded-full bg-slate-200', className)}
    >
      <div
        className={cx(
          'h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none',
          FILL[tone] ?? FILL.sky,
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}