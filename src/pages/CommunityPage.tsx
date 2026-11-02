import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ChatRoom } from '../components/ChatRoom';
import { AreaField, Notice, Spinner, TextField } from '../components/Form';
import { errorText } from '../lib/api';
import { useAuth } from '../lib/auth';
import { createCommunity, listCommunities, listMembers, setMembership, whoAmI, wipeRoom, type Community, type Person } from '../lib/db';
import { Link, navigate } from '../lib/router';

export function CommunityPage({ id }: { id: string }) {
  const auth = useAuth();
  const [me, setMe] = useState<Person | null>(null);
  const [rooms, setRooms] = useState<Community[] | null>(null);
  const [err, setErr] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [find, setFind] = useState('');

  const load = useCallback(async (): Promise<void> => {
    try { setMe(await whoAmI()); setRooms(await listCommunities()); setErr(''); } catch (e) { setErr(errorText(e)); setRooms([]); }
  }, []);
  useEffect(() => { void load(); }, [load, auth.user?.uid]);

  const current = rooms?.find(r => r.id === id) ?? null;
  useEffect(() => { if (id && current?.joined) listMembers(id).then(setMembers, () => setMembers([])); }, [id, current?.joined, current?.memberCount]);

  const act = async (fn: () => Promise<unknown>): Promise<void> => { try { await fn(); await load(); } catch (e) { setErr(errorText(e)); } };
  const create = (e: FormEvent): void => {
    e.preventDefault();
    void (async () => { try { const cid = await createCommunity(name, desc); setName(''); setDesc(''); await load(); navigate(`/community/${cid}`); } catch (x) { setErr(errorText(x)); } })();
  };

  const shown = (rooms ?? []).filter(r => `${r.name} ${r.desc}`.toLowerCase().includes(find.toLowerCase()));

  return (
    <div className="page">
      <header className="page-head">
        <h1 className="page-head__title">Community</h1>
        <p className="page-head__lead">Open spaces for freshers, learners and job seekers. Join one, ask questions, share what worked.</p>
      </header>
      {err && <Notice tone="error">{err}</Notice>}
      {rooms === null ? <Spinner /> : (
        <div className="split">
          <aside className="card" aria-label="Communities">
            <input className="input" placeholder="Find a community" value={find} onChange={e => setFind(e.target.value)} aria-label="Find a community" style={{ width: '100%', marginBottom: '.7rem' }} />
            <div className="rooms">
              {shown.map(r => (
                <Link key={r.id} to={`/community/${r.id}`} className="room" aria-current={r.id === id ? 'page' : undefined}>
                  <b>{r.name}</b><small>{r.memberCount} {r.memberCount === 1 ? 'member' : 'members'}{r.joined ? ' · joined' : ''}</small>
                </Link>
              ))}
              {shown.length === 0 && <p style={{ color: 'var(--ink-soft)' }}>No communities yet. Start the first one.</p>}
            </div>
            <form onSubmit={create} className="form-grid" style={{ marginTop: '1rem' }}>
              <h2 style={{ fontSize: '1rem' }}>Start a community</h2>
              <TextField label="Name" value={name} onChange={e => setName(e.target.value)} maxLength={60} required />
              <AreaField label="What is it about?" value={desc} onChange={e => setDesc(e.target.value)} maxLength={300} rows={2} />
              <button type="submit" className="btn btn--solid">Create</button>
            </form>
          </aside>
          <section className="card" aria-live="polite">
            {!current || !me ? (
              <div className="empty"><p className="empty__title">Pick a community</p><p className="empty__text">Choose one on the left to read and post.</p></div>
            ) : (
              <>
                <div className="chat__head">
                  <div>
                    <h2 style={{ fontSize: '1.2rem' }}>{current.name}</h2>
                    <p style={{ color: 'var(--ink-soft)', fontSize: '.9rem' }}>{current.desc || 'No description.'} · by {current.creatorName}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '.5rem', alignItems: 'start' }}>
                    {current.joined ? (
                      current.creatorId === me.uid
                        ? <button type="button" className="btn btn--small" onClick={() => { if (window.confirm('Delete this community and its messages?')) void act(async () => { await wipeRoom('communities', id); navigate('/community'); }); }}>Delete</button>
                        : <button type="button" className="btn btn--small" onClick={() => void act(() => setMembership(id, false))}>Leave</button>
                    ) : <button type="button" className="btn btn--orange btn--small" onClick={() => void act(() => setMembership(id, true))}>Join</button>}
                  </div>
                </div>
                {current.joined && members.length > 0 && <ul className="members" aria-label="Members">{members.slice(0, 30).map((m, i) => <li key={i}>{m}</li>)}{members.length > 30 && <li>+{members.length - 30}</li>}</ul>}
                <ChatRoom kind="communities" id={id} me={me} canPost={current.joined} isLeader={current.creatorId === me.uid} />
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
