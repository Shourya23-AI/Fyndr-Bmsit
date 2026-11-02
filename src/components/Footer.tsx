import { Link } from '../lib/router';
import { Logo } from './Logo';

const SOCIAL: readonly [string, string, string][] = [
  ['in', 'LinkedIn', 'https://www.linkedin.com/'],
  ['X', 'X (Twitter)', 'https://x.com/'],
  ['YT', 'YouTube', 'https://www.youtube.com/'],
  ['IG', 'Instagram', 'https://www.instagram.com/'],
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <Logo />
          <p className="footer__note">
            Jobs | Courses | Growth. Fyndr lists where to look. Every button opens the other site's own search page, and Fyndr has not checked the individual postings or courses
            there. Never pay money to get a job or internship.
          </p>
        </div>
        <nav className="footer__col" aria-label="Explore">
          <h4>Explore</h4>
          <Link to="/jobs">Jobs</Link>
          <Link to="/internships">Internships</Link>
          <Link to="/courses">Courses</Link>
          <Link to="/library">Library</Link>
          <Link to="/community">Community</Link>
          <Link to="/groups">Groups</Link>
        </nav>
        <nav className="footer__col" aria-label="About">
          <h4>Company</h4>
          <Link to="/organizations">Post a job</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </div>
      <div className="footer__inner footer__bar" style={{ display: 'flex', paddingTop: '1rem', paddingBottom: '1.5rem' }}>
        <span>© {new Date().getFullYear()} Fyndr. All rights reserved.</span>
        <div className="social">
          {SOCIAL.map(([t, label, url]) => (
            <a key={label} href={url} target="_blank" rel="noopener noreferrer" aria-label={label}>
              {t}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
