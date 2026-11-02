import { useEffect, useState } from 'react';
import { Notice } from '../components/Form';
import { errorText } from '../lib/api';
import { useAuth } from '../lib/auth';

export function VerifyPage() {
  const auth = useAuth();
  const [msg, setMsg] = useState<{ tone: 'info' | 'error' | 'ok'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const { recheckVerified } = auth;

  // Checks every few seconds, so the page moves on by itself once the link is clicked.
  useEffect(() => {
    const t = window.setInterval(() => void recheckVerified().catch(() => undefined), 4000);
    return () => window.clearInterval(t);
  }, [recheckVerified]);

  const check = async (): Promise<void> => {
    setBusy(true);
    try {
      if (!(await recheckVerified())) setMsg({ tone: 'info', text: 'Not verified yet. Open the link in the email, then press this again.' });
    } catch (e) {
      setMsg({ tone: 'error', text: errorText(e) });
    } finally {
      setBusy(false);
    }
  };

  const resend = async (): Promise<void> => {
    try {
      await auth.resendVerification();
      setMsg({ tone: 'ok', text: 'Verification email sent.' });
    } catch (e) {
      setMsg({ tone: 'error', text: errorText(e) });
    }
  };

  return (
    <div className="page narrow">
      <h1 className="page-head__title">Check your email</h1>
      <p className="page-head__lead">
        We sent a link to <strong>{auth.user?.email}</strong>. Open it, then come back. This page continues by itself.
      </p>
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
      <p className="actions">
        <button type="button" className="btn btn--solid" onClick={() => void check()} disabled={busy}>
          I have verified
        </button>
        <button type="button" className="btn" onClick={() => void resend()}>
          Send the email again
        </button>
        <button type="button" className="linklike" onClick={() => void auth.logout()}>
          Use a different email
        </button>
      </p>
    </div>
  );
}
