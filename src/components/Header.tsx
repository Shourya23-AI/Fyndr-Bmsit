import { useAuth } from '../lib/auth';
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
  const auth = useAuth();
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
          {auth.phase === 'ready' && auth.me ? (
            <details className="menu">
              <summary className="menu__btn" aria-label="Account menu">
                {auth.me.photo ? <img className="avatar" src={auth.me.photo} alt="" /> : <span className="avatar" aria-hidden="true">{auth.me.name.slice(0, 1).toUpperCase()}</span>}
              </summary>
              <div className="menu__list">
                <p className="menu__who">{auth.me.role === 'org' ? auth.me.orgName : auth.me.name}</p>
                <Link to="/dashboard" className="menu__item">Dashboard</Link>
                {auth.me.role === 'user' && <Link to="/profile" className="menu__item">Profile</Link>}
                {!auth.me.phoneVerified && auth.me.role !== 'moderator' && auth.me.role !== 'admin' && <Link to="/phone" className="menu__item">Verify phone</Link>}
                <button type="button" className="menu__item" onClick={() => void auth.logout()}>Sign out</button>
              </div>
            </details>
          ) : auth.phase === 'loading' ? null : (
            <Link to="/login" className="btn btn--solid btn--small">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
