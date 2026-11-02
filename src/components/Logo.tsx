import { Link } from '../lib/router';

export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="9" fill="var(--cobalt)" />
      <circle cx="14.5" cy="14.5" r="6" fill="none" stroke="#fff" strokeWidth="3" />
      <path d="M19.2 19.2 25 25" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Fyndr home">
      <LogoMark />
      <span className="logo__word">fyndr</span>
    </Link>
  );
}
