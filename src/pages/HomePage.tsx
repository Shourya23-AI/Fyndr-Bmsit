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
      <section className="hero2" aria-labelledby="hero-title">
        <div className="rise">
          <span className="hero2__eyebrow">Jobs · Courses · Growth</span>
          <h1 id="hero-title" className="hero2__title">
            Find your path. <em>Grow faster.</em>
          </h1>
          <p className="hero2__lead">
            One search for jobs, internships and courses. Fyndr shows where to look on LinkedIn, Naukri, Internshala, Coursera, YouTube and more, so you skip the ten open tabs.
          </p>
          <SearchField size="hero" value={text} onChange={setText} label="Search jobs, internships and courses" placeholder="Try “data analyst” or “python”" status={status} />
          <div className="hero2__cta">
            <Link to="/browse" className="btn btn--orange">Find Your Path</Link>
            <Link to="/courses" className="btn btn--navy">Start Learning</Link>
            <Link to="/organizations" className="btn btn--solid">Post a Job</Link>
          </div>
          <p className="hero__try">
            Try{' '}
            {TRY.map((t, i) => (
              <span key={t}>
                <button type="button" className="linklike" onClick={() => setText(t)}>{t}</button>
                {i < TRY.length - 2 ? ', ' : i === TRY.length - 2 ? ' or ' : '.'}
              </span>
            ))}
          </p>
        </div>
        <div className="hero2__media rise">
          <img className="hero2__photo" src={`${import.meta.env.BASE_URL}brand/hero.jpg`} alt="A team of young professionals working together in a bright office" width={1310} height={780} />
          <div className="float float--a"><span className="float__dot" style={{ background: 'var(--kind-course)' }}>▶</span><span>Free courses<small>from top platforms</small></span></div>
          <div className="float float--b"><span className="float__dot" style={{ background: 'var(--orange)' }}>★</span><span>Fresher jobs<small>across India</small></span></div>
        </div>
      </section>

      <section className="stats" aria-label="At a glance">
        <div className="stat"><b>{state.status === 'ready' ? formatCount(state.catalog.listings.length) : '…'}</b><span>listings to search</span></div>
        <div className="stat"><b>3</b><span>kinds: jobs, internships, courses</span></div>
        <div className="stat"><b>Free</b><span>to search and save</span></div>
        <div className="stat"><b>1</b><span>box for everything</span></div>
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

      <h2 className="sec-title">Where to next?</h2>
      <section className="cards3">
        <Link to="/courses" className="fcard"><img src={`${import.meta.env.BASE_URL}brand/card-courses.jpg`} alt="" loading="lazy" /><div className="fcard__body"><h3>Courses</h3><p>Learn online: coding, design, data and more.</p></div></Link>
        <Link to="/jobs" className="fcard"><img src={`${import.meta.env.BASE_URL}brand/card-jobs.jpg`} alt="" loading="lazy" /><div className="fcard__body"><h3>Jobs and internships</h3><p>Fresher roles by city, with the best sites first.</p></div></Link>
        <Link to="/library" className="fcard"><img src={`${import.meta.env.BASE_URL}brand/card-search.jpg`} alt="" loading="lazy" /><div className="fcard__body"><h3>Library and resources</h3><p>Guides, cheat sheets and free books.</p></div></Link>
      </section>
    </div>
  );
}
