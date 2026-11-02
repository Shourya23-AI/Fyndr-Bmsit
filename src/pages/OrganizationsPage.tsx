import { Link } from '../lib/router';

const STEPS: readonly (readonly [string, string])[] = [
  ['Register and pick your size', 'Small businesses can sign up with any email, Gmail included. Enterprises need a work email. We send a link to confirm the address.'],
  ['Our team reviews it', 'We check the website and the organization details. Until then, your listings stay in review.'],
  ['Get the verified badge', 'Approved organizations get a badge on every listing, and can post right away.'],
];

export function OrganizationsPage() {
  return (
    <div className="page">
      <header className="page-head">
        <h1 className="page-head__title">Hire people who applied on purpose.</h1>
        <p className="page-head__lead">Free to post. Reach students on a board that checks every listing, and review applicants in one place.</p>
        <p className="actions">
          <Link to="/register" className="btn btn--solid">Register your organization</Link>
          <Link to="/login" className="btn">Organization sign in</Link>
        </p>
      </header>
      <div className="cards cards--3">
        <article className="card"><h2 className="card__title">Reach verified students</h2><p className="muted">Candidates confirm their email and phone before they can apply.</p></article>
        <article className="card"><h2 className="card__title">Free to post</h2><p className="muted">Submit a listing and it goes live once our team approves it.</p></article>
        <article className="card"><h2 className="card__title">Applicants in one place</h2><p className="muted">See who applied to each listing and move them from reviewing to accepted.</p></article>
      </div>
      <h2 className="section-title">How we verify organizations</h2>
      <ol className="roadmap">
        {STEPS.map(([t, d]) => (
          <li key={t}><p><strong>{t}</strong></p><p className="muted">{d}</p></li>
        ))}
      </ol>
    </div>
  );
}
