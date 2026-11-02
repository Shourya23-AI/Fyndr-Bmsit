import { useState, type FormEvent } from 'react';
import { Notice, SelectField, TextField } from '../components/Form';
import { errorText } from '../lib/api';
import type { OrgType } from '../lib/apiTypes';
import { useAuth } from '../lib/auth';
import { FREE_EMAIL } from '../lib/config';
import { Link } from '../lib/router';

export const ROLE_OPTIONS = [
  { value: 'user', label: 'Looking for opportunities' },
  { value: 'org', label: 'An organization hiring' },
] as const;

export const ORG_OPTIONS = [
  { value: 'small', label: 'Small business (any email works)' },
  { value: 'enterprise', label: 'Enterprise (work email required)' },
] as const;

/** First sign-in with Google: the account exists but Fyndr has no profile for it yet. */
export function SetupPage() {
  const auth = useAuth();
  const [role, setRole] = useState<'user' | 'org'>('user');
  const [name, setName] = useState(auth.user?.displayName ?? '');
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState<OrgType>('small');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    if (role === 'org' && orgType === 'enterprise' && FREE_EMAIL.test(auth.user?.email ?? '')) {
      setError('Enterprise organizations must use a work email. Small businesses can use Gmail.');
      return;
    }
    setBusy(true);
    try {
      await auth.completeSetup({ name: name.trim(), role, orgName: role === 'org' ? orgName.trim() : undefined, orgType: role === 'org' ? orgType : undefined });
    } catch (x) {
      setError(errorText(x));
      setBusy(false);
    }
  };

  return (
    <div className="page narrow">
      <h1 className="page-head__title">Finish setting up</h1>
      <p className="page-head__lead">One last step before you start.</p>
      <form className="form" onSubmit={e => void submit(e)}>
        <SelectField label="I am" value={role} onChange={e => setRole(e.target.value === 'org' ? 'org' : 'user')} options={ROLE_OPTIONS} />
        <TextField label="Your name" value={name} onChange={e => setName(e.target.value)} required maxLength={80} />
        {role === 'org' && (
          <>
            <TextField label="Organization name" value={orgName} onChange={e => setOrgName(e.target.value)} required maxLength={120} />
            <SelectField label="Organization size" value={orgType} onChange={e => setOrgType(e.target.value === 'enterprise' ? 'enterprise' : 'small')} options={ORG_OPTIONS} hint="Small businesses may use any email. Enterprises need a work email." />
          </>
        )}
        <label className="check">
          <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} required />
          <span>
            I agree to the <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
          </span>
        </label>
        {error && <Notice tone="error">{error}</Notice>}
        <p className="actions">
          <button className="btn btn--solid" disabled={busy}>
            Continue
          </button>
          <button type="button" className="linklike" onClick={() => void auth.logout()}>
            Sign out
          </button>
        </p>
      </form>
    </div>
  );
}
