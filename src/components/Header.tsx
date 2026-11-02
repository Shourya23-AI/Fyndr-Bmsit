import { Link, useRoute } from '../lib/router';
import { useSaved } from '../lib/saved';
import { useTheme } from '../lib/theme';
import { Logo } from './Logo';
import { MoonIcon, SunIcon } from './icons';

const NAV: readonly { to: string; label: string }[] = [
  { to: '/jobs', label: 'Jobs' },
  { to: '/internships', label: 'Internships' },
  { to: '/courses', label: 'Courses' },
  { to: '/library', label: 'Library' },
  { to: '/community', label: 'Community' },
];

export function Header() {
  const { path } = useRoute();
  const { theme, toggle } = useTheme();
  const saved = useSaved();
  const on = (to: string): boolean => path === to || path.startsWith(to + '/');

  return (
    <header className="header">
      <div className="header__inner">
        <Logo />
        <nav className="nav" aria-label="Main">
          {NAV.map(item => (
            <Link key={item.to} to={item.to} className="nav__link" aria-current={on(item.to) ? 'page' : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header__tools">
          <Link to="/saved" className="nav__link nav__link--saved" aria-current={on('/saved') ? 'page' : undefined}>
            Saved
            {saved.ids.length > 0 && <span className="count-pill">{saved.ids.length}</span>}
          </Link>
          <button type="button" className="icon-btn" onClick={toggle} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <Link to="/login" className="btn btn--solid btn--small">
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}
