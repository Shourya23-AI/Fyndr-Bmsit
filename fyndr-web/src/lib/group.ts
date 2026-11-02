// Turns the compact catalog rows (public/catalog/*.json) into ONE listing per course topic or job role.
//
// The rows are "topic x provider" (23,778) and "role x job board x city" (8,657) combinations. Shown as they are they would be
// near-duplicates, so every topic or role becomes a single listing that carries its provider or board links.
//
// HONEST NOTE: these listings are SEARCH LINKS. Each button opens that site's own search page. Fyndr has not checked any page behind them.
import type { CourseRow, JobRow, Level, Listing, PayTier, SourceLink } from '../types';
import { asCategory } from './categories';
import { BOARDS, NATION, PROVIDERS, boardUrl } from './meta';

const h32 = (s: string): number => {
  let h = 2166136261;
  for (const c of s) {
    h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  }
  return h;
};

/** Stable ids: the same role or topic always gets the same id, so saved items survive a rebuild of the catalog. Same scheme as the old site. */
export const groupId = (kind: 'c' | 'j', text: string): string => 'cat_g' + kind + '_' + h32(text.toLowerCase()).toString(36);

export interface Grouped {
  list: Listing[];
  /** Old per-row ids ("cat_c123") mapped to the id of the grouped listing that replaced them. */
  legacy: Map<string, string>;
}

export function tierOf(pay: string): PayTier {
  if (/^free\s*·/i.test(pay) || pay === 'Free') return 'free';
  if (/^free to search/i.test(pay)) return 'search';
  if (/^free/i.test(pay)) return 'freemium';
  return 'paid';
}

const RANK: Record<PayTier, number> = { free: 0, freemium: 1, paid: 2, search: 3 };
const hasCertificate = (pay: string): boolean => /certificate|badge/i.test(pay);

export const TIER_LABEL: Record<PayTier, string> = {
  free: 'Free',
  freemium: 'Free to start',
  paid: 'Paid or trial',
  search: 'Search only',
};

const asLevel = (flag: string | undefined): Level => (flag === 'u' || flag === 'p' ? flag : 'a');
/** Only used to mix the catalog in a stable order. */
const mixOrder = (index: number, k: number): number => (index * k) % 2592000;
const unique = (taken: Set<string>, id: string): string => {
  let out = id;
  while (taken.has(out)) out += 'x';
  taken.add(out);
  return out;
};
const csv = (s: string | undefined): string[] => (s ? s.split(',').filter(Boolean) : []);

// ---------------- courses ----------------

interface CourseAcc {
  topic: string;
  category: string;
  level: Level;
  skills: string;
  providers: Set<number>;
  first: number;
  rows: number[];
}

const COURSE_BEST_FOR: Record<Level, string[]> = {
  u: ['UG students (first to third year)', 'Interns who need the basics'],
  p: ['PG students and final-year UG', 'Interns who need it for a project'],
  a: ['UG and PG students', 'Interns and fresh graduates'],
};

function courseListing(a: CourseAcc, id: string): Listing {
  const links: SourceLink[] = [];
  for (const pi of a.providers) {
    const p = PROVIDERS[pi];
    if (!p) continue;
    links.push({ name: p[0], url: p[4](a.topic), tier: tierOf(p[2]), certificate: hasCertificate(p[2]), pay: p[2], duration: p[3], what: p[5] });
  }
  // Free ones first, otherwise the order of the catalog (sort is stable).
  links.sort((x, y) => RANK[x.tier ?? 'search'] - RANK[y.tier ?? 'search']);
  const free = links.some(x => x.tier === 'free' || x.tier === 'freemium');
  const allFree = links.length > 0 && links.every(x => x.tier === 'free');
  const certificate = links.some(x => x.certificate);
  const sources = links.map(x => x.name);
  const skills = csv(a.skills);
  return {
    id,
    kind: 'course',
    title: a.topic,
    sources,
    location: 'Online, self-paced',
    city: null,
    remote: true,
    category: asCategory(a.category),
    skills,
    pay: allFree ? 'Free (certificate may cost extra)' : free ? 'Free and paid options' : 'Paid, check the current price',
    duration: 'Self-paced, varies by course',
    summary: `Compare ${a.topic} courses on ${links.length} learning sites. Each button opens that site's own search for this topic, so you can pick the level and teacher you like.`,
    bestFor: COURSE_BEST_FOR[a.level],
    whatYouGet: [
      free ? 'Free learning material on several sites' : 'A structured paid or trial course',
      certificate ? 'An optional certificate on some sites' : 'A skill you can show in projects',
      'Learn at your own pace',
    ],
    links,
    free,
    allFree,
    certificate,
    level: a.level,
    order: mixOrder(a.first, 2654435761),
    hay: [a.topic, sources.join(' '), skills.join(' ')].join(' ').toLowerCase(),
  };
}

