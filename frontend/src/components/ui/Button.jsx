import { Link } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { cx, focusRing } from './styles';

const VARIANTS = {
  primary: 'bg-sky-900 text-white hover:bg-sky-800',
  secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  danger: 'bg-red-700 text-white hover:bg-red-800',
  ghost: 'text-slate-700 hover:bg-slate-100',
  'danger-ghost': 'text-red-700 hover:bg-red-50',
};

const SIZES = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
};


export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  to,
  href,
  type = 'button',
  className,
  children,
  ...rest
}) {
  const classes = cx(
    'inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap',
    'disabled:pointer-events-none disabled:opacity-60',
    focusRing,
    SIZES[size],
    VARIANTS[variant],
    fullWidth && 'w-full',
    className,
  );

  if (href && !disabled && !loading) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  // A link only makes sense when the button is usable.
  if (to && !disabled && !loading) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classes}
      {...rest}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  );
}