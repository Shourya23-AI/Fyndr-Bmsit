import { useDeferredValue, useMemo, useState } from 'react';
import { KindTabs, type KindFilter } from '../components/KindTabs';
import { ResultList, ResultSkeleton } from '../components/ResultList';
import { SearchField } from '../components/SearchField';
import { EMPTY_QUERY, search } from '../lib/catalog';
import { formatCount, plural } from '../lib/format';
import { Link } from '../lib/router';
import { useCatalog } from '../lib/useCatalog';
import type { Kind } from '../types';

const TRY = ['data analyst', 'python', 'ui design', 'accounting'] as const;
const PATH: Record<KindFilter, string> = { all: '/browse', job: '/jobs', internship: '/internships', course: '/courses' };
const NO_COUNTS: Record<Kind, number> = { job: 0, internship: 0, course: 0 };

export function HomePage() {
  const state = useCatalog();
  const [text, setText] = useState('');
  const [kind, setKind] = useState<KindFilter>('all');
  const deferred = useDeferredValue(text);

  const result = useMemo(
    () => (state.status === 'ready' ? search(state.catalog.listings, { ...EMPTY_QUERY, text: deferred, kinds: kind === 'all' ? [] : [kind] }) : null),
    [state, deferred, kind],
  );

  const total = result?.items.length ?? 0;
  const status = result ? `${formatCount(total)} ${plural(total, 'match', 'matches')}` : 'Loading';

  return (
    <div className="page">
      <section className="hero" aria-labelledby="hero-title">
        <h1 id="hero-title" className="hero__title">
          Jobs, internships and courses, searched together.
        </h1>
        <p className="hero__lead">
          Type a role or a skill. Fyndr shows where to look on LinkedIn, Naukri, Internshala, Coursera, YouTube and more, so you do not open ten tabs to start.
        </p>
        <SearchField
          size="hero"
          value={text}
          onChange={setText}
          label="Search jobs, internships and courses"
          placeholder="Try “data analyst” or “python”"
          status={status}
        />
        <p className="hero__try">
          Try{' '}
          {TRY.map((t, i) => (
            <span key={t}>
              <button type="button" className="linklike" onClick={() => setText(t)}>
                {t}
              </button>
              {i < TRY.length - 2 ? ', ' : i === TRY.length - 2 ? ' or ' : '.'}
            </span>
          ))}
        </p>
      </section>

      <section className="home-results" aria-label="Results">
        <KindTabs value={kind} counts={result?.counts ?? NO_COUNTS} onChange={setKind} />
        {state.status === 'loading' && <ResultSkeleton />}
        {state.status === 'error' && (
          <div className="empty">
            <p className="empty__title">The listings did not load.</p>
            <p className="empty__text">{state.message}</p>
            <button type="button" className="btn" onClick={state.retry}>
              Try again
            </button>
          </div>
        )}
        {result && (
          <>
            <ResultList items={result.items} initial={8} text={deferred} kind={kind} />
            {total > 8 && (
              <div className="more">
                <Link to={PATH[kind]} params={{ q: deferred.trim() }} className="btn btn--solid">
                  See all {formatCount(total)} results
                </Link>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
