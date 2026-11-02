import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { KindTabs, type KindFilter } from '../components/KindTabs';
import { ResultList, ResultSkeleton } from '../components/ResultList';
import { SearchField } from '../components/SearchField';
import { CATEGORIES } from '../lib/categories';
import { REMOTE, search } from '../lib/catalog';
import { formatCount, plural } from '../lib/format';
import { navigate, replaceParams, useRoute } from '../lib/router';
import { useCatalog } from '../lib/useCatalog';
import { useDebounced } from '../lib/useDebounced';
import type { CategoryKey, Kind } from '../types';

const PATH: Record<KindFilter, string> = { all: '/browse', job: '/jobs', internship: '/internships', course: '/courses' };
const NO_COUNTS: Record<Kind, number> = { job: 0, internship: 0, course: 0 };

const COPY: Record<KindFilter, { title: string; lead: string; placeholder: string }> = {
  all: {
    title: 'Browse everything',
    lead: 'Jobs, internships and courses in one list. Pick a tab to narrow it.',
    placeholder: 'A role, a skill or a topic',
  },
  job: {
    title: 'Jobs for freshers',
    lead: 'One card for each role in each city. Every button opens that job board’s own live search.',
    placeholder: 'A role, such as “data analyst” or “accountant”',
  },
  internship: {
    title: 'Internships',
    lead: 'One card for each role in each city, with Internshala, LinkedIn and more a click away.',
    placeholder: 'A role, such as “marketing” or “python”',
  },
  course: {
    title: 'Courses',
    lead: 'One card for each topic, with the free options listed first.',
    placeholder: 'A topic, such as “excel” or “machine learning”',
  },
};

const isCategory = (v: string | null): v is CategoryKey => CATEGORIES.some(c => c.key === v);

export function BrowsePage({ kind }: { kind: KindFilter }) {
  const route = useRoute();
  const state = useCatalog();
  const [text, setText] = useState(route.params.get('q') ?? '');
  const [city, setCity] = useState(route.params.get('city') ?? '');
  const catParam = route.params.get('cat');
  const [category, setCategory] = useState<CategoryKey | ''>(isCategory(catParam) ? catParam : '');
  const [freeOnly, setFreeOnly] = useState(route.params.get('free') === '1');
  const deferred = useDeferredValue(text);

  const showCity = kind !== 'course';
  const showFree = kind === 'course';
  const path = PATH[kind];

  // Keep the address bar in step with the filters so a search can be bookmarked or shared.
  const settled = useDebounced({ text, city, category, freeOnly }, 300);
  useEffect(() => {
    replaceParams(path, {
      q: settled.text.trim(),
      city: showCity ? settled.city : '',
      cat: settled.category,
      free: showFree && settled.freeOnly ? '1' : undefined,
    });
  }, [settled, path, showCity, showFree]);

  const result = useMemo(
    () =>
      state.status === 'ready'
        ? search(state.catalog.listings, {
            text: deferred,
            kinds: kind === 'all' ? [] : [kind],
            city: showCity ? city : '',
            category,
            freeOnly: showFree && freeOnly,
          })
        : null,
    [state, deferred, kind, city, category, freeOnly, showCity, showFree],
  );

  const changeKind = (next: KindFilter): void =>
    navigate(PATH[next], { q: text.trim(), city: next === 'course' ? '' : city, cat: category, free: next === 'course' && freeOnly ? '1' : undefined });

  const copy = COPY[kind];
  const total = result?.items.length ?? 0;
  const cities = state.status === 'ready' ? state.catalog.cities : [];

  return (
    <div className="page">
      <header className="page-head">
        <h1 className="page-head__title">{copy.title}</h1>
        <p className="page-head__lead">{copy.lead}</p>
      </header>

      <SearchField value={text} onChange={setText} label={`Search ${copy.title.toLowerCase()}`} placeholder={copy.placeholder} />

      <div className="controls">
        <KindTabs value={kind} counts={result?.counts ?? NO_COUNTS} onChange={changeKind} />
        <div className="filters">
          <label className="select">
            <span>Field</span>
            <select value={category} onChange={e => setCategory(isCategory(e.target.value) ? e.target.value : '')}>
              <option value="">Any field</option>
              {CATEGORIES.map(c => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          {showCity && (
            <label className="select">
              <span>Place</span>
              <select value={city} onChange={e => setCity(e.target.value)}>
                <option value="">Anywhere</option>
                <option value={REMOTE}>All India and remote</option>
                {cities.map(c => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({formatCount(c.count)})
                  </option>
                ))}
              </select>
            </label>
          )}
          {showFree && (
            <label className="check">
              <input type="checkbox" checked={freeOnly} onChange={e => setFreeOnly(e.target.checked)} />
              <span>Only topics with a free option</span>
            </label>
          )}
        </div>
      </div>

      <p className="results-meta" aria-live="polite">
        {result ? (
          <>
            {formatCount(total)} {plural(total, 'result', 'results')}
            {deferred.trim() ? <> for “{deferred.trim()}”</> : null}
          </>
        ) : (
          'Loading'
        )}
      </p>

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
      {result && <ResultList items={result.items} initial={20} step={30} text={deferred} kind={kind} />}
    </div>
  );
}
