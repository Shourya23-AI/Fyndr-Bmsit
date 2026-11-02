import { Link } from '../lib/router';

interface Props {
  title: string;
  /** Which delivery part builds this page. */
  part: 2 | 3;
  about: string;
}

export function ComingSoon({ title, part, about }: Props) {
  return (
    <div className="page">
      <header className="page-head">
        <h1 className="page-head__title">{title}</h1>
        <p className="page-head__lead">{about}</p>
      </header>
      <div className="empty">
        <p className="empty__title">This page is not rebuilt yet. It arrives in Part {part}.</p>
        <p className="empty__text">Jobs, internships, courses and saved items already work.</p>
        <Link to="/browse" className="btn btn--solid">
          Browse listings
        </Link>
      </div>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="page">
      <header className="page-head">
        <h1 className="page-head__title">That page does not exist</h1>
        <p className="page-head__lead">The address may be old or mistyped.</p>
      </header>
      <Link to="/" className="btn btn--solid">
        Go to the search
      </Link>
    </div>
  );
}
