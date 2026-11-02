import { useEffect, useRef, useState } from 'react';
import { Notice } from './Form';
import { errorText } from '../lib/api';
import { react, removePost, sendPost, vote, watchPosts, type Person, type Post, type RoomKind } from '../lib/db';

const EMOJI = ['👍', '❤️', '😂', '🎉'] as const;
const ago = (t: number): string => {
  const m = Math.max(0, Math.round((Date.now() - t) / 60000));
  return m < 1 ? 'now' : m < 60 ? `${m}m` : m < 1440 ? `${Math.round(m / 60)}h` : `${Math.round(m / 1440)}d`;
};

interface Props { kind: RoomKind; id: string; me: Person; canPost: boolean; isLeader: boolean }

export function ChatRoom({ kind, id, me, canPost, isLeader }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [err, setErr] = useState('');
  const [text, setText] = useState('');
  const [reply, setReply] = useState<Post | null>(null);
  const [pollMode, setPollMode] = useState(false);
  const [q, setQ] = useState('');
  const [opts, setOpts] = useState('');
  const [busy, setBusy] = useState(false);
  const log = useRef<HTMLDivElement>(null);

  useEffect(() => watchPosts(kind, id, setPosts, setErr), [kind, id]);
  useEffect(() => { setPosts([]); setReply(null); setPollMode(false); }, [kind, id]);

  const run = async (fn: () => Promise<void>): Promise<void> => {
    setErr('');
    try { await fn(); } catch (e) { setErr(errorText(e)); }
  };

  const submit = async (): Promise<void> => {
    if (busy) return;
    setBusy(true);
    await run(async () => {
      if (pollMode) {
        const list = opts.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 6);
        if (q.trim().length < 3 || list.length < 2) throw new Error('A poll needs a question and at least two options (one per line).');
        await sendPost(kind, id, q.trim(), { poll: { q: q.trim().slice(0, 200), opts: list.map(o => o.slice(0, 80)), multi: false } });
        setPollMode(false); setQ(''); setOpts('');
      } else {
        if (!text.trim()) return;
        await sendPost(kind, id, text, reply ? { reply: { id: reply.id, name: reply.authorName, text: reply.text } } : {});
        setText(''); setReply(null);
      }
    });
    setBusy(false);
  };

  return (
    <div className="chat" aria-label="Messages">
      {err && <Notice tone="error">{err}</Notice>}
      <div className="chat__log" ref={log} role="log" aria-live="polite">
        {posts.length === 0 && <p style={{ color: 'var(--ink-soft)', margin: 'auto' }}>No messages yet. Say hello.</p>}
        {posts.map(p => {
          const mine = p.authorId === me.uid;
          const counts = new Map<string, number>();
          Object.values(p.reactions).filter(Boolean).forEach(e => counts.set(e, (counts.get(e) ?? 0) + 1));
          const total = Object.keys(p.votes).length;
          return (
            <div key={p.id} className={mine ? 'msg msg--mine' : 'msg'}>
              <div className="msg__who">{mine ? 'You' : p.authorName} · {ago(p.t)}</div>
              {p.reply && <div className="msg__quote"><b>{p.reply.name}</b>: {p.reply.text}</div>}
              <div className="msg__text">{p.text}</div>
              {p.poll && (
                <div className="poll">
                  {p.poll.opts.map((o, i) => {
                    const n = Object.values(p.votes).filter(v => v.includes(i)).length;
                    return (
                      <button key={o} type="button" aria-pressed={(p.votes[me.uid] ?? []).includes(i)} disabled={!canPost} onClick={() => void run(() => vote(kind, id, p, i))}>
                        {o} <small>· {n}{total ? ` (${Math.round((n / total) * 100)}%)` : ''}</small>
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="msg__acts">
                {canPost && EMOJI.map(e => (
                  <button key={e} type="button" aria-label={`React ${e}`} onClick={() => void run(() => react(kind, id, p, e))}>{e}{counts.get(e) ? ` ${counts.get(e)}` : ''}</button>
                ))}
                {canPost && <button type="button" onClick={() => setReply(p)}>Reply</button>}
                {(mine || isLeader) && <button type="button" onClick={() => void run(() => removePost(kind, id, p.id))}>Delete</button>}
              </div>
            </div>
          );
        })}
      </div>
      {canPost ? (
        <div>
          {reply && <p className="msg__quote">Replying to {reply.authorName}: {reply.text.slice(0, 60)} <button type="button" className="linklike" onClick={() => setReply(null)}>cancel</button></p>}
          {pollMode ? (
            <div className="compose">
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Poll question" maxLength={200} aria-label="Poll question" />
              <textarea className="input" value={opts} onChange={e => setOpts(e.target.value)} placeholder={'One option per line\n(2 to 6)'} rows={3} aria-label="Poll options" style={{ flex: '1 1 200px' }} />
              <button type="button" className="btn btn--solid" onClick={() => void submit()} disabled={busy}>Post poll</button>
              <button type="button" className="btn" onClick={() => setPollMode(false)}>Cancel</button>
            </div>
          ) : (
            <form className="compose" onSubmit={e => { e.preventDefault(); void submit(); }}>
              <input value={text} onChange={e => setText(e.target.value)} placeholder="Write a message" maxLength={1000} aria-label="Message" />
              <button type="submit" className="btn btn--orange" disabled={busy || !text.trim()}>Send</button>
              <button type="button" className="btn" onClick={() => setPollMode(true)}>Poll</button>
            </form>
          )}
        </div>
      ) : (
        <p className="compose" style={{ color: 'var(--ink-soft)' }}>Join to post a message.</p>
      )}
    </div>
  );
}
