import { useMemo, useState } from 'react';
import { ListingRow } from '../components/ListingRow';
import { Notice, Spinner } from '../components/Form';
import { Gate } from '../components/Gate';
import { api } from '../lib/api';
import type { MyResponse, PostedListing, ProfileResponse } from '../lib/apiTypes';
import { useAuth } from '../lib/auth';
import { profileTips, suggestFor, type Match } from '../lib/match';
import { Link } from '../lib/router';
import { useSaved } from '../lib/saved';
import { useAsync } from '../lib/useAsync';
import { useCatalog } from '../lib/useCatalog';
import { OrgDashboard } from './OrgDashboard';

export function DashboardPage() {
  return (
    <Gate>
      <Inner />
    </Gate>
  );
}

function Inner() {
  const { me } = useAuth();
  if (!me) return null;
  if (me.role === 'org') return <OrgDashboard />;
  if (me.role === 'user') return <CandidateDashboard />;
  return (
    <div className="page narrow">
      <h1 className="page-head__title">Staff dashboard</h1>
      <Notice>Moderation and admin tools are rebuilt in Part 3. Until then, use the existing admin page on the old site.</Notice>
    </div>
  );
}

type Tab = 'foryou' | 'apps' | 'profile';

function CandidateDashboard() {
  const { me } = useAuth();
  const [tab, setTab] = useState<Tab>('foryou');
  const first = me?.name.split(' ')[0] ?? '';
  return (
    <div className="page">
      <header className="page-head">
        <h1 className="page-head__title">Hello, {first}</h1>
        <p className="page-head__lead">Your matches, your applications and what to learn next.</p>
      </header>
      {me && !me.phoneVerified && (
        <Notice>
          Verify your phone to apply for roles posted on Fyndr. <Link to="/phone">Verify now</Link>
        </Notice>
      )}
      <div className="tabs" role="tablist" aria-label="Dashboard">
        {(
          [
            ['foryou', 'For you'],
            ['apps', 'Applications'],
            ['profile', 'Profile'],
          ] as const
        ).map(([key, label]) => (
          <button key={key} type="button" role="tab" className="tab" aria-selected={tab === key} aria-pressed={tab === key} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>
      <div className="tabpanel" role="tabpanel">
        {tab === 'foryou' && <ForYou />}
        {tab === 'apps' && <Applications />}
        {tab === 'profile' && <ProfileSummary />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- For you

const LEVEL_WORD = { strong: 'Strong match', good: 'Good match', building: 'Worth a look' } as const;

function MatchRow({ m }: { m: Match }) {
  const saved = useSaved();
  return (
    <div className="match">
      <div className="match__head">
        <span className="match__score" data-level={m.level}>
          {m.score}
        </span>
        <span className="match__word">{LEVEL_WORD[m.level]}</span>
      </div>
      <ListingRow listing={m.listing} saved={saved.has(m.listing.id)} onToggleSaved={saved.toggle} />
      <p className="match__why">
        {m.reasons.length ? m.reasons.join('. ') + '.' : 'A broad fit for your profile.'}
        {m.missing.length > 0 && m.listing.kind !== 'course' && (
          <>
            {' '}
            <span className="muted">To add: {m.missing.slice(0, 4).join(', ')}.</span>
          </>
        )}
      </p>
    </div>
  );
}

function ForYou() {
  const catalog = useCatalog();
  const { state } = useAsync(() => api<ProfileResponse>('/profile'), []);
  const [shown, setShown] = useState(8);

  const result = useMemo(() => {
    if (catalog.status !== 'ready' || state.status !== 'ready') return null;
    return suggestFor(state.data.profile, catalog.catalog.listings);
  }, [catalog, state]);

  if (catalog.status === 'loading' || state.status === 'loading') return <Spinner />;
  if (catalog.status === 'error') return <Notice tone="error">{catalog.message}</Notice>;
  if (state.status === 'error') return <Notice tone="error">{state.message}</Notice>;

  const { profile, resume } = state.data;
  if (!profile.done) {
    return (
      <div className="empty">
        <p className="empty__title">Finish your profile to see your matches</p>
        <p className="empty__text">Add your qualification, skills and the places you would work. Browsing and applying never need this.</p>
        <Link to="/profile" className="btn btn--solid">Complete your profile</Link>
      </div>
    );
  }
  if (!result || !result.ready) {
    return (
      <div className="empty">
        <p className="empty__title">Add skills to unlock matches</p>
        <p className="empty__text">Fyndr ranks roles and courses by the skills you list.</p>
        <Link to="/profile" className="btn btn--solid">Add skills</Link>
      </div>
    );
  }
  const tips = profileTips(profile, !!resume);
  const good = result.counts.strong + result.counts.good;
  return (
    <div className="stack">
      <section className="summary">
        <p className="summary__big">{good}</p>
        <p>
          good or better {good === 1 ? 'match' : 'matches'} among {result.picks.length} close ones.
          {result.gaps[0] && (
            <>
              {' '}
              Learning <strong>{result.gaps[0].skill}</strong> would improve {result.gaps[0].count} of them.
            </>
          )}
        </p>
      </section>

      <section>
        <h2 className="section-title">Jobs and internships for you</h2>
        {result.picks.length === 0 ? <p className="muted">No close matches yet. Follow the learning steps below, then check again.</p> : null}
        <div className="matches">
          {result.picks.slice(0, shown).map(m => (
            <MatchRow key={m.listing.id} m={m} />
          ))}
        </div>
        {result.picks.length > shown && (
          <button type="button" className="btn" onClick={() => setShown(n => n + 8)}>
            Show more ({result.picks.length - shown})
          </button>
        )}
      </section>

      {result.gaps.length > 0 && (
        <section>
          <h2 className="section-title">Your learning roadmap</h2>
          <p className="muted">The fastest way to more and better matches, in order.</p>
          <ol className="roadmap">
            {result.gaps.map(g => (
              <li key={g.skill}>
                <p>
                  <strong>Learn {g.skill}</strong> <span className="muted">· asked for by {g.count} of your closest matches</span>
                </p>
                {g.courses.length ? (
                  <div className="matches">
                    {g.courses.map(m => (
                      <MatchRow key={m.listing.id} m={m} />
                    ))}
                  </div>
                ) : (
                  <p className="muted">No course for this is listed yet.</p>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {tips.length > 0 && (
        <section className="panel">
          <h2 className="section-title">Make your profile work harder</h2>
          <ul className="tips">
            {tips.map(t => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <Link to="/profile" className="btn btn--small">Update profile</Link>
        </section>
      )}
      <p className="muted small">Matched on your device from the details you typed. No resume is read and no AI is involved. A match is a guide, not a promise.</p>
    </div>
  );
}

// ---------------------------------------------------------------- Applications

const STATUS_WORD: Record<string, string> = {
  applied: 'Applied',
  reviewing: 'In review',
  interview: 'Interview',
  accepted: 'Selected',
  rejected: 'Not selected',
};

const fmtDate = (iso: string): string => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

function Applications() {
  const mine = useAsync(() => api<MyResponse>('/my'), []);
  const open = useAsync(() => api<PostedListing[]>('/listings?type=Job,Internship,Course'), []);

  if (mine.state.status === 'loading') return <Spinner />;
  if (mine.state.status === 'error') return <Notice tone="error">{mine.state.message}</Notice>;
  const apps = mine.state.data.applications;
  const applied = new Set(apps.map(a => a.listingId));
  const posted = open.state.status === 'ready' ? open.state.data.filter(l => !applied.has(l.id)) : [];

  return (
    <div className="stack">
      <section>
        <h2 className="section-title">Your applications</h2>
        {apps.length === 0 ? (
          <p className="muted">You have not applied to anything on Fyndr yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Role</th><th>Organization</th><th>Applied</th><th>Resume</th><th>Status</th></tr>
              </thead>
              <tbody>
                {apps.map(a => (
                  <tr key={a.id}>
                    <td>{a.listing?.title ?? 'Closed listing'}</td>
                    <td>{a.listing?.orgName ?? ''}</td>
                    <td>{fmtDate(a.created)}</td>
                    <td>{a.resumeType === 'own' ? 'Uploaded' : 'Fyndr resume'}</td>
                    <td><span className="status" data-status={a.status}>{STATUS_WORD[a.status] ?? a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="section-title">Open on Fyndr</h2>
        <p className="muted">Posted directly by organizations. Apply here instead of on another site.</p>
        {open.state.status === 'loading' && <Spinner />}
        {open.state.status === 'error' && <Notice tone="error">{open.state.message}</Notice>}
        {open.state.status === 'ready' && posted.length === 0 && <p className="muted">Nothing open right now.</p>}
        <div className="cards">
          {posted.map(l => (
            <article key={l.id} className="card">
              <p className="card__kind">{l.type}</p>
              <h3 className="card__title">{l.title}</h3>
              <p className="muted">{l.orgName}{l.orgVerified ? ' · verified' : ''} · {l.location} · {l.pay}</p>
              <Link to={`/apply/${l.id}`} className="btn btn--solid btn--small">Apply</Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------- Profile summary

function ProfileSummary() {
  const { me } = useAuth();
  const { state } = useAsync(() => api<ProfileResponse>('/profile'), []);
  if (state.status === 'loading') return <Spinner />;
  if (state.status === 'error') return <Notice tone="error">{state.message}</Notice>;
  const { profile: p, resume, completion } = state.data;
  const row = (k: string, v: string | number | undefined | null): JSX.Element => (
    <div className="info-row">
      <dt>{k}</dt>
      <dd>{v ? v : <span className="muted">Not added</span>}</dd>
    </div>
  );
  return (
    <div className="stack">
      <div className="panel profile-top">
        {state.data.photo ? <img className="avatar avatar--lg" src={state.data.photo} alt="" /> : <span className="avatar avatar--lg" aria-hidden="true">{state.data.name.slice(0, 1).toUpperCase()}</span>}
        <div>
          <h2 className="section-title">{state.data.name}</h2>
          <p className="muted">{p.headline || state.data.email}</p>
          <div className="meter" role="img" aria-label={`Profile ${completion}% complete`}><i style={{ width: `${completion}%` }} /></div>
          <p className="muted small">{completion}% complete</p>
        </div>
        <Link to="/profile" className="btn btn--small">Edit profile</Link>
      </div>
      <dl className="info">
        {row('Email', state.data.email)}
        {row('Phone', me?.phoneVerified ? `Verified ${me.phoneMasked ?? ''}` : null)}
        {row('Qualification', p.qualification)}
        {row('Field', p.field)}
        {row('Institution', p.institution)}
        {row('Graduation', p.gradYear)}
        {row('Experience', p.experience)}
        {row('Looking for', (p.jobTypes ?? []).join(', '))}
        {row('Places', p.locations)}
        {row('Resume file', resume?.name)}
      </dl>
      {(p.skills ?? []).length > 0 && (
        <ul className="chips" aria-label="Skills">
          {(p.skills ?? []).map(s => <li key={s} className="chip">{s}</li>)}
        </ul>
      )}
    </div>
  );
}
