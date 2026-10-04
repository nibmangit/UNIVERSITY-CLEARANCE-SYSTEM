import { useId } from 'react';
import FormField from './FormField';
import { controlClasses, cx, describedBy } from './styles';


export default function Select({
  label,
  hint,
  error,
  required,
  id,
  options = [],
  placeholder,
  className,
  children,
  ...rest
}) {
  const autoId = useId();
  const selectId = id ?? autoId;

  return (
    <FormField id={selectId} label={label} hint={hint} error={error} required={required}>
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        aria-describedby={describedBy(selectId, hint, error)}
        className={cx(controlClasses(Boolean(error)), 'h-10', className)}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
    </FormField>
  );
}