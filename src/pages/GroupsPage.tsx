import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ChatRoom } from '../components/ChatRoom';
import { AreaField, Notice, Spinner, TextField } from '../components/Form';
import { errorText } from '../lib/api';
import { useAuth } from '../lib/auth';
import { changeMember, createGroup, listGroups, whoAmI, wipeRoom, type Group, type Person } from '../lib/db';
import { Link, navigate } from '../lib/router';

export function GroupsPage({ id }: { id: string }) {
  const auth = useAuth();
  const [me, setMe] = useState<Person | null>(null);
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [err, setErr] = useState('');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [email, setEmail] = useState('');

  const load = useCallback(async (): Promise<void> => {
    try { setMe(await whoAmI()); setGroups(await listGroups()); setErr(''); } catch (e) { setErr(errorText(e)); setGroups([]); }
  }, []);
  useEffect(() => { void load(); }, [load, auth.user?.uid]);

  const g = groups?.find(x => x.id === id) ?? null;
  const leader = !!(g && me && g.leaderId === me.uid);
  const act = async (fn: () => Promise<unknown>): Promise<void> => { try { await fn(); await load(); } catch (e) { setErr(errorText(e)); } };
  const create = (e: FormEvent): void => {
    e.preventDefault();
    void (async () => { try { const gid = await createGroup(name, desc); setName(''); setDesc(''); await load(); navigate(`/groups/${gid}`); } catch (x) { setErr(errorText(x)); } })();
  };

  return (
    <div className="page">
      <header className="page-head">
        <h1 className="page-head__title">Groups</h1>
        <p className="page-head__lead">Private cohorts and study groups. Only the leader adds people, by email. Only members can read or post.</p>
      </header>
      {err && <Notice tone="error">{err}</Notice>}
      {groups === null ? <Spinner /> : (
        <div className="split">
          <aside className="card" aria-label="Your groups">
            <div className="rooms">
              {groups.map(x => (
                <Link key={x.id} to={`/groups/${x.id}`} className="room" aria-current={x.id === id ? 'page' : undefined}>
                  <b>{x.name}</b><small>{x.members.length} {x.members.length === 1 ? 'person' : 'people'}</small>
                </Link>
              ))}
              {groups.length === 0 && <p style={{ color: 'var(--ink-soft)' }}>You are not in any group yet.</p>}
            </div>
            <form onSubmit={create} className="form-grid" style={{ marginTop: '1rem' }}>
              <h2 style={{ fontSize: '1rem' }}>Create a group</h2>
              <TextField label="Name" value={name} onChange={e => setName(e.target.value)} maxLength={60} required />
              <AreaField label="Purpose" value={desc} onChange={e => setDesc(e.target.value)} maxLength={300} rows={2} />
              <button type="submit" className="btn btn--solid">Create</button>
            </form>
          </aside>
          <section className="card">
            {!g || !me ? (
              <div className="empty"><p className="empty__title">Pick a group</p><p className="empty__text">Choose one on the left, or create your own.</p></div>
            ) : (
              <>
                <div className="chat__head">
                  <div>
                    <h2 style={{ fontSize: '1.2rem' }}>{g.name}</h2>
                    <p style={{ color: 'var(--ink-soft)', fontSize: '.9rem' }}>{g.desc || 'No description.'} · led by {g.leaderName}</p>
                  </div>
                  {leader
                    ? <button type="button" className="btn btn--small" onClick={() => { if (window.confirm('Delete this group and its messages?')) void act(async () => { await wipeRoom('groups', id); navigate('/groups'); }); }}>Delete</button>
                    : <button type="button" className="btn btn--small" onClick={() => void act(async () => { await changeMember(id, me.email, false); navigate('/groups'); })}>Leave</button>}
                </div>
                <ul className="members" aria-label="Members">
                  {g.members.map(m => (
                    <li key={m}>{m}{leader && m !== g.leaderEmail && <> <button type="button" className="linklike" aria-label={`Remove ${m}`} onClick={() => void act(() => changeMember(id, m, false))}>×</button></>}</li>
                  ))}
                </ul>
                {leader && (
                  <form className="compose" onSubmit={e => { e.preventDefault(); void act(async () => { await changeMember(id, email, true); setEmail(''); }); }}>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Add a member by email" aria-label="Member email" required />
                    <button type="submit" className="btn btn--navy btn--small">Add</button>
                  </form>
                )}
                <ChatRoom kind="groups" id={id} me={me} canPost isLeader={leader} />
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
