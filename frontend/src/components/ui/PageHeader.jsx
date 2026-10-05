import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cx, focusRing } from './styles';
import Breadcrumb from './Breadcrumb';


export default function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  backTo,
  backLabel = 'Back',
}) {

  useEffect(() => {
    document.title = `${title} · University Clearance`;
  }, [title]);

  return (
    <header className="mb-6">
      {breadcrumbs && <Breadcrumb items={breadcrumbs} className="mb-2" />}

      {backTo && (
        <Link
          to={backTo}
          className={cx(
            'mb-2 flex w-fit items-center gap-1 rounded text-sm font-medium text-slate-600 hover:text-slate-900',
            focusRing,
          )}
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {backLabel}
        </Link>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
        </div>

        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}