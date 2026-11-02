import { useEffect, useMemo, useState } from 'react';
import { SearchField } from '../components/SearchField';
import { Notice, Spinner } from '../components/Form';
import { RESOURCES, TYPE_LABEL, type ResType } from '../data/resources';
import { FIND_ELSEWHERE, searchBooks, type Book } from '../lib/books';
import { useDebounced } from '../lib/useDebounced';

type Tab = 'resources' | 'books';
const TYPES: readonly (ResType | 'all')[] = ['all', 'guide', 'cheatsheet', 'study', 'interview', 'career'];

export function LibraryPage() {
  const [tab, setTab] = useState<Tab>('resources');
  const [text, setText] = useState('');
  const [type, setType] = useState<ResType | 'all'>('all');
  const q = useDebounced(text, 400);

  const items = useMemo(() => {
    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    return RESOURCES.filter(r => (type === 'all' || r.type === type) && words.every(w => `${r.title} ${r.topic} ${r.source} ${r.blurb} ${r.tags.join(' ')}`.toLowerCase().includes(w)));
  }, [text, type]);

  return (
    <div className="page">
      <header className="page-head">
        <h1 className="page-head__title">Library and resources</h1>
        <p className="page-head__lead">Guides, cheat sheets and study material, plus free books from Open Library and Project Gutenberg. Everything opens on its owner's site.</p>
      </header>
      <div className="bar">
        <div className="seg" role="group" aria-label="Library section">
          <button type="button" aria-pressed={tab === 'resources'} onClick={() => setTab('resources')}>Resources</button>
          <button type="button" aria-pressed={tab === 'books'} onClick={() => setTab('books')}>Books</button>
        </div>
        <SearchField size="normal" value={text} onChange={setText} label={tab === 'books' ? 'Search books' : 'Search resources'} placeholder={tab === 'books' ? 'Book title or author' : 'Try “python”, “sql” or “resume”'} status={tab === 'resources' ? `${items.length} found` : ''} />
      </div>
      {tab === 'resources' ? (
        <>
          <div className="chips" role="group" aria-label="Type" style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', margin: '.6rem 0' }}>
            {TYPES.map(t => (
              <button key={t} type="button" className="chip" aria-pressed={type === t} onClick={() => setType(t)} style={type === t ? { background: 'var(--cobalt)', color: '#fff' } : undefined}>
                {t === 'all' ? 'All' : TYPE_LABEL[t]}
              </button>
            ))}
          </div>
          {items.length === 0 ? (
            <div className="empty"><p className="empty__title">Nothing matches “{text}”.</p><p className="empty__text">Try the Books tab, or a shorter word.</p></div>
          ) : (
            <div className="cols">
              {items.map(r => (
                <a key={r.id} className="rcard rise" href={r.url} target="_blank" rel="noopener noreferrer">
                  <div className="rcard__top"><span className="pill">{TYPE_LABEL[r.type]}</span><span className="pill pill--teal">{r.free ? 'Free' : 'Paid'}</span></div>
                  <h3>{r.title}</h3>
                  <p>{r.blurb}</p>
                  <small style={{ color: 'var(--ink-soft)' }}>{r.source} · {r.topic} ↗</small>
                </a>
              ))}
            </div>
          )}
        </>
      ) : (
        <Books q={q.trim()} />
      )}
    </div>
  );
}

function Books({ q }: { q: string }) {
  const [state, setState] = useState<{ s: 'idle' | 'loading' | 'ok' | 'err'; books: Book[]; msg: string }>({ s: 'idle', books: [], msg: '' });
  useEffect(() => {
    if (q.length < 2) { setState({ s: 'idle', books: [], msg: '' }); return; }
    const ctl = new AbortController();
    setState(p => ({ ...p, s: 'loading' }));
    searchBooks(q, ctl.signal).then(
      books => setState({ s: 'ok', books, msg: '' }),
      (e: unknown) => { if (!ctl.signal.aborted) setState({ s: 'err', books: [], msg: e instanceof Error ? e.message : 'Search failed' }); },
    );
    return () => ctl.abort();
  }, [q]);

  if (state.s === 'idle') return <div className="empty"><p className="empty__title">Search for a book.</p><p className="empty__text">Type a title, author or subject above.</p></div>;
  return (
    <>
      {state.s === 'loading' && <Spinner />}
      {state.s === 'err' && <Notice tone="error">{state.msg}</Notice>}
      <div className="cols">
        {state.books.map(b => (
          <a key={b.source + b.id} className="rcard bookcard rise" href={b.url} target="_blank" rel="noopener noreferrer">
            {b.cover ? <img src={b.cover} alt="" loading="lazy" /> : <div className="bookcard__ph" aria-hidden="true" />}
            <div>
              <span className={b.free ? 'pill pill--teal' : 'pill pill--orange'}>{b.free ? 'Free to read' : 'Borrow / details'}</span>
              <h3 style={{ marginTop: '.4rem' }}>{b.title}</h3>
              <p>{b.author}{b.year ? ` · ${b.year}` : ''}</p>
              <small style={{ color: 'var(--ink-soft)' }}>{b.source} ↗</small>
            </div>
          </a>
        ))}
      </div>
      {state.s === 'ok' && state.books.length === 0 && <div className="empty"><p className="empty__title">No books found for “{q}”.</p></div>}
      <h2 className="sec-title">Also look here</h2>
      <p style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
        {FIND_ELSEWHERE.map(([name, what, fn]) => (
          <a key={name} className="btn btn--small" href={fn(q)} target="_blank" rel="noopener noreferrer">{name} <small>({what})</small></a>
        ))}
      </p>
    </>
  );
}
