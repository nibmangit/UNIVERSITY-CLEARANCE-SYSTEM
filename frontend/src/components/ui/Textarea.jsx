import { useId } from 'react';
import FormField from './FormField';
import { controlClasses, cx, describedBy } from './styles';

/** A multi-line text box, used for issue descriptions and resolution notes. */
export default function Textarea({ label, hint, error, required, id, rows = 4, className, ...rest }) {
  const autoId = useId();
  const textareaId = id ?? autoId;

  return (
    <FormField id={textareaId} label={label} hint={hint} error={error} required={required}>
      <textarea
        id={textareaId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        aria-describedby={describedBy(textareaId, hint, error)}
        className={cx(controlClasses(Boolean(error)), 'py-2', className)}
        {...rest}
      />
    </FormField>
  );
}