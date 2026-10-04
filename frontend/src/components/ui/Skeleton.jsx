import { cx } from './styles';

/** A grey pulsing block that stands in for content while it loads. Size it with className. */
export default function Skeleton({ className }) {
  return (
    <div
      className={cx('animate-pulse rounded-md bg-slate-200 motion-reduce:animate-none', className)}
      aria-hidden="true"
    />
  );
}

/** Several lines of placeholder text. The last line is shorter, like real text. */
export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cx('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} className={cx('h-4', index === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}