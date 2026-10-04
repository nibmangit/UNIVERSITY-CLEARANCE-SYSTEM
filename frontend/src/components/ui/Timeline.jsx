import { cx } from './styles';

const DOT = {
  done: 'border-sky-900 bg-sky-900',
  alert: 'border-red-700 bg-red-700',
  current: 'border-sky-900 bg-white ring-4 ring-sky-100',
  upcoming: 'border-slate-300 bg-white',
};

const STATE_TEXT = {
  done: 'Completed',
  alert: 'Needs attention',
  current: 'Current step',
  upcoming: 'Upcoming',
};


export default function Timeline({ items, className }) {
  return (
    <ol className={className}>
      {items.map((item, index) => {
        const status = item.status ?? 'done';
        const isLast = index === items.length - 1;

        return (
          <li key={item.id ?? index} className={cx('relative pl-8', !isLast && 'pb-6')}>
            {!isLast && (
              <span className="absolute top-5 -bottom-1 left-[7px] w-px bg-slate-200" aria-hidden="true" />
            )}
            <span
              className={cx('absolute top-1 left-0 h-4 w-4 rounded-full border-2', DOT[status])}
              aria-hidden="true"
            />

            <p className={cx('text-sm font-medium', status === 'upcoming' ? 'text-slate-500' : 'text-slate-900')}>
              <span className="sr-only">{STATE_TEXT[status]}: </span>
              {item.title}
            </p>
            {item.description && <p className="mt-0.5 text-sm text-slate-600">{item.description}</p>}
            {item.time && <p className="mt-0.5 text-xs text-slate-500">{item.time}</p>}
          </li>
        );
      })}
    </ol>
  );
}