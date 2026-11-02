import { useState, type ChangeEvent, type FormEvent } from 'react';
import { AreaField, Notice, SelectField, Spinner, TextField } from '../components/Form';
import { api, errorText } from '../lib/api';
import { APPLICATION_STATUSES, type ApplicationStatus, type OrgApplication, type OrgResume, type PostedListing, type PostedType } from '../lib/apiTypes';
import { useAuth } from '../lib/auth';
import { shrinkImage } from '../lib/image';
import { Link } from '../lib/router';
import { useAsync } from '../lib/useAsync';

const TYPES: readonly PostedType[] = ['Job', 'Internship', 'Course'];
const STATUS_WORD: Record<ApplicationStatus, string> = { applied: 'Applied', reviewing: 'In review', interview: 'Interview', accepted: 'Accepted', rejected: 'Rejected' };

export function OrgDashboard() {
  const { me } = useAuth();
  const listings = useAsync(() => api<PostedListing[]>('/org/listings'), []);
  const apps = useAsync(() => api<OrgApplication[]>('/org/applications'), []);
  const [error, setError] = useState('');
  const [resume, setResume] = useState<{ id: string; data: OrgResume } | null>(null);

  if (!me) return null;
  const canPost = me.phoneVerified && !!me.verified && !me.gmailBlocked;

  const run = async (fn: () => Promise<unknown>): Promise<void> => {
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(errorText(e));
    }
  };

  const setStatus = (id: string, status: ApplicationStatus): Promise<void> =>
    run(async () => {
      await api(`/applications/${id}`, 'PATCH', { status });
      apps.reload();
    });

  const viewResume = (id: string): Promise<void> =>
    run(async () => {
      const data = await api<OrgResume>(`/org/applications/${id}/resume`);
      if (data.type === 'own') {
        const bytes = Uint8Array.from(atob(data.data), c => c.charCodeAt(0));
        window.open(URL.createObjectURL(new Blob([bytes], { type: data.mime })), '_blank', 'noopener');
      } else {
        setResume({ id, data });
      }
    });

  return (
    <div className="page">
      <header className="page-head">
        <h1 className="page-head__title">{me.orgName} <span className="tag">{me.orgType === 'enterprise' ? 'Enterprise' : 'Small business'}</span></h1>
        <p className="page-head__lead">Post openings and move applicants forward.</p>
      </header>

      {!me.verified && <Notice>Your organization is waiting for review by the Fyndr team. You can post once it is verified.</Notice>}
      {me.gmailBlocked && <Notice tone="error">{me.email} is a free email address, which is not enabled for posting on your account. Use a work email, or ask Fyndr admin to allow it.</Notice>}
      {!me.phoneVerified && <Notice>Verify your phone to post. <Link to="/phone">Verify now</Link></Notice>}
      {error && <Notice tone="error">{error}</Notice>}

      <section className="stack">
        <h2 className="section-title">Post an opportunity</h2>
        <PostForm disabled={!canPost} onPosted={listings.reload} />
      </section>

      <section className="stack">
        <h2 className="section-title">Your listings</h2>
        {listings.state.status === 'loading' && <Spinner />}
        {listings.state.status === 'error' && <Notice tone="error">{listings.state.message}</Notice>}
        {listings.state.status === 'ready' &&
          (listings.state.data.length === 0 ? (
            <p className="muted">Nothing posted yet.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Title</th><th>Type</th><th>Status</th><th>Applicants</th><th><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {listings.state.data.map(l => (
                    <tr key={l.id}>
                      <td>{l.title}</td>
                      <td>{l.type}</td>
                      <td><span className="status" data-status={l.status}>{l.status === 'pending' ? 'In review' : l.status === 'approved' ? 'Live' : 'Rejected'}</span></td>
                      <td>{l.applicants ?? 0}</td>
                      <td>
                        <button type="button" className="linklike" onClick={() => { if (window.confirm(`Delete "${l.title}"? Its applications are deleted too.`)) void run(async () => { await api(`/listings/${l.id}`, 'DELETE'); listings.reload(); apps.reload(); }); }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </section>

      <section className="stack">
        <h2 className="section-title">Applicants</h2>
        {apps.state.status === 'loading' && <Spinner />}
        {apps.state.status === 'error' && <Notice tone="error">{apps.state.message}</Notice>}
        {apps.state.status === 'ready' &&
          (apps.state.data.length === 0 ? (
            <p className="muted">No applications yet.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Candidate</th><th>Email</th><th>For</th><th>Resume</th><th>Status</th></tr></thead>
                <tbody>
                  {apps.state.data.map(a => (
                    <tr key={a.id}>
                      <td>{a.name}</td>
                      <td>{a.email}</td>
                      <td>{a.title}</td>
                      <td><button type="button" className="linklike" onClick={() => void viewResume(a.id)}>{a.resumeType === 'own' ? 'Open PDF' : 'View'}</button></td>
                      <td>
                        <select className="input input--compact" aria-label={`Status for ${a.name ?? 'candidate'}`} value={a.status} onChange={e => void setStatus(a.id, e.target.value as ApplicationStatus)}>
                          {APPLICATION_STATUSES.map(s => <option key={s} value={s}>{STATUS_WORD[s]}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        {resume && resume.data.type === 'site' && (
          <div className="panel">
            <div className="panel__bar">
              <h3 className="section-title">{resume.data.name}</h3>
              <button type="button" className="linklike" onClick={() => setResume(null)}>Close</button>
            </div>
            <p className="muted">{resume.data.email}{resume.data.phone ? ` · ${resume.data.phone}` : ''}</p>
            <p>{[resume.data.profile.qualification, resume.data.profile.field, resume.data.profile.institution, resume.data.profile.gradYear].filter(Boolean).join(', ')}</p>
            {resume.data.profile.summary && <p>{resume.data.profile.summary}</p>}
            <p><strong>Skills:</strong> {(resume.data.profile.skills ?? []).join(', ') || 'None listed'}</p>
            {resume.data.profile.projects && <p className="prewrap"><strong>Projects:</strong>{'\n'}{resume.data.profile.projects}</p>}
          </div>
        )}
      </section>
    </div>
  );
}

function PostForm({ disabled, onPosted }: { disabled: boolean; onPosted: () => void }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<PostedType>('Job');
  const [location, setLocation] = useState('');
  const [pay, setPay] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [logo, setLogo] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);

  const pick = (set: (v: string) => void, side: number) => async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      set(await shrinkImage(f, side, 0.78));
    } catch (x) {
      setError(errorText(x));
    }
  };

  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setOk('');
    if (!image) {
      setError('Add a cover image for your listing.');
      return;
    }
    setBusy(true);
    try {
      await api('/listings', 'POST', { title: title.trim(), type, location: location.trim(), pay: pay.trim(), duration: duration.trim(), description: description.trim(), image, logo });
      setOk('Submitted. It goes live after the Fyndr team approves it.');
      setTitle(''); setLocation(''); setPay(''); setDuration(''); setDescription(''); setImage('');
      onPosted();
    } catch (x) {
      setError(errorText(x));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="form form--grid" onSubmit={e => void submit(e)}>
      <fieldset className="fieldset form-field--wide" disabled={disabled}>
        <div className="form--grid">
          <div className="form-field">
            <span className="form-field__label">Cover image (required)</span>
            {image && <img className="cover" src={image} alt="Cover preview" />}
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => void pick(setImage, 900)(e)} />
            <p className="form-field__hint">Wide pictures (16:9) look best.</p>
          </div>
          <div className="form-field">
            <span className="form-field__label">Logo (optional)</span>
            {logo && <img className="avatar avatar--lg" src={logo} alt="Logo preview" />}
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => void pick(setLogo, 160)(e)} />
          </div>
          <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} required maxLength={120} />
          <SelectField label="Type" value={type} onChange={e => setType(e.target.value as PostedType)} options={TYPES} />
          <TextField label="Location" value={location} onChange={e => setLocation(e.target.value)} required maxLength={120} placeholder="City or Online" />
          <TextField label="Pay or price" value={pay} onChange={e => setPay(e.target.value)} required maxLength={80} />
          <TextField label="Duration" value={duration} onChange={e => setDuration(e.target.value)} maxLength={40} placeholder="12 weeks" wide />
          <AreaField label="Description" value={description} onChange={e => setDescription(e.target.value)} maxLength={4000} rows={5} wide hint="Lines starting with “Best for:” and “What you get:” are shown clearly to students." />
        </div>
      </fieldset>
      <div className="form-field form-field--wide">
        {disabled && <p className="muted">Posting unlocks once your phone and organization are verified.</p>}
        {error && <Notice tone="error">{error}</Notice>}
        {ok && <Notice tone="ok">{ok}</Notice>}
        <button className="btn btn--solid" disabled={disabled || busy}>Submit for review</button>
      </div>
    </form>
  );
}
