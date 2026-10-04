import { cx } from './styles';

const TONES = {
  success: { color: 'text-emerald-600', path: 'M8 12.5l3 3 5-6' },
  error: { color: 'text-red-600', path: 'M12 8v5M12 16.5h.01' },
  warning: { color: 'text-amber-600', path: 'M12 8v5M12 16.5h.01' },
  info: { color: 'text-sky-700', path: 'M12 11v5M12 8h.01' },
};

/** One message. You do not use this directly: call useToast() instead. */
export default function Toast({ tone = 'info', title, message, onDismiss }) {
  const style = TONES[tone] ?? TONES.info;

  return (
    <div
      role={tone === 'error' ? 'alert' : undefined}
      className="pointer-events-auto flex w-full items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-lg"
    >
      <svg
        className={cx('mt-0.5 h-5 w-5 shrink-0', style.color)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d={style.path} strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <div className="min-w-0 flex-1">
        {title && <p className="text-sm font-semibold text-slate-900">{title}</p>}
        <p className="text-sm text-slate-700">{message}</p>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="-mt-1 -mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-sky-800"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}