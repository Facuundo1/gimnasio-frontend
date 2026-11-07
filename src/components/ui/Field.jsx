import { useId } from 'react';

export function Field({ label, error, hint, htmlFor, full = false, children }) {
  return (
    <div className={`field${full ? ' field--full' : ''}`}>
      {label && (
        <label className="field__label" htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="field__hint">{hint}</p>}
      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ label, error, hint, full, id, className = '', ...props }) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <Field label={label} error={error} hint={hint} htmlFor={fieldId} full={full}>
      <input id={fieldId} className={`input ${className}`} aria-invalid={error ? true : undefined} {...props} />
    </Field>
  );
}

export function Select({ label, error, hint, full, id, className = '', children, ...props }) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <Field label={label} error={error} hint={hint} htmlFor={fieldId} full={full}>
      <select id={fieldId} className={`input input--select ${className}`} aria-invalid={error ? true : undefined} {...props}>
        {children}
      </select>
    </Field>
  );
}
