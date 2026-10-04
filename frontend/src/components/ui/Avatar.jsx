import { cx } from './styles';

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
};

function initialsOf(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';

  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return (first + last).toUpperCase();
}

/** A circle with the person's initials: <Avatar name="Abebe Kebede" size="lg" /> */
export default function Avatar({ name, size = 'md', className }) {
  return (
    <span
      role="img"
      aria-label={name || 'User'}
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-sky-100 font-semibold text-sky-900 select-none',
        SIZES[size],
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}