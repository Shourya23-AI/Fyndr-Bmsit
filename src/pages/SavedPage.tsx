import { useMemo } from 'react';
import { ResultList, ResultSkeleton } from '../components/ResultList';
import { formatCount, plural } from '../lib/format';
import { Link } from '../lib/router';
import { useSaved } from '../lib/saved';
import { useCatalog } from '../lib/useCatalog';
import type { Listing } from '../types';

export function SavedPage() {
  const state = useCatalog();
  const saved = useSaved();

  const items = useMemo<Listing[]>(() => {
    if (state.status !== 'ready') return [];
    const byId = state.catalog.byId;
    return saved.ids.flatMap(id => {
      const l = byId.get(id);
      return l ? [l] : [];
    });
  }, [state, saved.ids]);

  return (
    <div className="page">
      <header className="page-head">
        <h1 className="page-head__title">Saved</h1>
        <p className="page-head__lead">
          {state.status === 'ready'
            ? `${formatCount(items.length)} ${plural(items.length, 'item', 'items')} saved on this device.`
            : 'Items you save are kept on this device. Sign in (coming in Part 2) to keep them in your account.'}
        </p>
      </header>
      {state.status === 'loading' && <ResultSkeleton rows={3} />}
      {state.status === 'error' && (
        <div className="empty">
          <p className="empty__title">Your saved items did not load.</p>
          <button type="button" className="btn" onClick={state.retry}>
            Try again
          </button>
        </div>
      )}
      {state.status === 'ready' &&
        (items.length > 0 ? (
          <ResultList items={items} initial={50} />
        ) : (
          <div className="empty">
            <p className="empty__title">Nothing saved yet.</p>
            <p className="empty__text">Use the bookmark on any card to keep it here.</p>
            <Link to="/browse" className="btn btn--solid">
              Browse listings
            </Link>
          </div>
        ))}
    </div>
  );
}
