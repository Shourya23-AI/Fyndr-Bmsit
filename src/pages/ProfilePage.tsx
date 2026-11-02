import { useEffect, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react';
import { AreaField, Notice, SelectField, Spinner, TextField } from '../components/Form';
import { api, errorText } from '../lib/api';
import { EXPERIENCE, JOB_TYPES, QUALIFICATIONS, type Profile, type ProfileResponse } from '../lib/apiTypes';
import { useAuth } from '../lib/auth';
import { readPdf, shrinkImage } from '../lib/image';
import { Link, navigate } from '../lib/router';
import { useAsync } from '../lib/useAsync';

export function ProfilePage() {
  const { state, reload } = useAsync(() => api<ProfileResponse>('/profile'), []);
  if (state.status === 'loading') return <div className="page"><Spinner /></div>;
  if (state.status === 'error') {
    return (
      <div className="page narrow">
        <Notice tone="error">{state.message}</Notice>
        <button type="button" className="btn" onClick={reload}>Try again</button>
      </div>
    );
  }
  return <ProfileForm data={state.data} reload={reload} />;
}

function ProfileForm({ data, reload }: { data: ProfileResponse; reload: () => void }) {
  const auth = useAuth();
  const first = !auth.me?.onboarded;
  const p = data.profile;

  const [qualification, setQualification] = useState(p.qualification ?? '');
  const [field, setField] = useState(p.field ?? '');
  const [institution, setInstitution] = useState(p.institution ?? '');
  const [gradYear, setGradYear] = useState(String(p.gradYear ?? ''));
  const [experience, setExperience] = useState(p.experience ?? '');
  const [locations, setLocations] = useState(p.locations ?? '');
  const [headline, setHeadline] = useState(p.headline ?? '');
  const [summary, setSummary] = useState(p.summary ?? '');
  const [projects, setProjects] = useState(p.projects ?? '');
  const [link, setLink] = useState(p.link ?? '');
  const [skills, setSkills] = useState<string[]>(p.skills ?? []);
  const [skillDraft, setSkillDraft] = useState('');
  const [jobTypes, setJobTypes] = useState<string[]>(p.jobTypes ?? []);
  const [resume, setResume] = useState(data.resume);
  const [photo, setPhoto] = useState(data.photo);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [busy, setBusy] = useState(false);

  // Keep whatever the old site stored (work history, languages, hobbies...). The server replaces the whole profile on save.
  useEffect(() => setSaved(''), [qualification, field, institution, gradYear, experience, locations, headline, summary, projects, link, skills, jobTypes]);

  const addSkill = (raw: string): void => {
    const next = raw.split(',').map(s => s.trim().slice(0, 30)).filter(Boolean);
    if (!next.length) return;
    setSkills(cur => [...new Set([...cur, ...next])].slice(0, 30));
    setSkillDraft('');
  };
  const onSkillKey = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(skillDraft);
    }
  };

  const save = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    const all = skillDraft.trim() ? [...new Set([...skills, ...skillDraft.split(',').map(s => s.trim()).filter(Boolean)])] : skills;
    if (!all.length) {
      setError('Add at least one skill.');
      return;
    }
    setBusy(true);
    try {
      const body: Profile = {
        ...p,
        qualification, field: field.trim(), institution: institution.trim(), gradYear: Number(gradYear), experience,
        locations: locations.trim(), headline: headline.trim(), summary: summary.trim(), projects: projects.trim(), link: link.trim(),
        skills: all, jobTypes,
      };
      await api('/profile', 'PUT', body);
      setSkills(all);
      setSkillDraft('');
      await auth.refreshMe();
      setSaved('Saved.');
      if (first) navigate('/dashboard');
      else reload();
    } catch (x) {
      setError(errorText(x));
    } finally {
      setBusy(false);
    }
  };

  const onResume = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const body = await readPdf(file);
      setResume(await api<{ name: string; size: number; at: string }>('/resume', 'POST', body));
      setError('');
    } catch (x) {
      setError(errorText(x));
    }
  };

  const onPhoto = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = await shrinkImage(file, 256);
      await api('/photo', 'POST', { data });
      setPhoto(data);
      await auth.refreshMe();
      setError('');
    } catch (x) {
      setError(errorText(x));
    }
  };

  const toggleType = (t: string): void => setJobTypes(cur => (cur.includes(t) ? cur.filter(x => x !== t) : [...cur, t]));

  return (
    <div className="page narrow-wide">
      <header className="page-head">
        <h1 className="page-head__title">{first ? 'Tell us about your education' : 'Your profile'}</h1>
        <p className="page-head__lead">
          {first ? 'This is what Fyndr uses to match you to roles and courses. You can change it any time.' : `Your profile is ${data.completion}% complete.`}
        </p>
      </header>

      <form className="form form--grid" onSubmit={e => void save(e)}>
        <SelectField label="Highest qualification" value={qualification} onChange={e => setQualification(e.target.value)} options={QUALIFICATIONS} placeholder="Choose one" required />
        <TextField label="Field of study" value={field} onChange={e => setField(e.target.value)} required maxLength={80} />
        <TextField label="Institution" value={institution} onChange={e => setInstitution(e.target.value)} required maxLength={100} />
        <TextField label="Graduation year" type="number" inputMode="numeric" value={gradYear} onChange={e => setGradYear(e.target.value)} required min={1970} max={new Date().getFullYear() + 8} />
        <SelectField label="Experience" value={experience} onChange={e => setExperience(e.target.value)} options={EXPERIENCE} placeholder="Choose one" required />
        <TextField label="Places you would work" value={locations} onChange={e => setLocations(e.target.value)} maxLength={150} placeholder="Bengaluru, Pune, Remote" hint="Separate with commas." />

        <div className="form-field form-field--wide">
          <span className="form-field__label" id="skills-label">Skills</span>
          {skills.length > 0 && (
            <ul className="chips" aria-label="Your skills">
              {skills.map(s => (
                <li key={s} className="chip">
                  {s}
                  <button type="button" aria-label={`Remove ${s}`} onClick={() => setSkills(cur => cur.filter(x => x !== s))}>×</button>
                </li>
              ))}
            </ul>
          )}
          <input className="input" aria-labelledby="skills-label" value={skillDraft} onChange={e => setSkillDraft(e.target.value)} onKeyDown={onSkillKey} onBlur={() => addSkill(skillDraft)} placeholder="Type a skill, press Enter" maxLength={60} />
          <p className="form-field__hint">Skills are what matching is built on. Add at least five if you can.</p>
        </div>

        <fieldset className="form-field form-field--wide fieldset">
          <legend className="form-field__label">Looking for</legend>
          <div className="checks">
            {JOB_TYPES.map(t => (
              <label key={t} className="check">
                <input type="checkbox" checked={jobTypes.includes(t)} onChange={() => toggleType(t)} />
                <span>{t}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <TextField label="Headline" value={headline} onChange={e => setHeadline(e.target.value)} maxLength={100} placeholder="Final-year CS student" wide hint="Optional. Shown under your name." />
        <AreaField label="Summary" value={summary} onChange={e => setSummary(e.target.value)} maxLength={500} rows={3} wide hint="Optional. Top of your resume." />
        <AreaField label="Projects" value={projects} onChange={e => setProjects(e.target.value)} maxLength={800} rows={4} wide hint="Optional. One per line." />
        <TextField label="GitHub or portfolio link" type="url" value={link} onChange={e => setLink(e.target.value)} maxLength={200} wide />

        <div className="form-field form-field--wide upload">
          <span className="form-field__label">Photo</span>
          <div className="upload__row">
            {photo ? <img className="avatar avatar--lg" src={photo} alt="" /> : <span className="avatar avatar--lg" aria-hidden="true">{(data.name || '?').slice(0, 1).toUpperCase()}</span>}
            <label className="btn btn--small">
              Choose a photo
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => void onPhoto(e)} hidden />
            </label>
            {photo && (
              <button type="button" className="linklike" onClick={() => void api('/photo', 'DELETE').then(() => { setPhoto(null); return auth.refreshMe(); }).catch((x: unknown) => setError(errorText(x)))}>
                Remove
              </button>
            )}
          </div>
        </div>

        <div className="form-field form-field--wide upload">
          <span className="form-field__label">Resume (PDF, up to 2 MB)</span>
          <div className="upload__row">
            {resume ? <span className="tag tag--free">{resume.name} · {Math.max(1, Math.round(resume.size / 1024))} KB</span> : <span className="muted">None uploaded. Fyndr can build one from your profile.</span>}
            <label className="btn btn--small">
              {resume ? 'Replace' : 'Upload a PDF'}
              <input type="file" accept="application/pdf" onChange={e => void onResume(e)} hidden />
            </label>
            {resume && (
              <button type="button" className="linklike" onClick={() => void api('/resume', 'DELETE').then(() => setResume(null)).catch((x: unknown) => setError(errorText(x)))}>
                Remove
              </button>
            )}
          </div>
        </div>

        <div className="form-field form-field--wide">
          {error && <Notice tone="error">{error}</Notice>}
          {saved && <Notice tone="ok">{saved}</Notice>}
          <p className="actions">
            <button className="btn btn--solid" disabled={busy}>{first ? 'Save and continue' : 'Save changes'}</button>
            <Link to="/dashboard" className="btn">Back to dashboard</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
