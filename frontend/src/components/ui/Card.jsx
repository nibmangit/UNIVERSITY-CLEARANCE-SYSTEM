import { cx } from './styles';

export default function Card({ title, description, actions, padded = true, className, children }) {
  const hasHeader = title || description || actions;

  return (
    <section
      className={cx('rounded-lg border border-slate-200 bg-white', !padded && 'overflow-hidden', className)}
    >
      {hasHeader && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-slate-600">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}

      <div className={padded ? 'p-5' : undefined}>{children}</div>
    </section>
  );
}