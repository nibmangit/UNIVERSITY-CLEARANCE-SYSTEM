import { cx, focusRing } from './styles';

export default function Tabs({ tabs, value, onChange, label = 'Filter', className }) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cx('inline-flex max-w-full flex-wrap gap-1 rounded-lg bg-slate-100 p-1', className)}
    >
      {tabs.map((tab) => {
        const selected = tab.id === value;

        return (
          <button
            key={tab.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(tab.id)}
            className={cx(
              'rounded-md px-3 py-1.5 text-sm font-medium',
              focusRing,
              selected
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900',
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 text-xs text-slate-500 tabular-nums">{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}