export function groupCourses(rows: readonly CourseRow[]): Grouped {
  const by = new Map<string, CourseAcc>();
  rows.forEach((r, i) => {
    const [topic, provider, category, level, skills] = r;
    let g = by.get(topic);
    if (!g) {
      g = { topic, category, level: asLevel(level), skills: skills ?? '', providers: new Set<number>(), first: i, rows: [] };
      by.set(topic, g);
    }
    g.providers.add(provider);
    g.rows.push(i);
  });
  const taken = new Set<string>();
  const legacy = new Map<string, string>();
  const list: Listing[] = [];
  for (const g of by.values()) {
    const id = unique(taken, groupId('c', g.topic));
    g.rows.forEach(i => legacy.set('cat_c' + i, id));
    list.push(courseListing(g, id));
  }
  return { list, legacy };
}

// ---------------- jobs and internships ----------------

/** The words typed into a job board for a role: "Data Analyst Intern" becomes "Data Analyst intern". */
export const searchFor = (title: string, intern: boolean): string =>
  intern ? title.replace(/ Intern$/, '') + ' intern' : title.replace(/ \(Fresher\)$/, '') + ' fresher';

/** Boards we always offer for a role, best first (indexes into BOARDS). */
const MAIN: Record<'intern' | 'job', readonly number[]> = { intern: [3, 0, 2, 1, 4, 5, 15], job: [0, 2, 1, 4, 5, 8, 7] };

interface JobAcc {
  title: string;
  intern: boolean;
  category: string;
  skills: string;
  boards: Set<number>;
  city: string | null;
  first: number;
  rows: number[];
}

function jobListing(a: JobAcc, id: string): Listing {
  const query = searchFor(a.title, a.intern);
  const boardIndexes = [...new Set([...MAIN[a.intern ? 'intern' : 'job'], ...a.boards])];
  const place = a.city ?? NATION;
  const links: SourceLink[] = [];
  for (const bi of boardIndexes) {
    const board = BOARDS[bi];
    if (board) links.push({ name: board[0], url: boardUrl(bi, query, place) });
  }
  const sources = links.map(x => x.name);
  const skills = csv(a.skills);
  return {
    id,
    kind: a.intern ? 'internship' : 'job',
    title: a.title,
    sources,
    location: a.city ?? 'All India and remote',
    city: a.city,
    remote: a.city === null,
    category: asCategory(a.category),
    skills,
    pay: a.intern ? 'Stipend varies, check the listing' : 'Salary varies, check the listing',
    duration: a.intern ? '1 to 6 months, usually' : '',
    summary: `${a.title} openings on ${links.length} job boards. Each button opens that board's live search for this role, because openings change every day.`,
    bestFor: a.intern
      ? ['UG students looking for a first internship', 'PG students', 'Final-year students']
      : ['Final-year students', 'Fresh graduates', 'PG students'],
    whatYouGet: a.intern
      ? ['Hands-on experience', 'A certificate or letter in many cases', 'A possible full-time offer']
      : ['A first full-time role', 'On-the-job training'],
    links,
    free: false,
    allFree: false,
    certificate: false,
    level: 'a',
    order: mixOrder(a.first, 40503),
    hay: [a.title, a.city ?? '', sources.join(' '), skills.join(' ')].join(' ').toLowerCase(),
  };
}

export function groupJobs(rows: readonly JobRow[]): Grouped {
  const by = new Map<string, JobAcc>();
  rows.forEach((r, i) => {
    const [title, kind, board, city, category, skills] = r;
    const key = title + '|' + (city ?? '');
    let g = by.get(key);
    if (!g) {
      g = { title, intern: kind === 'i', category, skills: skills ?? '', boards: new Set<number>(), city: city ? city : null, first: i, rows: [] };
      by.set(key, g);
    }
    g.boards.add(board);
    g.rows.push(i);
  });
  const taken = new Set<string>();
  const legacy = new Map<string, string>();
  const list: Listing[] = [];
  for (const g of by.values()) {
    const id = unique(taken, groupId('j', g.title + '|' + (g.city ?? '')));
    g.rows.forEach(i => legacy.set('cat_j' + i, id));
    list.push(jobListing(g, id));
  }
  return { list, legacy };
}

