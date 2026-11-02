import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

interface FieldProps {
  label: string;
  hint?: string;
  children: (id: string) => ReactNode;
  wide?: boolean;
}

export function Field({ label, hint, children, wide }: FieldProps) {
  const id = useId();
  return (
    <div className={wide ? 'form-field form-field--wide' : 'form-field'}>
      <label htmlFor={id} className="form-field__label">
        {label}
      </label>
      {children(id)}
      {hint && <p className="form-field__hint">{hint}</p>}
    </div>
  );
}

type TextProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & { label: string; hint?: string; wide?: boolean };
export function TextField({ label, hint, wide, ...rest }: TextProps) {
  return (
    <Field label={label} hint={hint} wide={wide}>
      {id => <input id={id} className="input" {...rest} />}
    </Field>
  );
}

type AreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & { label: string; hint?: string; wide?: boolean };
export function AreaField({ label, hint, wide, ...rest }: AreaProps) {
  return (
    <Field label={label} hint={hint} wide={wide}>
      {id => <textarea id={id} className="input input--area" {...rest} />}
    </Field>
  );
}

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> & { label: string; options: readonly (string | { value: string; label: string })[]; placeholder?: string; hint?: string; wide?: boolean };
export function SelectField({ label, options, placeholder, hint, wide, ...rest }: SelectProps) {
  return (
    <Field label={label} hint={hint} wide={wide}>
      {id => (
        <select id={id} className="input" {...rest}>
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map(o => {
            const opt = typeof o === 'string' ? { value: o, label: o } : o;
            return (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            );
          })}
        </select>
      )}
    </Field>
  );
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'error' | 'ok'; children: ReactNode }) {
  return (
    <p className={`notice notice--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  );
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="spinner" role="status" aria-label={label}>
      <span className="spinner__dot" />
      <span className="spinner__dot" />
      <span className="spinner__dot" />
    </div>
  );
}
