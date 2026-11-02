import { useEffect, useRef, useState } from 'react';
import { Notice, Spinner } from '../components/Form';
import { api, errorText } from '../lib/api';
import type { Me } from '../lib/apiTypes';
import { useAuth } from '../lib/auth';
import { isCancelled, phoneClientId, startPhoneLogin, takePendingToken, type PhoneWait } from '../lib/phone';
import { Link, useRoute } from '../lib/router';

/** Verify a phone number. Needed to apply (candidates) and to post (organizations). */
export function PhonePage() {
  const auth = useAuth();
  const route = useRoute();
  const [clientId, setClientId] = useState<string | null | undefined>(undefined);
  const [step, setStep] = useState<'idle' | 'waiting' | 'checking' | 'done'>(auth.me?.phoneVerified ? 'done' : 'idle');
  const [error, setError] = useState('');
  const wait = useRef<PhoneWait | null>(null);
  const hashToken = route.params.get('token');

  useEffect(() => void phoneClientId().then(setClientId), []);

  const confirm = async (token: string): Promise<void> => {
    setStep('checking');
    setError('');
    try {
      await api<Me>('/phone/verify', 'POST', { access_token: token });
      await auth.refreshMe();
      setStep('done');
    } catch (e) {
      setError(errorText(e));
      setStep('idle');
    }
  };

  // Came back from phone.email in this same tab (phones, Firefox): the token is waiting.
  useEffect(() => {
    if (auth.phase !== 'ready' || auth.me?.phoneVerified) return;
    const token = takePendingToken(hashToken);
    if (token) void confirm(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.phase, hashToken]);

  useEffect(() => () => wait.current?.cancel(), []);

  const start = (): void => {
    if (!clientId) return;
    setError('');
    const w = startPhoneLogin(clientId);
    wait.current = w;
    if (w.redirected) return;
    setStep('waiting');
    w.token.then(
      t => void confirm(t),
      (e: unknown) => {
        if (!isCancelled(e)) setError(errorText(e));
        setStep('idle');
      },
    );
  };

  const verified = auth.me?.phoneVerified;
  return (
    <div className="page narrow">
      <h1 className="page-head__title">Verify your phone</h1>
      <p className="page-head__lead">
        {auth.me?.role === 'org' ? 'Organizations verify a phone number before posting.' : 'Candidates verify a phone number before applying.'} We send a code by SMS. The number is checked by the Fyndr server, not by this page.
      </p>
      {verified || step === 'done' ? (
        <>
          <Notice tone="ok">Phone verified{auth.me?.phoneMasked ? `: ${auth.me.phoneMasked}` : ''}.</Notice>
          <Link to="/dashboard" className="btn btn--solid">Go to your dashboard</Link>
        </>
      ) : (
        <>
          {clientId === null && <Notice tone="error">Phone verification is not set up yet. The site owner must add a phone.email Client ID.</Notice>}
          {error && <Notice tone="error">{error}</Notice>}
          {step === 'checking' && <Spinner label="Checking your number" />}
          {step === 'waiting' && <Notice>Finish the steps in the window that opened. This page continues by itself.</Notice>}
          <p className="actions">
            <button type="button" className="btn btn--solid" onClick={start} disabled={!clientId || step === 'waiting' || step === 'checking'}>
              Verify with phone
            </button>
            {step === 'waiting' && (
              <button type="button" className="btn" onClick={() => wait.current?.cancel()}>Cancel</button>
            )}
          </p>
        </>
      )}
    </div>
  );
}
