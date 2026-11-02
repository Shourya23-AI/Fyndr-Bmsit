import { Link } from '../lib/router';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <Logo />
          <p className="footer__note">
            Fyndr lists where to look. Every button opens the other site's own search page, and Fyndr has not checked the individual
            postings or courses there. Never pay money to get a job or internship.
          </p>
        </div>
        <nav className="footer__links" aria-label="About">
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}
