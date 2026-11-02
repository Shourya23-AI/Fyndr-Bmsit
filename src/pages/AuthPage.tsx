import { useEffect, useState, type FormEvent } from 'react';
import { Notice, SelectField, TextField } from '../components/Form';
import { errorText } from '../lib/api';
import type { OrgType } from '../lib/apiTypes';
import { useAuth } from '../lib/auth';
import { FREE_EMAIL } from '../lib/config';
import { Link, navigate } from '../lib/router';
import { ORG_OPTIONS } from './SetupPage';

export type AuthMode = 'login' | 'register' | 'forgot';

export function AuthPage({ mode }: { mode: AuthMode }) {
  const auth = useAuth();
  const [role, setRole] = useState<'user' | 'org'>('user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState<OrgType>('small');
  const [website, setWebsite] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const [busy, setBusy] = useState(false);

  // Already signed in: go on to the dashboard.
  const signedIn = auth.phase === 'ready';
  useEffect(() => {
    if (signedIn && mode !== 'forgot') navigate('/dashboard');
  }, [signedIn, mode]);

  const run = async (fn: () => Promise<void>): Promise<void> => {
    setError('');
    setDone('');
    setBusy(true);
    try {
      await fn();
    } catch (x) {
      setError(errorText(x));
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: FormEvent): void => {
    e.preventDefault();
    void run(async () => {
      if (mode === 'login') {
        await auth.signIn(email.trim(), password);
        navigate('/dashboard');
      } else if (mode === 'forgot') {
        await auth.reset(email.trim());
        setDone('If that email has an account, a reset link is on its way. Check your inbox.');
      } else {
        if (role === 'org' && orgType === 'enterprise' && FREE_EMAIL.test(email)) {
          throw new Error('Enterprise organizations must use a work email. Small businesses can use Gmail.');
        }
        await auth.signUp({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          orgName: role === 'org' ? orgName.trim() : undefined,
          orgType: role === 'org' ? orgType : undefined,
          website: role === 'org' ? website.trim() : undefined,
        });
        navigate('/dashboard');
      }
    });
  };

  const title = mode === 'login' ? 'Sign in' : mode === 'register' ? 'Create your account' : 'Reset your password';

  return (
    <div className="page narrow">
      <h1 className="page-head__title">{title}</h1>
      {mode === 'register' && (
        <div className="seg" role="group" aria-label="Account type">
          <button type="button" aria-pressed={role === 'user'} onClick={() => setRole('user')}>
            Candidate
          </button>
          <button type="button" aria-pressed={role === 'org'} onClick={() => setRole('org')}>
            Organization
          </button>
        </div>
      )}
      <form className="form" onSubmit={submit}>
        {mode === 'register' && <TextField label="Your name" value={name} onChange={e => setName(e.target.value)} required maxLength={80} autoComplete="name" />}
        {mode === 'register' && role === 'org' && (
          <>
            <TextField label="Organization name" value={orgName} onChange={e => setOrgName(e.target.value)} required maxLength={120} />
            <SelectField label="Organization size" value={orgType} onChange={e => setOrgType(e.target.value === 'enterprise' ? 'enterprise' : 'small')} options={ORG_OPTIONS} />
            <TextField label="Website" type="url" value={website} onChange={e => setWebsite(e.target.value)} maxLength={200} placeholder="https://" hint="Our team checks it before you can post." />
          </>
        )}
        <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        {mode !== 'forgot' && (
          <div className="pw">
            <TextField
              label="Password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              hint={mode === 'register' ? 'At least 6 characters.' : undefined}
            />
            <button type="button" className="linklike pw__toggle" onClick={() => setShowPw(v => !v)} aria-pressed={showPw}>
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>
        )}
        {mode === 'register' && (
          <label className="check">
            <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} required />
            <span>
              I agree to the <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
            </span>
          </label>
        )}
        {error && <Notice tone="error">{error}</Notice>}
        {done && <Notice tone="ok">{done}</Notice>}
        <button className="btn btn--solid btn--wide" disabled={busy || auth.phase === 'loading'}>
          {mode === 'login' ? 'Sign in' : mode === 'register' ? 'Create account' : 'Send reset link'}
        </button>
        {mode !== 'forgot' && (
          <>
            <p className="or">or</p>
            <button type="button" className="btn btn--wide" disabled={busy} onClick={() => void run(async () => { await auth.google(); navigate('/dashboard'); })}>
              Continue with Google
            </button>
          </>
        )}
      </form>
      <p className="auth-links">
        {mode === 'login' && (
          <>
            <Link to="/forgot">Forgot your password?</Link> <span aria-hidden="true">·</span> <Link to="/register">Create an account</Link>
          </>
        )}
        {mode === 'register' && (
          <>
            Already have an account? <Link to="/login">Sign in</Link>
          </>
        )}
        {mode === 'forgot' && <Link to="/login">Back to sign in</Link>}
      </p>
    </div>
  );
}
