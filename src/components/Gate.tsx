import type { ReactNode } from 'react';
import { useAuth } from '../lib/auth';
import type { Role } from '../lib/apiTypes';
import { Link } from '../lib/router';
import { Notice, Spinner } from './Form';
import { SetupPage } from '../pages/SetupPage';
import { VerifyPage } from '../pages/VerifyPage';

interface Props {
  /** Which kinds of account may see the page. Omit for any signed-in account. */
  roles?: readonly Role[];
  children: ReactNode;
}

/** Shows the page only to a signed-in account, and walks everyone else through what is missing. */
export function Gate({ roles, children }: Props) {
  const auth = useAuth();

  switch (auth.phase) {
    case 'loading':
      return (
        <div className="page">
          <Spinner />
        </div>
      );
    case 'unconfigured':
      return (
        <div className="page narrow">
          <h1 className="page-head__title">Sign-in is not set up</h1>
          <Notice tone="error">
            Fyndr could not find the Firebase settings. Run the Fyndr server, or copy .env.example to .env and fill in the VITE_FIREBASE_ values.
          </Notice>
        </div>
      );
    case 'out':
      return (
        <div className="page narrow">
          <h1 className="page-head__title">Sign in to continue</h1>
          <p className="page-head__lead">This page needs an account.</p>
          <p className="actions">
            <Link to="/login" className="btn btn--solid">
              Sign in
            </Link>
            <Link to="/register" className="btn">
              Create an account
            </Link>
          </p>
        </div>
      );
    case 'verify':
      return <VerifyPage />;
    case 'setup':
      return <SetupPage />;
    case 'error':
      return (
        <div className="page narrow">
          <h1 className="page-head__title">We could not load your account</h1>
          <Notice tone="error">{auth.error}</Notice>
          <p className="actions">
            <button type="button" className="btn btn--solid" onClick={auth.retry}>
              Try again
            </button>
            <button type="button" className="btn" onClick={() => void auth.logout()}>
              Sign out
            </button>
          </p>
        </div>
      );
    case 'ready':
      if (roles && auth.me && !roles.includes(auth.me.role)) {
        return (
          <div className="page narrow">
            <h1 className="page-head__title">This page is for a different kind of account</h1>
            <p className="page-head__lead">You are signed in as {auth.me.role === 'org' ? 'an organization' : 'a candidate'}.</p>
            <Link to="/dashboard" className="btn btn--solid">
              Go to your dashboard
            </Link>
          </div>
        );
      }
      return <>{children}</>;
  }
}
