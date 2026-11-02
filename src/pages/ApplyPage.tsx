import { useState, type ChangeEvent, type FormEvent } from 'react';
import { AreaField, Notice, SelectField, Spinner, TextField } from '../components/Form';
import { Gate } from '../components/Gate';
import { api, errorText } from '../lib/api';
import { EXPERIENCE, type PostedListing, type ProfileResponse } from '../lib/apiTypes';
import { readPdf } from '../lib/image';
import { Link, navigate } from '../lib/router';
import { useAsync } from '../lib/useAsync';

export function ApplyPage({ id }: { id: string }) {
  return (
    <Gate roles={['user']}>
      <Inner id={id} />
    </Gate>
  );
}

function Inner({ id }: { id: string }) {
  const { state } = useAsync(async () => {
    const [all, profile] = await Promise.all([api<PostedListing[]>('/listings?type=Job,Internship,Course'), api<ProfileResponse>('/profile')]);
    return { listing: all.find(l => l.id === id) ?? null, profile };
  }, [id]);

  if (state.status === 'loading') return <div className="page"><Spinner /></div>;
  if (state.status === 'error') return <div className="page narrow"><Notice tone="error">{state.message}</Notice></div>;
  const { listing, profile } = state.data;
  if (!listing) {
    return (
      <div className="page narrow">
        <h1 className="page-head__title">Listing not found</h1>
        <p className="page-head__lead">It may have been closed.</p>
        <Link to="/jobs" className="btn btn--solid">Back to listings</Link>
      </div>
    );
  }
  return <ApplyForm listing={listing} data={profile} />;
}

function ApplyForm({ listing, data }: { listing: PostedListing; data: ProfileResponse }) {
  const p = data.profile;
  const [fullName, setFullName] = useState(data.name);
  const [phone, setPhone] = useState(data.phone ?? '');
  const [city, setCity] = useState('');
  const [education, setEducation] = useState([p.qualification, p.field, p.institution].filter(Boolean).join(', '));
  const [skills, setSkills] = useState((p.skills ?? []).join(', '));
  const [experience, setExperience] = useState(p.experience ?? EXPERIENCE[0]);
  const [linkedin, setLinkedin] = useState(p.linkedin ?? '');
  const [portfolio, setPortfolio] = useState(p.link ?? '');
  const [note, setNote] = useState('');
  const [resume, setResume] = useState<'site' | 'own'>('site');
  const [pending, setPending] = useState<{ name: string; data: string } | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onFile = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      setPending(await readPdf(f));
      setError('');
    } catch (x) {
      setError(errorText(x));
    }
  };

  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    if (resume === 'own' && !pending && !data.resume) {
      setError('Choose a PDF, or pick the Fyndr resume.');
      return;
    }
    setBusy(true);
    try {
      if (resume === 'own' && pending) await api('/resume', 'POST', pending);
      await api(`/apply/${listing.id}`, 'POST', {
        resume,
        consent: true,
        form: { fullName, email: data.email, phone, city, education, skills: skills.split(',').map(s => s.trim()).filter(Boolean), experience, linkedin, portfolio, note },
      });
      navigate('/dashboard');
    } catch (x) {
      setError(errorText(x));
      setBusy(false);
    }
  };

  return (
    <div className="page narrow-wide">
      <Link to="/dashboard" className="linklike">← Back</Link>
      <header className="page-head">
        <h1 className="page-head__title">Apply: {listing.title}</h1>
        <p className="page-head__lead">{listing.orgName} · {listing.location} · {listing.pay}</p>
      </header>
      {!data.phone && <Notice>You need a verified phone number to apply. <Link to="/phone">Verify now</Link></Notice>}
      <form className="form form--grid" onSubmit={e => void submit(e)}>
        <TextField label="Full name" value={fullName} onChange={e => setFullName(e.target.value)} required maxLength={80} autoComplete="name" />
        <TextField label="Email" value={data.email} readOnly />
        <TextField label="Phone" value={phone} onChange={e => setPhone(e.target.value)} required maxLength={30} autoComplete="tel" />
        <TextField label="Current city" value={city} onChange={e => setCity(e.target.value)} required maxLength={80} autoComplete="address-level2" />
        <TextField label="Education" value={education} onChange={e => setEducation(e.target.value)} maxLength={200} wide />
        <TextField label="Skills" value={skills} onChange={e => setSkills(e.target.value)} maxLength={400} wide hint="Separate with commas." />
        <SelectField label="Experience" value={experience} onChange={e => setExperience(e.target.value)} options={EXPERIENCE} />
        <TextField label="LinkedIn link" type="url" value={linkedin} onChange={e => setLinkedin(e.target.value)} maxLength={200} />
        <TextField label="Portfolio or GitHub" type="url" value={portfolio} onChange={e => setPortfolio(e.target.value)} maxLength={200} />
        <AreaField label="Short cover note" value={note} onChange={e => setNote(e.target.value)} required maxLength={1500} rows={5} wide placeholder={`Why are you a good fit for ${listing.title}?`} />

        <fieldset className="form-field form-field--wide fieldset">
          <legend className="form-field__label">Resume</legend>
          <label className="check"><input type="radio" name="resume" checked={resume === 'site'} onChange={() => setResume('site')} /><span>Fyndr resume, built from your profile</span></label>
          <label className="check"><input type="radio" name="resume" checked={resume === 'own'} onChange={() => setResume('own')} /><span>My own PDF {pending ? `(${pending.name})` : data.resume ? `(${data.resume.name})` : ''}</span></label>
          {resume === 'own' && <input type="file" accept="application/pdf" onChange={e => void onFile(e)} />}
        </fieldset>

        <div className="form-field form-field--wide">
          <p className="muted small">Your details and resume are shared with {listing.orgName} and Fyndr admins. <Link to="/privacy">Privacy Policy</Link></p>
          {error && <Notice tone="error">{error}</Notice>}
          <p className="actions">
            <button className="btn btn--solid" disabled={busy}>Submit application</button>
            <Link to="/dashboard" className="btn">Cancel</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
