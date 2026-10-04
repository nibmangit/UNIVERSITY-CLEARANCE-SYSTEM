
export function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}
 
export const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-800';



/** Shared look of Input, Textarea and Select. */
export function controlClasses(hasError) {
  return cx(
    'block w-full rounded-md border bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 sm:text-sm',
    'focus:outline-2 focus:outline-offset-1',
    'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
    hasError
      ? 'border-red-600 focus:outline-red-600'
      : 'border-slate-300 focus:border-sky-800 focus:outline-sky-800',
  );
}

/** Points a control at its error or hint text, so screen readers read it with the field. */
export function describedBy(id, hint, error) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}