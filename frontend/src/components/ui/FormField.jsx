/** The label, hint and error text around a form control. Input, Textarea and Select use it. */


export default function FormField({ id, label, hint, error, required, children }) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-800">
          {label}
          {required && (
            <span className="text-red-700" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
      )}

      <div className={label ? 'mt-1.5' : undefined}>{children}</div>

      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-700">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-sm text-slate-500">
            {hint}
          </p>
        )
      )}
    </div>
  );
}