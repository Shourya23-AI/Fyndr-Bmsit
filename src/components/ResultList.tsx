import { useEffect, useState } from 'react';
import { formatCount } from '../lib/format';
import { courseSearchLinks, jobSearchLinks } from '../lib/meta';
import { useSaved } from '../lib/saved';
import type { Listing } from '../types';
import type { KindFilter } from './KindTabs';
import { ListingRow } from './ListingRow';

interface Props {
  items: readonly Listing[];
  /** How many to show first. */
  initial?: number;
  /** When set, a button reveals this many more. */
  step?: number;
  text?: string;
  kind?: KindFilter;
  /** Shown when the list is empty and nothing was typed. */
  emptyMessage?: string;
}

export function ResultList({ items, initial = 20, step, text = '', kind = 'all', emptyMessage }: Props) {
  const saved = useSaved();
  const [shown, setShown] = useState(initial);
  useEffect(() => setShown(initial), [items, initial]);

  if (items.length === 0) return <NoMatches text={text} kind={kind} message={emptyMessage} />;

  const visible = items.slice(0, shown);
  const left = items.length - visible.length;
  return (
    <>
      <div className="results">
        {visible.map(l => (
          <ListingRow key={l.id} listing={l} saved={saved.has(l.id)} onToggleSaved={saved.toggle} />
        ))}
      </div>
      {step !== undefined && left > 0 && (
        <div className="more">
          <button type="button" className="btn" onClick={() => setShown(n => n + step)}>
            Show {formatCount(Math.min(step, left))} more
          </button>
          <span className="more__left">{formatCount(left)} not shown yet</span>
        </div>
      )}
    </>
  );
}

function NoMatches({ text, kind, message }: { text: string; kind: KindFilter; message: string | undefined }) {
  const q = text.trim();
  if (!q) {
    return (
      <div className="empty">
        <p className="empty__title">{message ?? 'Nothing to show here yet.'}</p>
      </div>
    );
  }
  const links = (kind === 'course' ? courseSearchLinks(q) : jobSearchLinks(q)).slice(0, 6);
  return (
    <div className="empty">
      <p className="empty__title">Nothing in Fyndr matches “{q}”.</p>
      <p className="empty__text">Try a shorter or broader word, such as “developer” or “design”. Or search for exactly what you typed on these sites:</p>
      <ul className="src-list src-list--wrap">
        {links.map(s => (
          <li key={s.name}>
            <a className="src" href={s.url} target="_blank" rel="noopener noreferrer">
              <span className="src__name">{s.name}</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ResultSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="results" aria-busy="true" aria-label="Loading listings">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="row row--skeleton" aria-hidden="true">
          <span className="sk sk--kind" />
          <span className="sk sk--title" />
          <span className="sk sk--line" />
        </div>
      ))}
    </div>
  );
}
