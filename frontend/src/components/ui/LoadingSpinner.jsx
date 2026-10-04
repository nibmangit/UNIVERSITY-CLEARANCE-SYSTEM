import { cx } from './styles';

const SIZES = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-8 w-8',
};

export default function LoadingSpinner({ size = 'md', label, className }) {
  const spinner = (
    <svg
      className={cx('animate-spin motion-reduce:animate-none', SIZES[size], className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );

  if (!label) return spinner;

  return (
    <span role="status" className="inline-flex items-center gap-2 text-sm text-slate-600">
      {spinner}
      {label}
    </span>
  );
}