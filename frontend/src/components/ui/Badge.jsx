import { cx } from './styles';

const TONES = {
  slate: { pill: 'bg-slate-100 text-slate-700 ring-slate-500/20', dot: 'bg-slate-500' },
  sky: { pill: 'bg-sky-50 text-sky-800 ring-sky-600/20', dot: 'bg-sky-600' },
  emerald: { pill: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20', dot: 'bg-emerald-600' },
  red: { pill: 'bg-red-50 text-red-800 ring-red-600/20', dot: 'bg-red-600' },
  amber: { pill: 'bg-amber-50 text-amber-900 ring-amber-600/25', dot: 'bg-amber-500' },
};

export default function Badge({ tone = 'slate', dot = true, className, children }) {
  const style = TONES[tone] ?? TONES.slate;

  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset',
        style.pill,
        className,
      )}
    >
      {dot && <span className={cx('h-1.5 w-1.5 rounded-full', style.dot)} aria-hidden="true" />}
      {children}
    </span>
  );
}