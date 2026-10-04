import { cx } from './styles';

const TONES = {
  info: 'border-sky-200 bg-sky-50 text-sky-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  error: 'border-red-200 bg-red-50 text-red-800',
};

/** <Alert tone="error">Something failed.</Alert>. Errors and warnings are announced to screen readers. */
export default function Alert({ tone = 'info', title, children, className }) {
  return (
    <div
      role={tone === 'error' || tone === 'warning' ? 'alert' : 'status'}
      className={cx('rounded-md border px-3 py-2.5 text-sm', TONES[tone] ?? TONES.info, className)}
    >
      {title && <p className="font-medium">{title}</p>}
      <div className={title ? 'mt-0.5' : undefined}>{children}</div>
    </div>
  );
}