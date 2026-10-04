import ProgressBar from './ui/ProgressBar';
import { cx } from './ui/styles';
import { getOfficeProgress } from '../utils/status';

function CheckIcon() {
  return (
    <svg className="h-5 w-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg className="h-5 w-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 4l9 16H3L12 4z" strokeLinejoin="round" />
      <path d="M12 10v4M12 17h.01" strokeLinecap="round" />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

const ROWS = {
  CLEARED: { label: 'Cleared', text: 'text-emerald-800', Icon: CheckIcon },
  FLAGGED: { label: 'Flagged', text: 'text-red-700', Icon: WarningIcon },
  PENDING: { label: 'Pending', text: 'text-slate-500', Icon: PendingIcon },
};

 
export default function ClearanceProgress({ offices = [], className }) {
  const progress = getOfficeProgress(offices);
  const tone = progress.allCleared ? 'emerald' : progress.flagged > 0 ? 'red' : 'sky';

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-slate-900">
          {progress.cleared} / {progress.total} offices cleared
        </p>
        <p className="text-sm text-slate-600">{progress.percent}%</p>
      </div>

      <ProgressBar value={progress.percent} tone={tone} label="Clearance progress" className="mt-2" />

      <ul className="mt-4 divide-y divide-slate-100">
        {offices.map((item) => {
          const row = ROWS[item.status] ?? ROWS.PENDING;

          return (
            <li key={item.id ?? item.office?.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="flex items-center gap-2.5 text-slate-800">
                <row.Icon />
                {item.office?.name}
              </span>
              <span className={cx('font-medium', row.text)}>{row.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}