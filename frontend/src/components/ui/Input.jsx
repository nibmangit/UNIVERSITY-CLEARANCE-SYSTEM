import { useId } from 'react';
import FormField from './FormField';
import { controlClasses, cx, describedBy } from './styles';


export default function Input({ label, hint, error, required, id, className, ...rest }) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <FormField id={inputId} label={label} hint={hint} error={error} required={required}>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        aria-describedby={describedBy(inputId, hint, error)}
        className={cx(controlClasses(Boolean(error)), 'h-10', className)}
        {...rest}
      />
    </FormField>
  );
}