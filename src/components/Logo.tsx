import { Link } from '../lib/router';

export const BRAND = 'Fyndr';

/** The brand mark from the reference board: navy F, rising arrow, orange search lens. */
export function LogoMark({ height = 38 }: { height?: number }) {
  return <img className="logo__mark" src={`${import.meta.env.BASE_URL}brand/logo-mark.png`} alt="" height={height} style={{ height }} />;
}

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label={`${BRAND} home`}>
      <LogoMark />
      <span className="logo__word">
        Fynd<b>r</b>
      </span>
    </Link>
  );
}
