import type { CatalogFile, CategoryKey, CourseRow, JobRow, Kind, Listing } from '../types';
import { groupCourses, groupJobs } from './group';

export interface CityCount {
  name: string;
  count: number;
}

export interface Catalog {
  listings: readonly Listing[];
  byId: ReadonlyMap<string, Listing>;
  /** Cities that have at least one job or internship card, biggest first. */
  cities: readonly CityCount[];
  /** Old per-row ids mapped to the new grouped ids (used to migrate saved items). */
  legacy: ReadonlyMap<string, string>;
}

function isCatalogFile<T>(data: unknown): data is CatalogFile<T> {
  return typeof data === 'object' && data !== null && Array.isArray((data as { rows?: unknown }).rows);
}

async function fetchRows<T>(file: string): Promise<T[]> {
  const res = await fetch(import.meta.env.BASE_URL + file);
  if (!res.ok) throw new Error(`Could not load ${file} (HTTP ${res.status}). Make sure public/catalog/ is deployed.`);
  const data: unknown = await res.json();
  if (!isCatalogFile<T>(data)) throw new Error(`${file} is not a catalog file.`);
  return data.rows;
}

function build(courses: ReturnType<typeof groupCourses>, jobs: ReturnType<typeof groupJobs>): Catalog {
  // Jobs and courses are mixed in a fixed pseudo-random order so "All" is not 1,700 jobs followed by 1,350 courses.
  const listings = [...jobs.list, ...courses.list].sort((a, b) => b.order - a.order);
  const byId = new Map(listings.map(l => [l.id, l] as const));
  const counts = new Map<string, number>();
  for (const l of listings) {
    if (l.city) counts.set(l.city, (counts.get(l.city) ?? 0) + 1);
  }
  const cities = [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  return { listings, byId, cities, legacy: new Map([...courses.legacy, ...jobs.legacy]) };
}

let loading: Promise<Catalog> | null = null;

/** Fetches and groups the built-in catalog once, then keeps it in memory. A failed load can be retried. */
export function loadCatalog(): Promise<Catalog> {
  loading ??= Promise.all([
    fetchRows<CourseRow>('catalog/catalog-courses.json').then(groupCourses),
    fetchRows<JobRow>('catalog/catalog-jobs.json').then(groupJobs),
  ])
    .then(([courses, jobs]) => build(courses, jobs))
    .catch((err: unknown) => {
      loading = null;
      throw err;
    });
  return loading;
}

// ---------------- search ----------------

export const REMOTE = 'remote';

export interface SearchQuery {
  text: string;
  /** Empty means every kind. */
  kinds: readonly Kind[];
  /** A city name, REMOTE, or '' for anywhere. Courses are online, so a place hides them. */
  city: string;
  category: CategoryKey | '';
  /** Only courses with a free option. */
  freeOnly: boolean;
}

export interface SearchResult {
  items: Listing[];
  /** How many match the text, city and category, per kind (ignores the kind filter, so the tabs can show them). */
  counts: Record<Kind, number>;
}

export const EMPTY_QUERY: SearchQuery = { text: '', kinds: [], city: '', category: '', freeOnly: false };

const words = (q: string): string[] => q.toLowerCase().split(/[^a-z0-9+#.]+/).filter(Boolean);

function score(l: Listing, ws: readonly string[], phrase: string): number {
  const title = l.title.toLowerCase();
  let s = title.includes(phrase) ? 3 : 0;
  for (const w of ws) if (title.includes(w)) s += 1;
  if (ws[0] !== undefined && title.startsWith(ws[0])) s += 1;
  return s;
}

export function search(all: readonly Listing[], q: SearchQuery): SearchResult {
  const ws = words(q.text);
  const phrase = q.text.trim().toLowerCase();
  const hits: { l: Listing; s: number }[] = [];
  for (const l of all) {
    if (q.category && l.category !== q.category) continue;
    if (q.freeOnly && !(l.kind === 'course' && l.free)) continue;
    if (q.city) {
      if (l.kind === 'course') continue;
      if (q.city === REMOTE ? !l.remote : l.city !== q.city) continue;
    }
    if (ws.length && !ws.every(w => l.hay.includes(w))) continue;
    hits.push({ l, s: ws.length ? score(l, ws, phrase) : 0 });
  }
  if (ws.length) hits.sort((a, b) => b.s - a.s); // stable: ties keep the catalog order
  const counts: Record<Kind, number> = { job: 0, internship: 0, course: 0 };
  for (const h of hits) counts[h.l.kind] += 1;
  const items = hits.filter(h => q.kinds.length === 0 || q.kinds.includes(h.l.kind)).map(h => h.l);
  return { items, counts };
}
