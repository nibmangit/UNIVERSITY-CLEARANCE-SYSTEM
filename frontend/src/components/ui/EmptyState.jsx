import { cx } from './styles';


export default function EmptyState({ title, message, action, className }) {
  return (
    <div className={cx('flex flex-col items-center px-4 py-10 text-center', className)}>
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <svg
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M3 13h5l1 3h6l1-3h5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 5h14l2 8v6H3v-6l2-8z" strokeLinejoin="round" />
        </svg>
      </span>
      <h2 className="mt-4 text-base font-semibold text-slate-900">{title}</h2>
      {message && <p className="mt-1 max-w-sm text-sm text-slate-600">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}