import { useEffect, useRef } from 'react';
import { CloseIcon, SearchIcon } from './icons';

interface Props {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  /** Live text inside the field, such as "1,284 matches". */
  status?: string;
  size?: 'hero' | 'normal';
  /** Pressing "/" anywhere on the page jumps to this field. */
  slashFocus?: boolean;
}

export function SearchField({ value, onChange, label, placeholder, status, size = 'normal', slashFocus = true }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!slashFocus) return;
    const onKey = (e: KeyboardEvent): void => {
      const t = e.target as HTMLElement | null;
      const typing = t !== null && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [slashFocus]);

  return (
    <div className={`field field--${size}`} role="search">
      <label className="field__icon" htmlFor="q" title={label}>
        <SearchIcon size={size === 'hero' ? 26 : 20} />
        <span className="sr-only">{label}</span>
      </label>
      <input
        id="q"
        ref={ref}
        className="field__input"
        type="search"
        inputMode="search"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
      />
      {value && (
        <button type="button" className="field__clear" onClick={() => { onChange(''); ref.current?.focus(); }} aria-label="Clear search">
          <CloseIcon />
        </button>
      )}
      {status && (
        <span className="field__status" aria-live="polite">
          {status}
        </span>
      )}
    </div>
  );
}
